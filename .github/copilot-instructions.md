# Copilot Instructions for AI Coding Agents

## Project Overview
- **TypeScript plugin for Lit-html**: Adds type checking and code completion for Lit-html templates and LitElement components.
- **Main entry**: `src/ts-lit-plugin/ts-lit-plugin.ts` implements the plugin logic. Supporting modules are in `src/ts-lit-plugin/` and `src/translate/`.
- **Architecture**: Modular, with translation helpers for diagnostics, completions, quick info, etc. (`src/ts-lit-plugin/translate/`).
- **External dependencies**: Relies on `@jarrodek/lit-analyzer` and `@jarrodek/web-component-analyzer` for code analysis.

## Developer Workflows
- **Build**: `npm run build` (uses Wireit, see `package.json`).
- **Lint**: `npm run lint:fix` for ESLint auto-fix.
- **Format**: `npm run format` (Prettier), `npm run format:check` to verify formatting.
- **Readme generation**: `npm run readme` (uses `readme.config.json` and `readme.blueprint.md`).
- **Testing**: `npm test` (uses @japa/runner)

## Key Conventions & Patterns
- **Plugin configuration**: Controlled via `tsconfig.json` `plugins` section. See README for options like `strict`, `rules`, `htmlTemplateTags`, etc.
- **Rule enforcement**: Rules for validating custom elements, bindings, events, and CSS are documented in the README. Severity depends on `strict` mode.
- **TypeScript-first**: Many checks and features work best in `.ts` files due to richer type info.
- **JSDoc for metadata**: Use JSDoc tags (`@attr`, `@prop`, `@fires`, `@slot`, etc.) to document custom elements for better analysis.
- **Global tag/attribute/event support**: Configure via plugin options for project-wide HTML/CSS conventions.
- **Translation helpers**: All code fix, completion, diagnostic, and info translation logic is in `src/ts-lit-plugin/translate/`.

## Integration Points
- **TypeScript Language Service**: The plugin hooks into TypeScript's language service for diagnostics and completions.
- **VS Code**: Optionally use the [lit-plugin extension](https://marketplace.visualstudio.com/items?itemName=runem.lit-plugin-maintained) for enhanced editor support.

## File/Directory References
- `src/ts-lit-plugin/ts-lit-plugin.ts`: Main plugin implementation
- `src/ts-lit-plugin/lit-plugin-context.ts`: Context management for plugin
- `src/ts-lit-plugin/translate/`: Translation helpers for diagnostics, completions, etc.
- `package.json`: Scripts, dependencies, Wireit build config
- `README.md`: Full documentation of rules, configuration, and examples

## Example: Custom Element Type Registration
```typescript
// Register custom element for type checking
declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
```

## Example: JSDoc for Component Metadata
```typescript
/**
 * @attr size
 * @prop {String} value
 * @fires change
 * @slot right
 */
class MyElement extends HTMLElement {}
```

---

**If any workflow, convention, or integration is unclear or missing, please provide feedback so this guide can be improved.**
