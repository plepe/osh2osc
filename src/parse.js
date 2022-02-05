const flow = require('xml-flow')

const defines = require('./defines')

/**
 * @returns list of changesets
 */
module.exports = function parse (input, callback) {
  const stream = flow(input, {
    simplifyNodes: false
  })

  const changesets = {}
  const known = { node: {}, way: {}, relation: {} }

  function add (item) {
    const type = item.$name

    let changeset = changesets[item.$attrs.changeset]
    if (!changeset) {
      changeset = {}
      defines.changesetActions.forEach(action => {
        changeset[action] = []
      })
      changesets[item.$attrs.changeset] = changeset
    }

    if (item.$attrs.id in known[type]) {
      if (item.$attrs.visible === 'false') {
        changeset.delete.push(item)
        delete known[type][item.$attrs.id]
      } else {
        changeset.modify.push(item)
      }
    } else {
      changeset.create.push(item)
      known[type][item.$attrs.id] = true
    }
  }

  stream.on('tag:node', (item) => {
    add(item)
  })
  stream.on('tag:way', (item) => {
    add(item)
  })
  stream.on('tag:relation', (item) => {
    add(item)
  })
  stream.on('end', (item) => {
    callback(null, changesets)
  })
}
