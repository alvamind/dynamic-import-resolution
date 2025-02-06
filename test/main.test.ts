// main.test.ts
import { describe, it, beforeEach, expect, beforeAll, afterAll } from 'bun:test';
import * as fs from 'node:fs'; // Import the 'fs' module for directory operations
import * as path from 'node:path'
import {
    resolveImportPath,
    generateImportStatement,
    ImportResolutionConfig,
    ResolveImportPathParams,
    GenerateImportStatementParams
} from '../src/main'; // Corrected path

describe('dynamic-import-resolution', () => {
    let defaultConfig: ImportResolutionConfig;

    beforeEach(() => {
        defaultConfig = {
            outputStructure: 'flat',
            fileExtension: '.ts',
            baseOutputDir: './src/generated',
            fileNameConvention: 'PascalCase',
            baseSourceDir: './src'
        };
    });


    describe('resolveImportPath', () => {
        it('flat output structure', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat' };
            const params: ResolveImportPathParams = {
                sourceFilePath: './app/components/UserComponent.ts',
                targetName: 'User',
                targetType: 'model',
                config,
            };
            expect(resolveImportPath(params)).toBe('../../generated/User.ts');
        });

        it('nested output structure with typeDirMap', () => {
            const config: ImportResolutionConfig = {
                ...defaultConfig,
                outputStructure: 'nested',
                typeDirMap: { model: 'models', enum: 'enums' },
            };
            const params: ResolveImportPathParams = {
                sourceFilePath: './app/components/UserComponent.ts',
                targetName: 'User',
                targetType: 'model',
                config,
            };
            expect(resolveImportPath(params)).toBe('../../generated/models/User.ts');
        });

        it('by-type output structure', () => {
            const config: ImportResolutionConfig = {
                ...defaultConfig,
                outputStructure: 'by-type',
                typeDirMap: { model: 'types', enum: 'enums' },
            };
            const params: ResolveImportPathParams = {
                sourceFilePath: './utils/formatter.ts',
                targetName: 'ProductType',
                targetType: 'model',
                config,
            };
            expect(resolveImportPath(params)).toBe('../generated/types/ProductType.ts');
        });

        it('custom output structure with customPathPattern', () => {
            const config: ImportResolutionConfig = {
                ...defaultConfig,
                outputStructure: 'custom',
                customPathPattern: (targetType: string, targetName: string) => `schemas/${targetType}Schemas/${targetName}Schema.zod.ts`, // Corrected types
                fileExtension: '.zod.ts', // Override extension for this test
            };
            const params: ResolveImportPathParams = {
                sourceFilePath: './services/apiService.ts',
                targetName: 'Order',
                targetType: 'model',
                config,
            };
            expect(resolveImportPath(params)).toBe('../generated/schemas/modelSchemas/OrderSchema.zod.ts');
        });

        it('fileNameConvention: PascalCase', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, fileNameConvention: 'PascalCase', outputStructure: 'flat' };
            const params: ResolveImportPathParams = {
                sourceFilePath: './index.ts',
                targetName: 'userProfile',
                targetType: 'model',
                config,
            };
            expect(resolveImportPath(params)).toBe('./generated/UserProfile.ts');
        });

        it('fileNameConvention: kebab-case', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, fileNameConvention: 'kebab-case', outputStructure: 'flat' };
            const params: ResolveImportPathParams = {
                sourceFilePath: './components/dashboard.ts',
                targetName: 'orderItem',
                targetType: 'model',
                config,
            };
            expect(resolveImportPath(params)).toBe('../generated/order-item.ts');
        });

        it('fileNameConvention: snake_case', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, fileNameConvention: 'snake_case', outputStructure: 'flat' };
            const params: ResolveImportPathParams = {
                sourceFilePath: './utils/helper.ts',
                targetName: 'productCategory',
                targetType: 'enum',
                config,
            };
            expect(resolveImportPath(params)).toBe('../generated/product_category.ts');
        });

        it('fileNameConvention: lowerCase', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, fileNameConvention: 'lowerCase', outputStructure: 'flat' };
            const params: ResolveImportPathParams = {
                sourceFilePath: './api/routes.ts',
                targetName: 'eventName',
                targetType: 'event',
                config,
            };
            expect(resolveImportPath(params)).toBe('../generated/eventname.ts');
        });

        it('source file in subdirectory', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat' };
            const params: ResolveImportPathParams = {
                sourceFilePath: './components/UserCard.ts',
                targetName: 'Address',
                targetType: 'model',
                config,
            };
            expect(resolveImportPath(params)).toBe('../generated/Address.ts');
        });

        it('error case: invalid outputStructure (return null)', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'invalid-structure' as any };
            const params: ResolveImportPathParams = {
                sourceFilePath: './anywhere.ts',
                targetName: 'SomeType',
                targetType: 'type',
                config,
            };
            expect(resolveImportPath(params)).toBeNull();
        });
    });

    describe('generateImportStatement', () => {
        it('typescript-type statement with named exports', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'nested', typeDirMap: { model: 'models' } };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './index.ts',
                targetName: 'User',
                targetType: 'model',
                config,
                statementType: 'typescript-type',
                namedExports: ['User', 'UserType'],
            };
            expect(generateImportStatement(params)).toBe("import type { User, UserType } from './generated/models/User.ts';");
        });

        it('typescript-type statement with default export', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat' };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './utils.ts',
                targetName: 'helpers',
                targetType: 'utils',
                config,
                statementType: 'typescript-type',
                defaultExportName: 'Helpers',
            };
            expect(generateImportStatement(params)).toBe("import type Helpers from './generated/Helpers.ts';");
        });

        it('typescript-type statement with namespace import', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat' };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './component.ts',
                targetName: 'styles',
                targetType: 'styles',
                config,
                statementType: 'typescript-type',
            };
            expect(generateImportStatement(params)).toBe("import type * from './generated/Styles.ts';");
        });

        it('javascript-value statement with named exports', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'nested', typeDirMap: { schema: 'schemas' }, fileExtension: '.js' };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './validator.ts',
                targetName: 'UserSchema',
                targetType: 'schema',
                config,
                statementType: 'javascript-value',
                namedExports: ['UserSchema', 'validateUser'],
            };
            expect(generateImportStatement(params)).toBe("import { UserSchema, validateUser } from './generated/schemas/UserSchema.js';");
        });

        it('javascript-value statement with default export', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat', fileExtension: '.js' };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './main.js',
                targetName: 'config',
                targetType: 'config',
                config,
                statementType: 'javascript-value',
                defaultExportName: 'appConfig',
            };
            expect(generateImportStatement(params)).toBe("import appConfig from './generated/Config.js';");
        });

        it('javascript-value statement with namespace import', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat', fileExtension: '.js' };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './app.js',
                targetName: 'library',
                targetType: 'lib',
                config,
                statementType: 'javascript-value',
            };
            expect(generateImportStatement(params)).toBe("import * from './generated/Library.js';");
        });

        it('commonjs-require statement with default export', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat', fileExtension: '.cjs' };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './index.cjs',
                targetName: 'legacyModule',
                targetType: 'module',
                config,
                statementType: 'commonjs-require',
                defaultExportName: 'legacy',
            };
            expect(generateImportStatement(params)).toBe("const legacy = require('./generated/LegacyModule.cjs');");
        });

        it('commonjs-require statement with named exports', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat', fileExtension: '.cjs' };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './bootstrap.cjs',
                targetName: 'utilsModule',
                targetType: 'module',
                config,
                statementType: 'commonjs-require',
                namedExports: ['functionA', 'functionB'],
            };
            expect(generateImportStatement(params)).toBe("const { functionA, functionB } = require('./generated/UtilsModule.cjs');");
        });

        it('commonjs-require statement with module object import', () => {
            const config: ImportResolutionConfig = { ...defaultConfig, outputStructure: 'flat', fileExtension: '.cjs' };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './runner.cjs',
                targetName: 'anotherModule',
                targetType: 'module',
                config,
                statementType: 'commonjs-require',
            };
            expect(generateImportStatement(params)).toBe("const module = require('./generated/AnotherModule.cjs');");
        });


        it('error case: invalid statementType', () => {
            const config: ImportResolutionConfig = { ...defaultConfig };
            const params: GenerateImportStatementParams = {
                sourceFilePath: './file.ts',
                targetName: 'Unknown',
                targetType: 'unknown',
                config,
                statementType: 'invalid-statement' as any, // Simulate invalid statement type
            };
            expect(generateImportStatement(params)).toBeNull();
        });
    });
    describe('handles null resolvedPath', () => {
        const nonExistentDir = './non-existent-dir';
        const testDir = './test-temp'; // A temporary directory for our test
        beforeAll(() => {
            if (!fs.existsSync(testDir)) {  // Create test directory if it doesn't exist
                fs.mkdirSync(testDir);
            }
        });

        afterAll(() => {
            if (fs.existsSync(testDir)) {
                fs.rmdirSync(testDir, { recursive: true });
            }
        });
        it('return null for invalid target path ', () => {
            const config: ImportResolutionConfig = {
                ...defaultConfig,
                baseOutputDir: path.join(testDir, nonExistentDir), // Use a path *within* the temp dir
                outputStructure: 'custom',  // The important part to make resolveImportPath returns null
                customPathPattern: undefined // when customPathPattern is undefined
            };

            const params: GenerateImportStatementParams = {
                sourceFilePath: './src/file.ts',
                targetName: 'NonExistent',
                targetType: 'model',
                config,
                statementType: 'typescript-type',
            };
            expect(resolveImportPath(params)).toBeNull();
            expect(generateImportStatement(params)).toBeNull();
        });
    });
});
