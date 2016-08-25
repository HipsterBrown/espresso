var test = require('tap').test
var fs = require('fs')

var espresso = require('../../src/')
var opts = {
  jsx: true
}

test('Transforms "React.DOM" element into JSX equivalent', function (t) {
  t.plan(1)

  var code = 'React.DOM.div({})'
  var newCode = espresso(code, opts)

  t.is(newCode, '<div />;\n', 'returns correct JSX element')
})

test('Transforms "D" element into JSX equivalent', function (t) {
  t.plan(1)

  var code = 'D.div()'
  var newCode = espresso(code, opts)

  t.is(newCode, '<div />;\n', 'returns correct JSX element')
})

test('Transforms "React.DOM" element with props into JSX equivalent', function (t) {
  t.plan(1)

  var code = 'React.DOM.div({className: "test"})'
  var newCode = espresso(code, opts)

  t.is(newCode, '<div className="test" />;\n', 'returns correct JSX prop')
})

test('Transforms "React.DOM" element with non-string props into JSX equivalent', function (t) {
  t.plan(1)

  var code = 'React.DOM.div({isTest: true})'
  var newCode = espresso(code, opts)

  t.is(newCode, '<div isTest={true} />;\n', 'returns correct JSX prop')
})

test('Transforms "React.DOM" element with Identifier props into JSX equiv', function (t) {
  t.plan(1)

  var code = 'React.DOM.div({className: ["test1", "test2"]})'
  var newCode = espresso(code, opts)

  t.is(newCode, '<div className={["test1", "test2"]} />;\n', 'returns correct JSX prop')
})

test('Transforms "React.DOM" element with children into JSX equi', function (t) {
  t.plan(1)

  var code = 'React.DOM.div({}, [React.DOM.p({}, "Test")])'
  var newCode = espresso(code, opts)

  t.is(newCode, '<div><p>Test</p></div>;\n', 'returns correct JSX')
})

test('Transforms "React.createElement" into JSX equivalent', function (t) {
  t.plan(1)

  var code = 'React.createElement(TestComponent, {classes: ["test-class"], value: "test"})'
  var newCode = espresso(code, opts)

  t.is(newCode, '<TestComponent classes={["test-class"]} value="test" />;\n', 'returns correct JSX')
})

test('Transforms "React.createElement" with children into JSX equivalent', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/create-element-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/create-element-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct arrow function')
})

test('Transforms nested "React.createElement" into JSX equivalent', function (t) {
  t.plan(1)

  var code = 'React.render React.createElement(TestComponent, {classes: ["test-class"], value: "test"})'
  var newCode = espresso(code, opts)

  t.is(newCode, 'React.render(<TestComponent classes={["test-class"]} value="test" />);\n', 'returns correct JSX')
})

test('Transforms nested child components JSX equivalent', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/nested-children-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/nested-children-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct JSX')
})

test('Transforms spreads correct JSX attributes', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/spread-attributes-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/spread-attributes-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct JSX')
})

test('No JSX transform on React.PropTypes.arrayOf', function (t) {
  t.plan(1)

  var code = fs.readFileSync(__dirname + '/../mocks/react-proptypes-mock.coffee').toString()
  var solution = fs.readFileSync(__dirname + '/../mocks/react-proptypes-solution.es6').toString()
  var newCode = espresso(code, opts)

  t.is(newCode, solution, 'returns correct JSX')
})
