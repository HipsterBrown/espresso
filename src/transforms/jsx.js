module.exports = jsx

var findParentOfType = require('../utils/find-parent-of-type')
var throwError = require('../utils/throw-error')

function jsx (file, api) {
  var j = api.jscodeshift
  var root = j(file.source)

  var REACT_DOM = {
    callee: {
      type: 'MemberExpression'
    }
  }
  var CONTAINS_FACTORY = {
    callee: {
      type: 'MemberExpression',
      property: {
        name: 'createFactory'
      }
    }
  }
  var CONTAINS_ELEMENT = {
    callee: {
      type: 'MemberExpression',
      property: {
        name: 'createElement'
      }
    }
  }

  function getChildren (array) {
    array.shift()
    return array
  }

  function isElement (object) {
    var name
    return object.type === 'CallExpression' &&
      (
        (object.callee.name || object.callee.property.name) === 'createElement' ||
        (name = (object.callee.object && object.callee.object.name)) ? name.match(/D|DOM/) : false
        // ^ logic is a bit wild due to `this` object not having a `name` property, only `type: 'ThisStatement'`
      )
  }

  function isExpression (object) {
    var type
    return object.type === 'CallExpression' &&
      (type = (object.callee && object.callee.object && object.callee.object.type)) ? type.match(/FunctionExpression|ThisExpression/) : false
  }

  function buildJSX (callExp) {
    if (callExp.callee.type !== 'FunctionExpression') {
      var name = callExp.callee.name || callExp.callee.property.name
      var params = callExp.arguments
      var attrs = []
      var children = []

      if (name === 'createElement') {
        name = params[0].name
        params.shift()
      }

      try {
        var el = j.jsxIdentifier(name)
      } catch (e) {
        return throwError(callExp)
      }

      if (params[0] && params[0].properties) {
        attrs = params[0].properties.map(function (prop) {
          var value = j.jsxExpressionContainer(prop.value)

          if (prop.value.type === 'Literal') {
            if (typeof prop.value.value === 'string') {
              value = prop.value
            } else {
              value = j.jsxExpressionContainer(prop.value)
            }
          }

          var jsxAttr = j.jsxAttribute(
            j.jsxIdentifier(prop.key.name || prop.key.value),
            value
          )

          return jsxAttr
        })
      }

      if (params[1] && params[1].elements) {
        children = params[1].elements.map(function (element) {
          if (element.type !== 'JSXElement') {
            if (element.type !== 'CallExpression' && element.type.match(/Expression|Identifier/)) {
              return j.jsxExpressionContainer(element)
            } else if (isExpression(element)) {
              return j.jsxExpressionContainer(element)
            } else if (element.type === 'Literal') {
              return element
            } else {
              return buildJSX(element)
            }
          }
        })
      } else if (params[1]) {
        var childArray = params.length > 2 ? getChildren(params) : [params[1]]

        childArray.forEach(function (child) {
          if (isElement(child)) {
            children.push(
              buildJSX(child)
            )
          } else if (child.type === 'Identifier' || child.type.match(/Expression/) || isExpression(child)) {
            children.push(j.jsxExpressionContainer(child))
          } else {
            children.push(child)
          }
        })
        // check to see if children argument is a createElement function call
      }

      var openingEl = j.jsxOpeningElement(el)
      openingEl.attributes = attrs

      var JSX
      if (children.length > 0) {
        JSX = j.jsxElement(openingEl, j.jsxClosingElement(el))
        JSX.children = children
      } else {
        openingEl.selfClosing = true
        JSX = j.jsxElement(openingEl, null)
      }

      return JSX
    } else {
      var func = callExp.callee
      var hasFor = func.body.body.filter(function (statement) { return statement.type === 'ForStatement' })

      if (hasFor.length > 0) {
        var forStatement = hasFor[0]
        var obj = forStatement.init.expressions[1].right.object
        var argName = obj.name.slice(0, -obj.name.length + 1)
        return j.jsxExpressionContainer(
          j.callExpression(
            j.memberExpression(
              obj,
              j.identifier('map')
            ),
            [j.arrowFunctionExpression(
              [j.identifier(argName)],
              buildJSX(forStatement.body.body[1].expression.arguments[0])
            )]
          )
        )
      }
    }
  }

  root
  .find(j.CallExpression, CONTAINS_FACTORY)
  .forEach(function (p) {
    var parentVar = findParentOfType(p, 'VariableDeclaration')

    if (parentVar && p.node.arguments[0].type === 'Identifier') {
      root
      .find(j.ImportDeclaration)
      .forEach(function (importPath) {
        if (importPath.node.specifiers.length && (importPath.node.specifiers[0].local.name === p.node.arguments[0].name)) {
          importPath.node.specifiers[0].local.name = parentVar.node.declarations[0].id.name
        }
      })
      parentVar.replace()
    }
  })

  root
  .find(j.CallExpression, REACT_DOM)
  .filter(function (p) {
    var obj = p.node.callee.object
    if (obj.type === 'MemberExpression' && obj.object.name === 'React') {
      return true
    } else if (obj.type === 'Identifier' && (obj.name === 'DOM' || obj.name === 'D')) {
      return true
    }
  })
  .replaceWith(function (p) {
    return buildJSX(p.node)
  })

  root
  .find(j.CallExpression, CONTAINS_ELEMENT)
  .filter(function (p) {
    if (Array.isArray(p.parentPath.value)) {
      // check to see if React.createElement is called within React.render
      if (p.parentPath.parentPath.value.type === 'CallExpression' && p.parentPath.parentPath.value.callee.property.name === 'render') {
        return true
      }

      return false
    }

    return true
  })
  .replaceWith(function (p) {
    return buildJSX(p.node)
  })

  root
  .find(j.CallExpression)
  .filter(function (p) {
    var funcName = p.node.callee.name
    if (funcName) {
      var firstLetter = funcName.slice(0, -funcName.length + 1)
      return /[A-Z]/.test(firstLetter)
    }
  })
  .replaceWith(function (p) {
    return buildJSX(p.node)
  })

  return root.toSource()
}
