import { test } from '@japa/runner'
import { LitAnalyzer } from '@jarrodek/lit-analyzer'
import { Diagnostic, LanguageService, Program, SourceFile } from 'typescript'
import { LitPluginContext } from '../../../src/ts-lit-plugin/lit-plugin-context.js'
import { TsLitPlugin } from '../../../src/ts-lit-plugin/ts-lit-plugin.js'

// Mock factories
function createMockLanguageService(): LanguageService {
  return {
    getProgram: () =>
      ({
        getSourceFile: (fileName: string) => ({ fileName }) as SourceFile,
      }) as unknown as Program,
    getCompletionsAtPosition: () => undefined,
    getSemanticDiagnostics: () => [],
    getDefinitionAndBoundSpan: () => undefined,
    getCodeFixesAtPosition: () => [],
    getQuickInfoAtPosition: () => undefined,
    getOutliningSpans: () => [],
    getJsxClosingTagAtPosition: () => undefined,
    getSignatureHelpItems: () => undefined,
    findRenameLocations: () => undefined,
    getRenameInfo: () => ({ canRename: false, localizedErrorMessage: 'Not implemented' }),
    getFormattingEditsForRange: () => [],
    // Add other required methods as needed by the test execution flow
  } as unknown as LanguageService
}

function createMockLitAnalyzer(): LitAnalyzer {
  return {
    getCompletionDetailsAtPosition: () => undefined,
    getCompletionsAtPosition: () => undefined,
    getDiagnosticsInFile: () => [],
    getDefinitionAtPosition: () => undefined,
    getCodeFixesAtPositionRange: () => [],
    getQuickInfoAtPosition: () => undefined,
    getOutliningSpansInFile: () => [],
    getClosingTagAtPosition: () => undefined,
    getRenameLocationsAtPosition: () => [],
    getRenameInfoAtPosition: () => undefined,
    getFormatEditsInFile: () => [],
  } as unknown as LitAnalyzer
}

test.group('TsLitPlugin Delegation', () => {
  test('getCompletionsAtPosition delegates to LitAnalyzer', ({ assert }) => {
    const mockLangService = createMockLanguageService()
    const mockContext = {} as LitPluginContext
    const mockAnalyzer = createMockLitAnalyzer()

    let called = false
    mockAnalyzer.getCompletionsAtPosition = () => {
      called = true
      return [] // Return empty array to simulate result
    }

    const plugin = new TsLitPlugin(mockLangService, mockContext, mockAnalyzer)
    plugin.getCompletionsAtPosition('test.ts', 0, undefined)

    assert.isTrue(called, 'Expected getCompletionsAtPosition to be called on LitAnalyzer')
  })

  test('getSemanticDiagnostics combines results', ({ assert }) => {
    const mockLangService = createMockLanguageService()
    const mockContext = {
      // Mock logger to avoid errors during translation if needed
      logger: { debug: () => {}, error: () => {}, warn: () => {} },
    } as unknown as LitPluginContext
    const mockAnalyzer = createMockLitAnalyzer()

    // Mock TS diagnostics
    const tsDiagnostic = { messageText: 'TS Error', code: 123 } as unknown as Diagnostic
    mockLangService.getSemanticDiagnostics = () => [tsDiagnostic]

    // Mock Lit diagnostics
    // We keep it empty for now to avoid complex mocking of translation logic,
    // but we want to ensure TS diagnostics are returned at minimum
    mockAnalyzer.getDiagnosticsInFile = () => []

    const plugin = new TsLitPlugin(mockLangService, mockContext, mockAnalyzer)
    const diagnostics = plugin.getSemanticDiagnostics('test.ts')

    assert.lengthOf(diagnostics, 1)
    assert.deepEqual(diagnostics[0], tsDiagnostic)
  })
})
