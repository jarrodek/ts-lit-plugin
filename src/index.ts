/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { dirname } from 'node:path/win32'
import { fileURLToPath } from 'node:url'

import { LitAnalyzerConfig, LitAnalyzerLoggerLevel, makeConfig } from '@jarrodek/lit-analyzer'
import pkg from '@jarrodek/lit-analyzer/package.json' with { type: 'json' }
import { VERSION as WCA_VERSION } from '@jarrodek/web-component-analyzer'
import ts from 'typescript'
import { CompilerOptions } from 'typescript'
import * as tsServer from 'typescript/lib/tsserverlibrary.js'

import { decorateLanguageService } from './decorate-language-service.js'
import { logger } from './logger.js'
import { LitPluginContext } from './ts-lit-plugin/lit-plugin-context.js'
import { TsLitPlugin } from './ts-lit-plugin/ts-lit-plugin.js'
import { setTypescriptModule } from './ts-module.js'

const tsHtmlPluginSymbol = Symbol.for('__tsHtmlPlugin__')
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let context: LitPluginContext | undefined = undefined

/**
 * Export a function for the ts-service to initialize our plugin.
 * @param typescript
 */
export function init({ typescript }: { typescript: typeof ts }): tsServer.server.PluginModule {
  // Cache the typescript module
  setTypescriptModule(typescript)

  /**
   * This function is used to print debug info once
   * Yes, it's a self destructing function!
   */
  let printDebugOnce: Function | undefined = () => {
    if (logger.level >= LitAnalyzerLoggerLevel.DEBUG) {
      logger.debug(`Lit Analyzer: ${pkg.version}`)
      logger.debug(`Web Component Analyzer: ${WCA_VERSION}`)
      logger.debug(`Running Typescript: ${typescript.version}`)
      logger.debug(`DIRNAME: ${__dirname}`)
      printDebugOnce = undefined
    }
  }

  return {
    create: (info: tsServer.server.PluginCreateInfo) => {
      // Check if the language service is already decorated
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((info.languageService as any)[tsHtmlPluginSymbol] != null) {
        return info.languageService
      }
      logger.setTsServerLogging(info.project.projectService.logger)

      // Save the current working directory
      info.config.cwd = info.config.cwd || info.project.getCurrentDirectory()

      // Extend existing language service with the plugin functions
      try {
        context = new LitPluginContext({
          ts: typescript,
          getProgram: () => {
            return info.languageService.getProgram()!
          },
          getProject: () => {
            return info.project
          },
        })

        context.updateConfig(makeConfig(info.config))

        logger.verbose('Starting ts-lit-plugin...')

        if (printDebugOnce != null) printDebugOnce()

        const plugin = new TsLitPlugin(info.languageService, context)

        const decoratedService = decorateLanguageService(info.languageService, plugin)

        // Save that we've extended this service to prevent extending it again
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(decoratedService as any)[tsHtmlPluginSymbol] = plugin

        return decoratedService
      } catch (e) {
        logger.error('ts-lit-plugin crashed while decorating the language service...', e)

        return info.languageService
      }
    },

    /**
     * Unfortunately this function isn't called with configuration from tsconfig.json
     * @param externalConfig
     */
    onConfigurationChanged(externalConfig?: Partial<LitAnalyzerConfig>) {
      if (context == null || externalConfig == null) return

      // Manually merge in configuration from "tsconfig.json"
      const compilerOptions = context.project?.getCompilerOptions()
      const tsLitPluginOptions =
        compilerOptions != null ? readLitAnalyzerConfigFromCompilerOptions(compilerOptions) : undefined

      // Make seed where options from "external" takes precedence over options from "tsconfig.json"
      const configSeed = {
        ...(tsLitPluginOptions || {}),
        ...externalConfig,

        // Also merge rules deep
        rules: {
          ...(tsLitPluginOptions?.rules || {}),
          ...(externalConfig.rules || {}),
        },
      }

      context.updateConfig(makeConfig(configSeed))
      if (printDebugOnce != null) printDebugOnce()
    },
  }
}

/**
 * Resolves the nearest tsconfig.json and returns the configuration seed within the plugins section for "@jarrodek/ts-lit-plugin"
 */
function readLitAnalyzerConfigFromCompilerOptions(
  compilerOptions: CompilerOptions
): Partial<LitAnalyzerConfig> | undefined {
  // Finds the plugin section
  if ('plugins' in compilerOptions) {
    const plugins = compilerOptions.plugins as ({ name: string } & Partial<LitAnalyzerConfig>)[]
    const tsLitPluginOptions = plugins.find((plugin) => plugin.name === '@jarrodek/ts-lit-plugin')
    if (tsLitPluginOptions != null) {
      return tsLitPluginOptions
    }
  }

  return undefined
}

export default init
