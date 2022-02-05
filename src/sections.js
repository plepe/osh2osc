const defines = require('./defines')

module.exports = function sections (changesets, callback) {
  const sections = []

  let currentAction = null
  let currentSection = {}

  Object.keys(changesets).forEach(id => {
    const changeset = changesets[id]

    defines.changesetActions.forEach(action => {
      if (changeset[action].length) {
        startSection(action)
        changeset[action].forEach(item => sectionAdd(item))
      }
    })
  })

  if (currentAction) {
    currentSection.action = currentAction
    sections.push(currentSection)
  }

  callback(null, sections)

  function sectionAdd (item) {
    if (!(item.$name in currentSection)) {
      currentSection[item.$name] = []
    }

    currentSection[item.$name].push(item)
  }

  function startSection (action) {
    if (currentAction === action) {
      return
    }

    if (currentAction !== null) {
      currentSection.action = currentAction
      sections.push(currentSection)
      currentSection = {}
    }

    currentAction = action
  }
}
