import { test } from '@japa/runner'
import { LitPluginContext } from '../../../src/ts-lit-plugin/lit-plugin-context.js'
import * as translateDiagnostics from '../../../src/ts-lit-plugin/translate/translate-diagnostics.js'
import { TsLitPlugin } from '../../../src/ts-lit-plugin/ts-lit-plugin.js'

// Main entry loads

test('ts-lit-plugin main entry loads', ({ assert }) => {
  assert.ok(TsLitPlugin)
})

test('lit-plugin-context factory loads', ({ assert }) => {
  assert.ok(LitPluginContext)
})

test('translate-diagnostics exports functions', ({ assert }) => {
  assert.ok(typeof translateDiagnostics === 'object')
  assert.ok(Object.keys(translateDiagnostics).length > 0)
})
