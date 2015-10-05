var test = require('tap').test

var espresso = require('../../')
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
