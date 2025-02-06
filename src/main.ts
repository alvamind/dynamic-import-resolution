import path from 'path';

/**
 * Configuration interface for import resolution.
 */
export interface ImportResolutionConfig {
    /**
     * Defines the structure of the output directories.
     * Examples: 'nested', 'flat', 'by-type', 'custom'
     * If 'custom', you must provide a `customPathPattern`.
     * 'nested':  Uses typeDirMap to create nested directories (e.g., models/User.ts, enums/OrderStatus.ts).
     * 'by-type': Similar to 'nested', but might have a different root.
     * 'flat': All files in the baseOutputDir, no subdirectories.
     */
    outputStructure: 'nested' | 'flat' | 'by-type' | 'custom';

    /**
     *  Mapping of target types (e.g., 'model', 'enum', 'schema') to their output directories
     *  Used when outputStructure is 'by-type' or 'nested'.
     *  Example: { model: 'models', enum: 'enums', schema: 'schemas' }
     */
    typeDirMap?: Record<string, string>;

    /**
     * File extension to use for generated files.
     * Example: '.ts', '.js', '.zod.ts', '.graphql'
     */
    fileExtension: string;

    /**
     * Base directory where all generated files are located.
     * Used as the root for resolving relative paths.
     */
    baseOutputDir: string;

    /**
     * Function to generate a custom path for a target file.
     * Takes target type and name as input, returns the full file path relative to baseOutputDir.
     * Only used if outputStructure is 'custom'.
     */
    customPathPattern?: (targetType: string, targetName: string) => string;

    /**
     * Naming convention for generated files.
     * Examples: 'PascalCase', 'camelCase', 'kebab-case', 'snake_case'
     * Could be a function for more complex logic.  Currently only supports string options.
     * 'PascalCase', 'camelCase', 'kebab-case', 'snake_case', 'lowerCase'
     */
    fileNameConvention?: 'PascalCase' | 'camelCase' | 'kebab-case' | 'snake_case' | 'lowerCase';

    /**
     *  Optional:  Directory where source files are located, if different from process.cwd() or baseOutputDir.
     *  Used as the base for resolving relative paths *from* the source file.
     *  Defaults to process.cwd() if not provided.
     */
    baseSourceDir?: string;
}

export interface ResolveImportPathParams {
    /** Path to the file where the import statement will be placed (source file). */
    sourceFilePath: string;

    /** Name of the target module/file to import (e.g., 'User', 'OrderStatus'). */
    targetName: string;

    /** Type of the target module (e.g., 'model', 'enum', 'schema', 'component'). */
    targetType: string;

    /** Configuration object for import resolution. */
    config: ImportResolutionConfig;
}

/**
 * Resolves the relative import path from the source file to the target file.
 * @param params Parameters for import path resolution.
 * @returns The relative import path as a string (e.g., './models/User', '../enums/OrderStatus.zod').
 *          Returns null if path cannot be resolved.
 */
export function resolveImportPath(params: ResolveImportPathParams): string | null {
    const { sourceFilePath, targetName, targetType, config } = params;
    const { baseOutputDir, outputStructure, typeDirMap, fileExtension, customPathPattern, fileNameConvention, baseSourceDir } = config;

    const sourceDir = baseSourceDir || process.cwd();

    let targetFilePathWithinBaseDir: string | null = null; // Initialize as null

    const applyNameConvention = (name: string, convention: ImportResolutionConfig['fileNameConvention']): string => {
        if (!convention) return name;
        switch (convention) {
            case 'PascalCase': return name.charAt(0).toUpperCase() + name.slice(1);
            case 'camelCase': return name.charAt(0).toLowerCase() + name.slice(1);
            case 'kebab-case': return name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
            case 'snake_case': return name.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1_$2').toLowerCase();
            case 'lowerCase': return name.toLowerCase();
            default: return name;
        }
    };

    const formattedTargetName = applyNameConvention(targetName, fileNameConvention);

    if (outputStructure === 'custom') {
        if (customPathPattern) {
            targetFilePathWithinBaseDir = customPathPattern(targetType, formattedTargetName);
        } else {
            console.warn(`outputStructure is 'custom', but customPathPattern is undefined. Returning null.`);
            return null; // Explicitly return null if customPathPattern is missing
        }
    } else if (outputStructure === 'nested' || outputStructure === 'by-type') {
        const typeDir = typeDirMap?.[targetType] || targetType + 's';
        targetFilePathWithinBaseDir = path.join(typeDir, `${formattedTargetName}${fileExtension}`);
    } else if (outputStructure === 'flat') {
        targetFilePathWithinBaseDir = `${formattedTargetName}${fileExtension}`;
    } else {
        console.warn(`Unknown outputStructure: ${outputStructure}. Returning null.`);
        return null; // Return null for unknown structures
    }


    if (!targetFilePathWithinBaseDir) {
        return null; // Should not happen, but for safety
    }

    const absoluteTargetFilePath = path.join(baseOutputDir, targetFilePathWithinBaseDir);
    const absoluteSourceFilePath = path.resolve(sourceDir, sourceFilePath);

    try {
        const relativePath = path.relative(path.dirname(absoluteSourceFilePath), absoluteTargetFilePath);
        if (!relativePath.startsWith('.') && !relativePath.startsWith('..')) {
            return './' + relativePath;
        }
        return relativePath.replace(/\\/g, '/');
    } catch (error) {
        console.error(`Error resolving import path from ${sourceFilePath} to ${targetName} (${targetType}):`, error);
        return null;
    }
}


export interface GenerateImportStatementParams extends ResolveImportPathParams {
    /**
     * Type of import statement to generate.
     * Examples: 'typescript-type', 'javascript-value', 'commonjs-require'
     */
    statementType: 'typescript-type' | 'javascript-value' | 'commonjs-require';

    /**
     *  Optional:  Specific named exports to import (if applicable to the statement type).
     *  Example: ['User', 'UserSchema']
     */
    namedExports?: string[];

    /**
     *  Optional: Default export name (if applicable to the statement type).
     */
    defaultExportName?: string;
}


/**
 * Generates a complete import statement string based on the resolved path and statement type.
 * @param params Parameters for generating the import statement.
 * @returns The complete import statement string (e.g., "import type { User } from './models/User';").
 *          Returns null if statement generation fails.
 */
export function generateImportStatement(params: GenerateImportStatementParams): string | null {
    const { statementType, namedExports, defaultExportName, ...resolvePathParams } = params;
    const resolvedPath = resolveImportPath(resolvePathParams);

    if (!resolvedPath) {
        return null;
    }

    switch (statementType) {
        case 'typescript-type': {
            const exports = namedExports ? `{ ${namedExports.join(', ')} }` : (defaultExportName ? defaultExportName : '*');
            return `import type ${exports} from '${resolvedPath}';`;
        }
        case 'javascript-value': {
            const exports = namedExports ? `{ ${namedExports.join(', ')} }` : (defaultExportName ? defaultExportName : '*');
            return `import ${exports} from '${resolvedPath}';`;
        }
        case 'commonjs-require': {
            if (defaultExportName) {
                return `const ${defaultExportName} = require('${resolvedPath}');`;
            } else if (namedExports) {
                return `const { ${namedExports.join(', ')} } = require('${resolvedPath}');`;
            } else {
                return `const module = require('${resolvedPath}');`;
            }
        }
        default:
            console.warn(`Unknown statementType: ${statementType}.`);
            return null;
    }
}
