#! /usr/bin/env node

var coffeeScript = require('coffee-script')
var jsCodeShift = require('jscodeshift')
var fs = require('fs')
var path = require('path')
var nomnom = require('nomnom')
var dir = require('node-dir')
var coreTransform = require('./transforms/core')

var espresso = function (fileOrDir, opts) {
  var pathStats = fs.lstatSync(fileOrDir)

  if (pathStats.isDirectory()) {
    dir.readFiles(fileOrDir, function (err, content, filename, next) {
      if (err) {
        console.log(err)
        next()
      }

      if (path.extname(filename) === opts.match) {
        var jsContent = coffeeScript.compile(content, {bare: true})

        var es6Content = coreTransform(
          {
            path: filename,
            source: jsContent
          },
          {
            jscodeshift: jsCodeShift
          }
        )
      }
      fs.writeFileSync(path.dirname(filename) + '/' + path.basename(filename, opts.match) + opts.extension, es6Content)
      next()
    }, function () {
      console.log('Your files have been converted, disaster averted.')
    })
  } else if (pathStats.isFile()) {
    if (path.extname(fileOrDir) === opts.match) {
      var content = fs.readFileSync(fileOrDir).toString()
      var jsContent = coffeeScript.compile(content, {bare: true})
      var es6Content = coreTransform(
        {
          path: fileOrDir,
          source: jsContent
        },
        {
          jscodeshift: jsCodeShift
        }
      )
      fs.writeFileSync(path.dirname(fileOrDir) + '/' + path.basename(fileOrDir, opts.match) + opts.extension, es6Content)
      console.log('Your file has been converted, disaster averted.')
    } else {
      console.log('Not a valid coffee file')
    }
  }
}

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
      flag: true,
      default: '.coffee'
    },
    extension: {
      abbr: 'ext',
      flag: true,
      help: 'The extension for transformed files, i.e. .js OR .es6',
      default: '.es6'
    }
  })
  .parse()

espresso(opts.path, opts)
