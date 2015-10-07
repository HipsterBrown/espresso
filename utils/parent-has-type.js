module.exports = parentHasType

function parentHasType (path, parentType) {
  if (path.parent === null) { return false }

  if (path.parent.node.type === parentType) {
    return path
  } else {
    return path.parent === null ? false : parentHasType(path.parent, parentType)
  }
}
