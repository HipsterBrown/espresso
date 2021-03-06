var test = require('tap').test
var fs = require('fs')

var espresso = require('../../src/')
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

test('Keeps declared variables in sequence at top of file', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/variable-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/variable-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct declarations')
})

test('Transforms for...in to declared for loop', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/for-in-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/for-in-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct loop')
})

test('Transforms for...of to correct for...in', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/for-of-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/for-of-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct loop')
})

test('Declare variables in IfStatement scope', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/if-scope-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/if-scope-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns variable declarations')
})

test('Declare variables created for existential operator', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/existential-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/existential-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns variable declarations')
})
