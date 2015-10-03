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

  root
  .find(j.VariableDeclaration)
  .filter(function (p) {
    return p.node.start === 0
  })
  .remove()

  root
  .find(j.ExpressionStatement, CONTAINS_REQUIRE)
  .replaceWith(function (p) {
    return j.importDeclaration([j.importDefaultSpecifier(p.node.expression.left)], p.node.expression.right.arguments[0])
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
    return j.arrowFunctionExpression([], p.node.callee.body)
  })
  .find(j.Identifier, {name: '_this'})
  .replaceWith(j.identifier('this'))

  return root.toSource()
}
