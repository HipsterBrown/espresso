var test = require('tap').test
var fs = require('fs')

var espresso = require('../../dist/')
var opts = {
  core: true
}

test('Transforms "require" statements to "import" statements', function (t) {
  t.plan(2)

  var code = 'test = require("test")'
  var newCode = espresso(code, opts)

  t.is(typeof newCode, 'string', 'returns string')
  t.is(newCode, 'import test from "test";\n', 'returns correct import statement')
})

test('Transforms inline "require" statements to top "import" statements', function (t) {
  t.plan(2)

  var code = fs.readFileSync(__dirname + '/../mocks/inline-require-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/inline-require-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(typeof newCode, 'string', 'returns string')
  t.is(newCode, solution, 'returns correct import at the top of the file')
})

test('Transforms "require" statements which are not assigned', function (t) {
  t.plan(2)

  var code = 'require("test")'
  var newCode = espresso(code, opts)

  t.is(typeof newCode, 'string', 'returns string')
  t.is(newCode, 'import "test";\n', 'returns correct import statement')
})

test('Transforms "require" statements which are immediately called', function (t) {
  t.plan(2)

  var code = fs.readFileSync(__dirname + '/../mocks/called-require-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/called-require-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(typeof newCode, 'string', 'returns string')
  t.is(newCode, solution, 'returns correct import followed by function call')
})

test('Transforms assigned "require" statements which are immediately called', function (t) {
  t.plan(2)

  var code = fs.readFileSync(__dirname + '/../mocks/called-assigned-require-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/called-assigned-require-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(typeof newCode, 'string', 'returns string')
  t.is(newCode, solution, 'returns correct import followed by function call')
})

test('Transforms "require" statements which are used as arguments', function (t) {
  t.plan(2)

  var code = fs.readFileSync(__dirname + '/../mocks/require-as-argument-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/require-as-argument-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(typeof newCode, 'string', 'returns string')
  t.is(newCode, solution, 'returns correct import followed by function call')
})

test('Transforms "module.exports" statements to "export default" statements', function (t) {
  t.plan(1)

  var code = 'module.exports = () ->'
  var newCode = espresso(code, opts)

  t.is(newCode, 'export default function() {};\n', 'returns correct export statement')
})

test('Transforms object arrow function to object method', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/method-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/method-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct object method')
})

test('Transforms fat arrow function into ES2015 arrow function', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/this-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/this-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct arrow function')
})
