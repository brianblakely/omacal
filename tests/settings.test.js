const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const root = path.join(__dirname, "..")
const manifest = require(path.join(root, "manifest.json"))
const barWidget = fs.readFileSync(path.join(root, "BarWidget.qml"), "utf8")
const panel = fs.readFileSync(path.join(root, "Panel.qml"), "utf8")
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8")

const expected = {
  mondayFirstDayofWeek: {
    type: "boolean",
    defaultValue: false
  },
  titleFormat: {
    type: "string",
    defaultValue: "d MMMM 'W'ww yyyy"
  },
  horizontalClockFormat: {
    type: "string",
    defaultValue: "dddd HH:mm"
  },
  verticalClockFormat: {
    type: "string",
    defaultValue: "HH\n—\nmm"
  },
  flashDurationSeconds: {
    type: "integer",
    defaultValue: 2
  }
}

let passed = 0

function test(name, callback) {
  callback()
  passed += 1
  process.stdout.write(`ok ${passed} - ${name}\n`)
}

test("keeps defaults and schema complete and in sync", () => {
  const defaults = manifest.barWidget.defaults
  const schema = manifest.barWidget.schema
  const expectedKeys = Object.keys(expected).sort()

  assert.deepEqual(Object.keys(defaults).sort(), expectedKeys)
  assert.deepEqual(schema.map(field => field.key).sort(), expectedKeys)
  assert.equal(new Set(schema.map(field => field.key)).size, schema.length)

  for (const field of schema) {
    const contract = expected[field.key]
    assert.equal(field.type, contract.type, `${field.key} type`)
    assert.deepEqual(field.defaultValue, contract.defaultValue, `${field.key} schema default`)
    assert.deepEqual(defaults[field.key], contract.defaultValue, `${field.key} runtime default`)
    assert.equal(typeof field.description, "string", `${field.key} description`)
    assert.notEqual(field.description.trim(), "", `${field.key} description`)
  }

  const duration = schema.find(field => field.key === "flashDurationSeconds")
  assert.equal(duration.min, 1)
  assert.equal(duration.max, 60)
  assert.equal(duration.step, 1)
})

test("reads every declared setting with the matching runtime fallback", () => {
  const runtimeKeys = Array.from(
    `${barWidget}\n${panel}`.matchAll(/\bsetting\("([^"]+)"/g),
    match => match[1]
  )
  assert.deepEqual(
    Array.from(new Set(runtimeKeys)).sort(),
    Object.keys(expected).sort()
  )

  assert.match(barWidget, /setting\("horizontalClockFormat", "dddd HH:mm"\)/)
  assert.match(barWidget, /setting\("verticalClockFormat", "HH\\n\\u2014\\nmm"\)/)
  assert.match(panel, /setting\("mondayFirstDayofWeek", false\)/)
  assert.match(panel, /setting\("titleFormat", "d MMMM 'W'ww yyyy"\)/)
  assert.match(panel, /setting\("flashDurationSeconds", 2\)/)
  assert.match(panel, /Math\.max\(1, Math\.min\(60, Math\.round\(duration\)\)\)/)
  assert.match(panel, /interval: root\.flashDurationSeconds \* 1000/)
})

test("reinjects changed bar settings into the calendar panel", () => {
  assert.match(barWidget, /onSettingsChanged: injectPanel\(\)/)
  assert.match(barWidget, /target\.settings = root\.settings/)
})

test("documents a copy-pastable command for every setting", () => {
  for (const key of Object.keys(expected)) {
    assert.equal(
      readme.includes(`omarchy bar plugin set b.omacal ${key} `),
      true,
      `${key} command`
    )
  }

  assert.match(
    readme,
    /omarchy bar plugin set b\.omacal mondayFirstDayofWeek true --json/
  )
  assert.match(
    readme,
    /omarchy bar plugin set b\.omacal verticalClockFormat '"HH\\n—\\nmm"' --json/
  )
  assert.match(
    readme,
    /omarchy bar plugin set b\.omacal flashDurationSeconds 2 --json/
  )
  assert.match(readme, /The default is `false`/)
  assert.match(readme, /The default is `d MMMM 'W'ww yyyy`/)
  assert.match(readme, /The default is `dddd HH:mm`/)
  assert.match(readme, /The default is three rows/)
  assert.match(readme, /The default is `2`/)
  assert.match(readme, /supported range is `1` to `60`/)
})

test("publishes the settings documentation as version 0.0.6", () => {
  assert.equal(manifest.version, "0.0.6")
  assert.match(
    readme,
    /Review the source at \[github\.com\/brianblakely\/omacal\]/
  )
})

process.stdout.write(`${passed} settings contract tests passed\n`)
