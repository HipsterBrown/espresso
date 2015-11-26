module.exports = throwError

function throwError (path) {
  const lineNumber = path.value.loc.start.line
  const lineString = path.value.loc.lines.toString().split('\n')[lineNumber - 1]
  throw new Error(`Cannot parse expression at line ${lineNumber}: ${lineString}`)
}
