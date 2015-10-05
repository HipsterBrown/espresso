module.exports = findParentOfType

function findParentOfType (path, parentType) {
  if (path.node.type === parentType) {
    return path
  } else {
    return path.parent === null ? false : findParentOfType(path.parent, parentType)
  }
}
