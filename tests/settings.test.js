const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")

const root = path.join(__dirname, "..")
const manifest = require(path.join(root, "manifest.json"))
const barWidget = fs.readFileSync(path.join(root, "BarWidget.qml"), "utf8")
const panel = fs.readFileSync(path.join(root, "Panel.qml"), "utf8")
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8")

const expected = {
  mondayFirst: {
    type: "boolean",
    defaultValue: false
  },
  titleFormat: {
    type: "string",
    defaultValue: "d MMMM 'W'ww yyyy"
  },
  hFormat: {
    type: "string",
    defaultValue: "dddd HH:mm"
  },
  vFormat: {
    type: "string",
    defaultValue: "HH\n—\nmm"
  },
  flashDuration: {
    type: "integer",
    defaultValue: 2000
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

  const duration = schema.find(field => field.key === "flashDuration")
  assert.equal(duration.min, 1000)
  assert.equal(duration.max, 60000)
  assert.equal(duration.step, 1000)
  assert.match(duration.description, /milliseconds/)
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

  assert.match(barWidget, /setting\("hFormat", "dddd HH:mm"\)/)
  assert.match(barWidget, /setting\("vFormat", "HH\\n\\u2014\\nmm"\)/)
  assert.match(panel, /setting\("mondayFirst", false\)/)
  assert.match(panel, /setting\("titleFormat", "d MMMM 'W'ww yyyy"\)/)
  assert.match(panel, /setting\("flashDuration", 2000\)/)
  assert.match(panel, /Math\.max\(1000, Math\.min\(60000, Math\.round\(duration\)\)\)/)
  assert.match(panel, /interval: root\.flashDuration\b/)
  assert.doesNotMatch(panel, /flashDuration\s*\*\s*1000/)
})

test("reinjects changed bar settings into the calendar panel", () => {
  assert.match(barWidget, /onSettingsChanged: injectPanel\(\)/)
  assert.match(barWidget, /target\.settings = root\.settings/)
})

test("persists validated settings through the Omacal IPC target", () => {
  assert.equal((panel.match(/\bIpcHandler\s*\{/g) || []).length, 1)
  assert.match(
    panel,
    /root\.bar\.shell\.updateEntryInline\(root\.moduleName, next\)/
  )
  assert.match(
    panel,
    /var allowed = \["mondayFirst", "titleFormat", "hFormat", "vFormat", "flashDuration"\]/
  )
  assert.match(
    panel,
    /requested !== "true" && requested !== "false"/
  )
  assert.match(
    panel,
    /saveSettings\(\{ mondayFirst: requested === "true" \}\)/
  )
  assert.match(
    panel,
    /duration < 1000 \|\| duration > 60000/
  )
  assert.match(panel, /saveSettings\(\{ flashDuration: duration \}\)/)

  for (const key of Object.keys(expected)) {
    assert.match(
      panel,
      new RegExp(`function ${key}\\(value: string\\): string`)
    )
  }
})

test("documents a copy-pastable omarchy-shell command for every setting", () => {
  for (const key of Object.keys(expected)) {
    assert.equal(
      readme.includes(`omarchy-shell b.omacal ${key} `),
      true,
      `${key} command`
    )
  }

  assert.match(
    readme,
    /omarchy-shell b\.omacal mondayFirst true/
  )
  assert.match(
    readme,
    /omarchy-shell b\.omacal titleFormat "d MMMM 'W'ww yyyy"/
  )
  assert.match(
    readme,
    /omarchy-shell b\.omacal hFormat "dddd HH:mm"/
  )
  assert.match(
    readme,
    /omarchy-shell b\.omacal vFormat \$'HH\\n—\\nmm'/
  )
  assert.match(
    readme,
    /omarchy-shell b\.omacal flashDuration 2000/
  )
  assert.doesNotMatch(readme, /omarchy bar plugin set b\.omacal/)
  assert.match(readme, /The default is `false`/)
  assert.match(readme, /The default is `d MMMM 'W'ww yyyy`/)
  assert.match(readme, /The default is `dddd HH:mm`/)
  assert.match(readme, /The default is three rows/)
  assert.match(readme, /The default is `2000`/)
  assert.match(readme, /supported range is `1000` to `60000`/)
})

test("removes the superseded setting names", () => {
  const publishedSource = `${JSON.stringify(manifest)}\n${barWidget}\n${panel}\n${readme}`
  for (const oldName of [
    "mondayFirstDayofWeek",
    "horizontalClockFormat",
    "verticalClockFormat",
    "flashDurationSeconds"
  ]) {
    assert.equal(publishedSource.includes(oldName), false, oldName)
  }
})

test("publishes the omarchy-shell settings API as version 0.0.7", () => {
  assert.equal(manifest.version, "0.0.7")
  assert.match(
    readme,
    /Review the source at \[github\.com\/brianblakely\/omacal\]/
  )
})

process.stdout.write(`${passed} settings contract tests passed\n`)
