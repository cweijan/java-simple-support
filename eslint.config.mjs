import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import stylisticJs from '@stylistic/eslint-plugin-js';
import unusedImports from 'eslint-plugin-unused-imports';

// npx eslint "src/**/*.ts" --fix
export default [
    { files: ['**/*.ts'], },
    { ignores: ['**/*.d.ts'] },
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
            'unused-imports': unusedImports, '@stylistic/js': stylisticJs
        },
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: 'module',
        },
        rules: {
            '@stylistic/js/quote-props': ['error', 'as-needed'],
            'unused-imports/no-unused-imports': 'warn',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-duplicate-enum-values': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-this-alias': 'off',
            '@typescript-eslint/triple-slash-reference': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            quotes: [
                'error',
                'single',
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true
                }
            ]
        },
    }];