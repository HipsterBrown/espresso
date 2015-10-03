module.exports = espresso

var coffeeScript = require('coffee-script')
var jsCodeShift = require('jscodeshift')
var coreTransform = require('./transforms/core')
// var jsxTransform = require('./transforms/jsx')

function espresso (content, opts) {
  var jsContent = coffeeScript.compile(content, {bare: true})

  var es6Content = coreTransform(
    {
      source: jsContent
    },
    {
      jscodeshift: jsCodeShift
    }
  )
  return es6Content
}
