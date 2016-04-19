module.exports = throwError

function throwError (path) {
  const loc = path.loc || path.value.loc
  const lineNumber = loc.start.line
  const lineString = loc.lines.toString().split('\n')[lineNumber - 1]
  throw new Error(`Cannot parse expression at line ${lineNumber}: ${lineString}`)
}
