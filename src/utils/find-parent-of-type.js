var matchNode = require('jscodeshift/dist/matchNode')
module.exports = findParentOfType

function findParentOfType (path, parentType, filter) {
  if ((path.node.type === parentType)) {
    if (filter) {
      if (matchNode(path.value, filter)) {
        return path
      } else {
        return path.parent === null ? false : findParentOfType(path.parent, parentType, filter)
      }
    }

    return path
  } else {
    return path.parent === null ? false : findParentOfType(path.parent, parentType, filter)
  }
}
