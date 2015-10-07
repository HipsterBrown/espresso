#! /usr/bin/env node

'use strict'

var nomnom = require('nomnom')
var fs = require('fs')
var path = require('path')

var espresso = require('../index.js')

var opts = nomnom
  .script('espresso')
  .options({
    path: {
      position: 0,
      help: 'Files or directory to transform',
      metavar: 'FILE',
      required: true
    },
    match: {
      abbr: 'm',
      help: 'File extensions to target in directory',
      default: '.coffee'
    },
    extension: {
      abbr: 'ext',
      help: 'The extension for transformed files, i.e. .js OR .es6',
      default: '.es6'
    },
    core: {
      flag: true,
      help: 'Basic ES2015 transforms, i.e. arrowFunctions, object methods, and import/exports',
      default: true
    },
    jsx: {
      flag: true,
      help: 'Transform any available React.DOM or Components to JSX',
      default: false
    }
  })
  .parse()

var pathStats = fs.lstatSync(opts.path)
var files = []

opts.path = opts.path.slice(-1) === '/' ? opts.path.slice(0, -1) : opts.path

if (pathStats.isDirectory()) {
  files = fs.readdirSync(opts.path).map(function (file) {
    return opts.path + '/' + file
  })
} else if (pathStats.isFile()) {
  files.push(opts.path)
}

files.forEach(function (file) {
  if (path.extname(file) === opts.match) {
    console.log('-----------------\n', file, '\n--------------------')
    var content = fs.readFileSync(file).toString()
    var es6Content = espresso(content, opts)

    fs.writeFileSync(path.dirname(file) + '/' + path.basename(file, opts.match) + opts.extension, es6Content)
  }
})
console.log('Your files have been converted, disaster averted.')

