module.exports = core

var camelCase = require('lodash.camelcase')

var findParentOfType = require('../utils/find-parent-of-type')
var parentHasType = require('../utils/parent-has-type')
var throwError = require('../utils/throw-error')

function core (file, api) {
  var j = api.jscodeshift
  var root = j(file.source)

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
  var REQUIRE = {
    callee: {
      type: 'Identifier',
      name: 'require'
    }
  }

  root
  .find(j.CallExpression, REQUIRE)
  .forEach(function (p) {
    var parentCall = p.parent.node.type === 'CallExpression' ? p.parent : false
    var parentExpStat = findParentOfType(p, 'ExpressionStatement')

    if (parentCall && parentExpStat.node.expression.type === 'AssignmentExpression') {
      var importIdent = j.identifier(parentExpStat.node.expression.left.name + 'Import')
      var origIdent = parentExpStat.node.expression.left

      var importDec = j.importDeclaration([j.importDefaultSpecifier(importIdent)], p.node.arguments[0])

      parentExpStat.replace(importDec)

      /*
       checks to see if the parent CallExpression is calling the required module or the required module is being immediately called:

       callingModule(require('test')) vs require('test')()
      */
      if (parentCall.node.arguments.length) {
        parentExpStat.insertAfter(
          j.variableDeclaration('var', [j.variableDeclarator(origIdent, j.callExpression(parentCall.node.callee, [importIdent]))])
        )
      } else {
        parentExpStat.insertAfter(
          j.variableDeclaration('var', [j.variableDeclarator(origIdent, j.callExpression(importIdent, []))])
        )
      }
    } else if (parentExpStat.node.expression.type === 'CallExpression' && parentExpStat.node.expression.callee.type === 'CallExpression') {
      var importName = j.identifier(camelCase(p.node.arguments[0].value) + 'Import')

      parentExpStat.replace(
        j.importDeclaration([j.importDefaultSpecifier(importName)], p.node.arguments[0])
      )

      parentExpStat.insertAfter(
        j.expressionStatement(
          j.callExpression(importName, [])
        )
      )
    } else {
      var specifiers = []

      if (parentExpStat.node.expression.left) {
        if (parentExpStat.node.expression.left.type !== 'Identifier') {
          return throwError(p)
        }

        specifiers = [j.importDefaultSpecifier(parentExpStat.node.expression.left)]
      }
      var importModule = j.importDeclaration(specifiers, p.node.arguments[0])
      var parentExport = findParentOfType(p.parent, 'ExpressionStatement', MODULE_EXPORTS)

      if (parentExport) {
        parentExport.insertBefore(importModule)
        parentExpStat.prune()
      } else {
        parentExpStat.replace(
          importModule
        )
      }
    }
  })

  root
  .find(j.SequenceExpression)
  .filter(function (exp) { return exp.parent.value.type === 'ForStatement' })
  .replaceWith(function (exp) {
    return j.variableDeclaration('var', exp.node.expressions.map(function (expression) {
      return j.variableDeclarator(expression.left, expression.right)
    }))
  })

  root
  .find(j.ForInStatement, {
    left: {
      type: 'Identifier'
    }
  })
  .replaceWith(function (exp) {
    return j.forInStatement(
      j.variableDeclaration('var', [exp.node.left]),
      exp.node.right,
      exp.node.body
    )
  })

  var variables = []
  root
  .find(j.VariableDeclaration)
  .filter(function (p) {
    return p.node.declarations[0].init === null && (p.parent && p.parent.value.type !== 'ForInStatement')
  })
  .forEach(function (p) {
    p.node.declarations.forEach(function (variable) {
      if (variable.init === null) {
        var declaredVariables = []

        root
        .find(j.AssignmentExpression, {
          operator: '=',
          left: {
            type: 'Identifier',
            name: variable.id.name
          }
        })
        .filter(function (exp) { return !exp.parent.value.type.match(/AssignmentExpression|VariableDeclarator/) })
        .forEach(function (exp) {
          var name = exp.node.left.name
          var isDeclared = declaredVariables.indexOf(name) !== -1

          if (!isDeclared && (exp.scope.node.start >= p.scope.node.start || (exp.scope.isGlobal && p.scope.isGlobal)) && !exp.parent.value.type.match(/ForStatement/)) {
            var scope = exp.parent
            declaredVariables.push(name)

            while (!scope.value.type.match(/Program|IfStatement/)) {
              scope = scope.parent
            }

            if (scope.value.type === 'Program') {
              if (exp.parent.value.type.match(/MemberExpression/)) {
                scope = exp.parent
                while (!scope.value.type.match(/VariableDeclaration|ExpressionStatement/)) {
                  scope = scope.parent
                }

                scope.insertBefore(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(name), null)]))
              } else {
                exp.parent.replace(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(name), exp.node.right)]))
              }
            } else {
              scope.insertBefore(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(name), null)]))
            }
          }
        })
      } else {
        if (p.parent.value.type === 'Program') {
          p.insertAfter(j.variableDeclaration('var', [variable]))
        } else {
          p.insertBefore(j.variableDeclaration('var', [variable]))
        }
      }
    })
  })
  .remove()

  root
  .find(j.ExpressionStatement, MODULE_EXPORTS)
  .forEach(function (exp) {
    variables.forEach(function (variable) {
      exp.insertBefore(j.variableDeclaration('var', [variable]))
    })
  })

  root
  .find(j.ExpressionStatement, MODULE_EXPORTS)
  .replaceWith(function (p) {
    return j.exportDeclaration(true, p.node.expression.right)
  })

  .find(j.AssignmentExpression)
  .filter(function (p) {
    return p.node.left.type === 'Identifier' && !p.node.parenthesizedExpression && p.parent.node.type !== 'SequenceExpression'
  })
  .forEach(function (p) {
    if (p.parent.node.type === 'AssignmentExpression' && variables.indexOf(p.parent.node.left.name) > -1) {
      var matchIndex = variables.indexOf(p.parent.node.left.name)
      variables.splice(matchIndex, 1)

      if (parentHasType(p.parent, 'SequenceExpression')) {
        parentHasType(p, 'BlockStatement').insertBefore(
          j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.parent.node.left.name), null)])
        )
      } else {
        p.parent.replace(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.parent.node.left.name), p.parent.node.right)]))
      }
    } else if (variables.indexOf(p.node.left.name) > -1) {
      var match = variables.indexOf(p.node.left.name)
      variables.splice(match, 1)

      if (findParentOfType(p, 'ExportDeclaration')) {
        findParentOfType(p, 'ExportDeclaration').insertBefore(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.left.name), null)]))
      } else {
        p.replace(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.left.name), p.node.right)]))
      }
    }
  })

  root
  .find(j.VariableDeclaration)
  .forEach(function (p) {
    var varName = (p.node.declarations[0].id && p.node.declarations[0].id.name)

    if (varName) {
      root
      .find(j.ImportDeclaration)
      .forEach(function (importPath) {
        if (importPath.node.specifiers.length === 0) {
          return
        }

        var name = importPath.node.specifiers[0].local.name
        if (name === varName) {
          var importIdent = j.identifier(name + 'Import')
          var varIdent = p.node.declarations[0].init.arguments[0]
          importPath.node.specifiers[0].local = importIdent

          if (name === varIdent.name) {
            varIdent.name = importIdent.name
          }
        }
      })
    }
  })

  /*
  root
  .find(j.AssignmentExpression, ASSIGN_EXP)
  .filter(function (p) {
    return variables.indexOf(p.node.left.name) > -1 && p.node.parenthesizedExpression
  })
  .forEach(function (p) {
    var matchIndex = variables.indexOf(p.node.left.name)
    variables.splice(matchIndex, 1)
    parentHasType(p, 'BlockStatement').insertBefore(j.variableDeclaration('var', [j.variableDeclarator(j.identifier(p.node.left.name), null)]))
  })
 */

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
    return j.arrowFunctionExpression(p.node.callee.body.body[0].argument.params, p.node.callee.body.body[0].argument.body)
  })
  .find(j.Identifier, {name: '_this'})
  .replaceWith(j.identifier('this'))

  return root.toSource()
}
