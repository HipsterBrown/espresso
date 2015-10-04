module.exports = core

function core (file, api) {
  var j = api.jscodeshift
  var root = j(file.source)
  var CONTAINS_REQUIRE = {
    expression: {
      type: 'AssignmentExpression',
      left: {
        type: 'Identifier'
      },
      right: {
        type: 'CallExpression',
        callee: {
          name: 'require'
        }
      }
    }
  }
  var CONTAINS_FACTORY = {
    expression: {
      type: 'AssignmentExpression',
      right: {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          property: {
            name: 'createFactory'
          }
        }
      }
    }
  }
  var MODULE_EXPORTS = {
    expression: {
      type: 'AssignmentExpression',
      left: {
        type: 'MemberExpression',
        object: {name: 'module'},
        property: {name: 'exports'}
      }
    }
  }
  var CLASS_METHOD = {
    value: {
      type: 'FunctionExpression'
    }
  }
  var FUNCTION_BIND = {
    callee: {
      type: 'FunctionExpression'
    },
    arguments: [
      { type: 'ThisExpression' }
    ]
  }
  var VAR_DECLARATION = {
    expression: {
      type: 'AssignmentExpression'
    }
  }
  var ASSIGN_EXP = {
    operator: '=',
    left: {
      type: 'Identifier'
    }
  }

  root
  .find(j.ExpressionStatement, CONTAINS_REQUIRE)
  .replaceWith(function (p) {
    return j.importDeclaration([j.importDefaultSpecifier(p.node.expression.left)], p.node.expression.right.arguments[0])
  })

  var variables = []
  root
  .find(j.VariableDeclaration)
  .filter(function (p) {
    return p.node.declarations[0].init === null
  })
  .forEach(function (p) {
    variables = variables.concat(p.node.declarations.map(function (variable) {
      return variable.id.name
    }))
  })
  .remove()

  root
  .find(j.ExpressionStatement, VAR_DECLARATION)
  .filter(function (p) {
    return p.node.expression.left.type === 'Identifier'
  })
  .replaceWith(function (p) {
    var matchIndex = variables.indexOf(p.node.expression.left.name)

    if (matchIndex > -1) {
      variables.splice(matchIndex, 1)
      return j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.expression.left.name), p.node.expression.right)])
    } else {
      return p.node
    }
  })

  function findBlockParent (path) {
    if (path.parent.node.type === 'BlockStatement') {
      return path
    } else {
      return findBlockParent(path.parent)
    }
  }

  root
  .find(j.AssignmentExpression, ASSIGN_EXP)
  .filter(function (p) {
    return variables.indexOf(p.node.left.name) > -1 && p.node.parenthesizedExpression
  })
  .forEach(function (p) {
    var matchIndex = variables.indexOf(p.node.left.name)
    variables.splice(matchIndex, 1)
    findBlockParent(p).insertBefore(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.left.name), null)]))
  })

  root
  .find(j.ExpressionStatement, CONTAINS_FACTORY)
  .remove()

  root
  .find(j.ExpressionStatement, MODULE_EXPORTS)
  .replaceWith(function (p) {
    return j.exportDeclaration(true, p.node.expression.right)
  })

  root
  .find(j.Property, CLASS_METHOD)
  .replaceWith(function (p) {
    var prop = j.property(p.node.kind, p.node.key, j.functionExpression(null, p.node.value.params, p.node.value.body))
    prop.method = true
    return prop
  })

  root
  .find(j.CallExpression, FUNCTION_BIND)
  .replaceWith(function (p) {
    return j.arrowFunctionExpression([], p.node.callee.body.body[0].argument.body)
  })
  .find(j.Identifier, {name: '_this'})
  .replaceWith(j.identifier('this'))

  return root.toSource()
}
