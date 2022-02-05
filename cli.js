const fs = require('fs')
const flow = require('xml-flow')

const input = fs.createReadStream('input.osh')
const stream = flow(input, {
  simplifyNodes: false
})

const changesets = {}
const known = { node: {}, way: {}, relation: {} }
 
const changesetActions = ['create', 'modify', 'delete']

stream.on('tag:node', (item) => {
  add(item)
})
stream.on('tag:way', (item) => {
  add(item)
})
stream.on('tag:relation', (item) => {
  add(item)
})

function add (item) {
  const type = item.$name

  let changeset = changesets[item.$attrs.changeset]
  if (!changeset) {
    changeset = {}
    changesetActions.forEach(action => changeset[action] = [])
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

let currentSection = null

stream.on('end', (item) => {
  console.log("<?xml version='1.0' encoding='UTF-8'?>")
  console.log("<osmChange version='0.6' generator='osh2osc'>")

  Object.keys(changesets).forEach(id => {
    const changeset = changesets[id]

    changesetActions.forEach(action => {
      if (changeset[action].length) {
        startSection(action)
        changeset[action].forEach(item => printItem(item))
      }
    })
  })

  if (currentSection) {
    console.log('  </' + currentSection + '>')
  }

  console.log('</osmChange>')
})

function startSection (action) {
  if (currentSection === action) {
    return
  }
  if (currentSection !== null) {
    console.log('  </' + currentSection + '>')
  }
  console.log('  <' + action + '>')
  currentSection = action
}

function printItem (item) {
  let str = '    <' + item.$name
  let children = ''

  Object.keys(item.$attrs).forEach(k => {
    str += ' ' + k + '=' + xmlstr(item.$attrs[k])
  })

  if (item.nd) {
    item.nd.forEach(c => {
      children += '      <nd ref=' + xmlstr(c) + '/>\n'
    })
  }

  if (Array.isArray(item.tag)) {
    item.tag.forEach(kv => {
      children += '      <tag k=' + xmlstr(kv.k) + ' v=' + xmlstr(kv.v) + '/>\n'
    })
  } else if (item.tag) {
    children += '      <tag k=' + xmlstr(item.tag.k) + ' v=' + xmlstr(item.tag.v) + '/>\n'
  }
  
  if (children) {
    str += '>\n' + children + '    </' + item.$name + '>'
  } else {
    str += '/>'
  }

  console.log(str)
}

function xmlstr (str) {
  return '"' + str.replace(/"/g, '\\"') + '"'
}
