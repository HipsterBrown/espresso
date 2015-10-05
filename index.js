module.exports = espresso

var coffeeScript = require('coffee-script')
var jsCodeShift = require('jscodeshift')
var coreTransform = require('./transforms/core')
var jsxTransform = require('./transforms/jsx')

function espresso (content, opts) {
  var newContent = coffeeScript.compile(content, {bare: true})
  var api = {jscodeshift: jsCodeShift}

  if (opts.core) {
    newContent = coreTransform({source: newContent}, api)
  }

  if (opts.jsx) {
    newContent = jsxTransform({source: newContent}, api)
  }

  return newContent
}
