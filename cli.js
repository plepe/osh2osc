#!/usr/bin/env node
const ArgumentParser = require('argparse').ArgumentParser
const parser = new ArgumentParser({
  add_help: true,
  description: 'Convert an OpenStreetMap .osc (OSM with History) to .osc (OSM Changeset).'
})

parser.add_argument('-i', '--input', {
  help: 'File to read data from, example: input.osh. If not specified, read from stdin.',
  default: null
})

parser.add_argument('-o', '--output-dir', {
  help: 'Directory to write the changesets to.',
  default: 'output'
})

const args = parser.parse_args()

const fs = require('fs')

const parse = require('./src/parse')
const sections = require('./src/sections')
const print = require('./src/print')

const input = args.input ? fs.createReadStream(args.input) : process.stdin

let fileId = 0
const fileNameLength = 8

parse(input, (err, changesets) => {
  if (err) { return console.error('Error parsing', err) }

  Object.keys(changesets).forEach(changeset => {
    const d = {}
    d[changeset] = changesets[changeset]

    sections(d, (err, sections) => {
      if (err) { return console.error('Error creating sections', err) }

      print(sections, (err, str) => {
        if (err) { return console.error('Error printing result', err) }

        fs.writeFile(args.output_dir + '/' + lpad(fileId++, '0', fileNameLength) + '.osc', str, (err) => {
          if (err) { return console.error('Error writing file', err) }
        })
      })
    })
  })
})

function lpad (str, pad = ' ', length = 0) {
  return pad.repeat(length).substr(('' + str).length) + str
}
