const defines = require('./defines')

module.exports = function print (sections, callback) {
  let str = "<?xml version='1.0' encoding='UTF-8'?>\n"
  str += "<osmChange version='0.6' generator='osh2osc'>\n"

  sections.forEach(section => {
    str += printSection(section)
  })

  str += '</osmChange>'

  callback(null, str)
}

function printSection (section) {
  let str = '  <' + section.action + '>\n'

  defines.typeOrder.forEach(type => {
    if (type in section) {
      section[type].forEach(item => {
        str += printItem(item)
      })
    }
  })

  str += '  </' + section.action + '>\n'

  return str
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

  if (item.member) {
    if (!Array.isArray(item.member)) {
      item.member = [item.member]
    }

    item.member.forEach(m => {
      children += '      <member ' +
        Object.keys(m)
          .map(k => k + '=' + xmlstr(m[k]))
          .join(' ') + '/>\n'
    })
  }

  if (children) {
    str += '>\n' + children + '    </' + item.$name + '>\n'
  } else {
    str += '/>\n'
  }

  return str
}

function xmlstr (str) {
  return '"' + str.replace(/"/g, '&quot;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/&/g, '&amp;') + '"'
}
