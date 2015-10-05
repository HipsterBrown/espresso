module.exports = jsx

var findParentOfType = require('../utils/find-parent-of-type')

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

  function buildJSX (callExp) {
    var name = callExp.callee.name || callExp.callee.property.name
    var el = j.jsxIdentifier(name)
    var params = callExp.arguments
    var attrs = []
    var children = []

    if (params[0] && params[0].properties) {
      attrs = params[0].properties.map(function (prop) {
        var jsxAttr = j.jsxAttribute(
          j.jsxIdentifier(prop.key.name || prop.key.value),
          prop.value.type !== 'Literal' ? j.jsxExpressionContainer(prop.value) : prop.value
        )

        return jsxAttr
      })
    }

    if (params[1] && params[1].elements) {
      children = params[1].elements.map(function (element) {
        if (element.type !== 'JSXElement') {
          if (element.type === 'ConditionalExpression') {
            return j.jsxExpressionContainer(element)
          } else {
            return buildJSX(element)
          }
        }
      })
    } else if (params[1]) {
      if (params[1].type === 'Identifier') {
        children.push(j.jsxExpressionContainer(params[1]))
      } else {
        children.push(params[1])
      }
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
  }

  root
  .find(j.CallExpression, CONTAINS_FACTORY)
  .forEach(function (p) {
    var parentVar = findParentOfType(p, 'VariableDeclaration')
    if (parentVar) {
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
