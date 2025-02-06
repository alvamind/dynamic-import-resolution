# dynamic-import-resolution

[![npm version](https://badge.fury.io/js/dynamic-import-resolution.svg)](https://www.npmjs.com/package/dynamic-import-resolution)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Dynamically resolve import paths and generate import statements in JavaScript and TypeScript projects.**

## Overview

`dynamic-import-resolution` is a powerful, zero-dependency Node.js library that simplifies the process of generating dynamic, *correct*, and *consistent* import statements in your JavaScript and TypeScript code.  It intelligently determines the relative import path between files based on your project's structure and configuration, eliminating manual path calculations and reducing the risk of broken imports during refactoring or code generation.  It supports multiple module systems (ES Modules, CommonJS) and provides extensive customization options. This library is an ideal choice for code generators, build tools, and any situation where you need to programmatically create import statements.

## Key Features

*   **Flexible Output Structures:**  Supports `flat`, `nested`, `by-type`, and completely `custom` directory structures for your generated files.  Adapt the library to *your* project, not the other way around.
*   **Precise Path Resolution:** Calculates the *exact* relative path between the source file (where the import statement will be) and the target file (the module being imported). No more `../../../` guesswork.
*   **Multiple Module Systems:**  Generates import statements for:
    *   **ES Modules (JavaScript):**  `import { ... } from '...';`
    *   **ES Modules (TypeScript Types):** `import type { ... } from '...';`
    *   **CommonJS:** `const ... = require('...');`
*   **Configurable File Naming:**  Control the naming convention of your generated files:  `PascalCase`, `camelCase`, `kebab-case`, `snake_case`, and `lowerCase`.
*   **Custom Path Patterns:**  Define your *own* output path logic with a simple function.  Complete control when the built-in structures aren't enough.
*   **Type-Aware Directory Mapping:** Organize your generated files into directories based on their type (e.g., models, enums, schemas) using the `typeDirMap` option.
*   **Zero Dependencies:**  Keeps your project lightweight.
*   **TypeScript Support:**  Written in TypeScript, providing excellent type safety and autocompletion.
*   **Handles Edge Cases:** robust error handling and returns `null` for unresolvable situations.
*   **Bun Support** library's test made and passed with [bun](https://bun.sh)

## Benefits

*   **Reduced Errors:** Eliminates manual path calculations, minimizing the risk of incorrect import paths.
*   **Improved Code Maintainability:** Simplifies refactoring and code generation by automatically updating import statements.
*   **Increased Productivity:**  Spend less time debugging import issues and more time building features.
*   **Consistent Code Style:** Enforces consistent file naming and import statement formatting.
*   **Enhanced Code Generation:** A perfect fit for code generators, build tools, and metaprogramming tasks.
*   **Framework Agnostic:** Use it with any JavaScript/TypeScript project, regardless of framework (React, Angular, Vue, Node.js, etc.).

## Installation

```bash
npm install dynamic-import-resolution --save-dev
# or
bun install dynamic-import-resolution --save-dev
```

## Usage

The library provides two main functions:  `resolveImportPath` and `generateImportStatement`.

### `resolveImportPath`

Calculates the relative import path.

```typescript
import { resolveImportPath, ImportResolutionConfig, ResolveImportPathParams } from 'dynamic-import-resolution';

const config: ImportResolutionConfig = {
    outputStructure: 'nested',
    typeDirMap: { model: 'models', enum: 'enums' },
    fileExtension: '.ts',
    baseOutputDir: './src/generated',
    baseSourceDir: './src',
    fileNameConvention: 'PascalCase'
};

const params: ResolveImportPathParams = {
    sourceFilePath: './app/components/UserComponent.ts',
    targetName: 'User',
    targetType: 'model',
    config
};

const relativePath = resolveImportPath(params);
console.log(relativePath); // Output:  '../../generated/models/User.ts'
```

### `generateImportStatement`

Generates the complete import statement.

```typescript
import { generateImportStatement, ImportResolutionConfig, GenerateImportStatementParams } from 'dynamic-import-resolution';

const config: ImportResolutionConfig = {
    outputStructure: 'flat',
    fileExtension: '.js',
    baseOutputDir: './dist',
    fileNameConvention: 'camelCase'
};

const params: GenerateImportStatementParams = {
    sourceFilePath: './src/index.js',
    targetName: 'myUtility',
    targetType: 'util',
    config,
    statementType: 'javascript-value',
    namedExports: ['helperFunction', 'anotherHelper']
};

const importStatement = generateImportStatement(params);
console.log(importStatement); // Output: import { helperFunction, anotherHelper } from './dist/myUtility.js';
```

## API Reference

### `ImportResolutionConfig`

This interface defines the configuration options for the library.

| Property             | Type                                     | Description                                                                                                                                                                                              | Required | Default Value |
| -------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ------------- |
| `outputStructure`    | `'nested' \| 'flat' \| 'by-type' \| 'custom'` | Determines the directory structure of the generated files. See "Output Structures" below.                                                                                                      |   Yes    | -             |
| `typeDirMap`         | `Record<string, string>`                 | Maps target types (e.g., 'model', 'enum') to directory names.  Used with `nested` and `by-type` structures.                                                                                          |    No   | -             |
| `fileExtension`      | `string`                                 | The file extension for generated files (e.g., '.ts', '.js').                                                                                                                                         |   Yes    | -             |
| `baseOutputDir`      | `string`                                 | The root directory for all generated files.                                                                                                                                                            |   Yes    | -             |
| `customPathPattern`  | `(targetType: string, targetName: string) => string` | A function that defines the output path for a given target type and name.  *Required* when `outputStructure` is `custom`.                                                                          |    No   | -             |
| `fileNameConvention` | `'PascalCase' \| 'camelCase' \| 'kebab-case' \| 'snake_case' \| 'lowerCase'` |  The naming convention for generated files.                                                                                                                                                        |    No   | 'PascalCase'          |
| `baseSourceDir`      | `string`                                 | The root directory of your source files.  Used to resolve the *source* file path. Defaults to `process.cwd()`.                                                                                    |    No   | `process.cwd()`            |

### `ResolveImportPathParams`

This interface defines the parameters for the `resolveImportPath` function.

| Property        | Type                      | Description                                                              | Required |
| --------------- | ------------------------- | ------------------------------------------------------------------------ | :------: |
| `sourceFilePath` | `string`                  | The path to the file where the import statement will be generated.       |   Yes    |
| `targetName`    | `string`                  | The name of the module to be imported.                                   |   Yes    |
| `targetType`    | `string`                  | The type of the module (e.g., 'model', 'enum', 'schema').               |   Yes    |
| `config`        | `ImportResolutionConfig` | The configuration object.                                                |   Yes    |

### `GenerateImportStatementParams`

This interface defines the parameters for the `generateImportStatement` function.  It extends `ResolveImportPathParams` and adds options for specifying the import statement type.

| Property          | Type                                         | Description                                                                                                        | Required |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | :------: |
| `statementType`   | `'typescript-type' \| 'javascript-value' \| 'commonjs-require'` | The type of import statement to generate.                                                                       |   Yes    |
| `namedExports`    | `string[]`                                   | An array of named exports to import (for `typescript-type` and `javascript-value`).                                |    No   |
| `defaultExportName` | `string`                                     | The name of the default export (for `typescript-type`, `javascript-value` and `commonjs-require`).              |    No   |
| ... (other props) |  From `ResolveImportPathParams`        | All properties from  `ResolveImportPathParams`                                      |   Yes   |

### Return Values

Both `resolveImportPath` and `generateImportStatement` return:

*   **`string`:** The resolved path or generated import statement, respectively.
*   **`null`:**  If the path cannot be resolved or the statement cannot be generated (e.g., invalid configuration, missing `customPathPattern`, unsupported `statementType`).

## Output Structures

The `outputStructure` option controls how generated files are organized:

*   **`flat`:** All generated files are placed directly in the `baseOutputDir`.
*   **`nested`:** Files are organized into subdirectories based on `typeDirMap`.  For example, with `typeDirMap: { model: 'models', enum: 'enums' }`, models would go in `baseOutputDir/models` and enums in `baseOutputDir/enums`.
*   **`by-type`:** Similar to `nested`, but the subdirectory structure might have a different root or a slightly different organization.  Also uses `typeDirMap`.
*   **`custom`:**  You provide a `customPathPattern` function that takes the `targetType` and `targetName` and returns the full output path (relative to `baseOutputDir`). This offers maximum flexibility.

## Filename Conventions

The `fileNameConvention` option controls the casing of the generated filenames:
*  **PascalCase:**  `MyExampleFile.ts`
*   **camelCase:** `myExampleFile.ts`
* **kebab-case:** `my-example-file.ts`
*  **snake_case:** `my_example_file.ts`
*   **lowerCase:** `myexamplefile.ts`

## Examples

### Custom Output Structure

```typescript
const config: ImportResolutionConfig = {
    outputStructure: 'custom',
    customPathPattern: (targetType, targetName) => {
        return `schemas/${targetType}Schemas/${targetName}Schema.zod.ts`;
    },
    fileExtension: '.zod.ts',
    baseOutputDir: './src/generated',
    fileNameConvention: 'PascalCase'
};

const params: ResolveImportPathParams = {
    sourceFilePath: './services/apiService.ts',
    targetName: 'Order',
    targetType: 'model',
    config
};

const relativePath = resolveImportPath(params); // '../generated/schemas/modelSchemas/OrderSchema.zod.ts'

```

### CommonJS Require with Default Export

```typescript
const config: ImportResolutionConfig = {
    outputStructure: 'flat',
    fileExtension: '.cjs',
    baseOutputDir: './dist',
};

const params: GenerateImportStatementParams = {
    sourceFilePath: './src/index.cjs',
    targetName: 'legacyModule',
    targetType: 'module',
    config,
    statementType: 'commonjs-require',
    defaultExportName: 'legacy'
};

const importStatement = generateImportStatement(params); // const legacy = require('./dist/LegacyModule.cjs');
```
### Error Handling Examples
```typescript
// Example 1: Missing customPathPattern with 'custom' outputStructure

const config1: ImportResolutionConfig = {
    outputStructure: 'custom', // customPathPattern is required but missing
    fileExtension: '.ts',
    baseOutputDir: './output',
};

const params1: ResolveImportPathParams = {
    sourceFilePath: './src/component.ts',
    targetName: 'MyComponent',
    targetType: 'component',
    config: config1,
};

const result1 = resolveImportPath(params1);
console.log(result1); // Output: null (and a warning in the console)

// Example 2: Invalid outputStructure
const config2: ImportResolutionConfig = {
    outputStructure: 'invalid-structure' as any, // Invalid value
    fileExtension: '.js',
    baseOutputDir: './output',
};

const params2: ResolveImportPathParams = {
    sourceFilePath: './src/main.js',
    targetName: 'Utils',
    targetType: 'util',
    config: config2,
};

const result2 = resolveImportPath(params2);
console.log(result2); // Output: null (and a warning in the console)
// Example 3: Invalid statementType
const config3: ImportResolutionConfig = {
    outputStructure: 'flat',
    fileExtension: '.ts',
    baseOutputDir: './output',
};

const params3: GenerateImportStatementParams = {
    sourceFilePath: './src/app.ts',
    targetName: 'MyModule',
    targetType: 'module',
    config: config3,
    statementType: 'invalid-type' as any, // Invalid value
};

const result3 = generateImportStatement(params3);
console.log(result3); // Output: null (and a warning in the console)
```
## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details. (Create this file if you want to accept contributions.)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

*   **`null` return values:** Ensure your `ImportResolutionConfig` is valid, especially `outputStructure` and `customPathPattern` (if applicable). Check the console for warnings.
*   **Incorrect paths:** Double-check `baseOutputDir`, `baseSourceDir`, and `typeDirMap`.  Use absolute paths in your configuration if you're unsure.
*   **Unexpected file names:**  Verify your `fileNameConvention` setting.

##  Frequently Asked Questions (FAQ)

1.  **Q: Can I use this with languages other than JavaScript/TypeScript?**
    *   **A:** While the library is written in TypeScript and primarily designed for JS/TS, the `resolveImportPath` function could be adapted for other languages if you provide the correct path separators and file extensions in the configuration.  Generating import statements would likely require custom logic for other languages.

2.  **Q: Does this library handle circular dependencies?**
    *   **A:**  `dynamic-import-resolution` focuses solely on *resolving import paths*.  It does *not* detect or prevent circular dependencies.  You'll need separate tooling (like `madge` or `dependency-cruiser`) to manage circular dependencies.

3.  **Q: Can I use this with a bundler like Webpack or Rollup?**
    *   **A:** Yes, absolutely!  This library can be used *before* bundling to generate the correct import statements.  The bundler will then handle the actual module resolution and bundling.

4.  **Q: How does this compare to other path resolution libraries?**
    *   **A:**  Many path resolution libraries focus on resolving paths at *runtime* (e.g., finding modules in `node_modules`).  `dynamic-import-resolution` is designed for *static* path resolution, primarily for code generation or build-time tasks.  It offers more control over the output structure and file naming conventions.

5.  **Q: Can I use a custom function for `fileNameConvention`?**
     * **A:** Yes, you can submit pull request!

## Roadmap

*   **[Planned]** Support import assertions.
*   **[Planned]** Custom function as `fileNameConvention`.
*   **[Suggestion]** Add more advanced path manipulation options (e.g., aliasing).

## Related Projects

*   **[madge](https://www.npmjs.com/package/madge):**  A developer tool for generating a visual graph of your module dependencies, finding circular dependencies, and more.
*   **[dependency-cruiser](https://www.npmjs.com/package/dependency-cruiser):**  Validates and visualizes dependencies.  Helps you understand and refactor your codebase.

## Keywords

dynamic imports, import resolution, JavaScript, TypeScript, code generation, build tools, relative paths, module resolution, ES Modules, CommonJS, path manipulation, file naming, code maintainability, refactoring, metaprogramming, static analysis,  bun
