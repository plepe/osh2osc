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

parser.add_argument('-o', '--output', {
  help: 'File to write final data to, example: output.osc. If not specified, write to stdout.',
  default: null
})

const args = parser.parse_args()

const fs = require('fs')

const parse = require('./src/parse')
const sections = require('./src/sections')
const print = require('./src/print')

const input = args.input ? fs.createReadStream(args.input) : process.stdin

parse(input, (err, changesets) => {
  if (err) { return console.error('Error parsing', err) }

  sections(changesets, (err, sections) => {
    if (err) { return console.error('Error creating sections', err) }

    print(sections, (err, str) => {
      if (err) { return console.error('Error printing result', err) }

      if (args.output) {
        fs.writeFile(args.output, str, (err) => {
          if (err) { return console.error('Error writing file', err) }
        })
      } else {
        console.log(str)
      }
    })
  })
})
