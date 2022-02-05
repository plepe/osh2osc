#!/usr/bin/env node
const ArgumentParser = require('argparse').ArgumentParser
const parser = new ArgumentParser({
  add_help: true,
  description: 'Convert an OpenStreetMap .osc (OSM with History) to .osc (OSM Changeset). It will read a file "input.osh" and write to stdout.'
})

const args = parser.parse_args()

const fs = require('fs')

const parse = require('./src/parse')
const sections = require('./src/sections')
const print = require('./src/print')

const input = fs.createReadStream('input.osh')

parse(input, (err, changesets) => {
  if (err) { return console.error('Error parsing', err) }

  sections(changesets, (err, sections) => {
    if (err) { return console.error('Error creating sections', err) }

    print(sections, (err, str) => {
      if (err) { return console.error('Error printing result', err) }

      console.log(str)
    })
  })
})
