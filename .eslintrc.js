var defaultPlugins = [
    '@typescript-eslint/eslint-plugin',
    'import',
    'jest'
];
var defaultEnv = {
    es6: true
};
var defaultGlobals = {

};
var javascriptDefaultRules = {
    'indent': [
        'error',
        4,
        { 'SwitchCase': 1 }
    ],
    'comma-dangle': [
        'error',
        'never'
    ],
    'no-unused-vars': [
        'warn',
        { 'argsIgnorePattern': '^__unused' }
    ],
    'no-trailing-spaces': [
        'error'
    ],
    'quotes': [
        'error',
        'single'
    ],
    'semi': [
        'error',
        'always'
    ]
};

var typescriptDefaultRules = Object.assign({}, javascriptDefaultRules, {
    '@typescript-eslint/no-unused-vars': [
        'warn',
        { 'argsIgnorePattern': '^__unused' }
    ],
    '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
            'allowTypedFunctionExpressions': true
        }
    ]
});

var javascriptExtensions = [
    'eslint:recommended'
];

var typescriptExtensions = javascriptExtensions.concat([
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
]);

module.exports = {
    root: true,
    extends: javascriptExtensions,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    settings: {
        react: {
            version: 'detect'
        }
    },
    globals: defaultGlobals,
    plugins: defaultPlugins,
    rules: javascriptDefaultRules,
    overrides: [
        {
            files: [
                '*eslint*',
                '*config.js',
                'scripts/*'
            ],
            env: {
                node: true
            }
        },
        {
            files: [
                '**/*.ts', '**/*.tsx'
            ],
            globals: {
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly'
            },
            extends: typescriptExtensions,
            rules: typescriptDefaultRules
        },
        {
            files: [
                '**/*.test.js',
                '**/*.test.jsx',
                '**/test/**/*.js',
                '**/test/**/*.jsx'
            ],
            env: Object.assign({}, defaultEnv, {
                'jest/globals': true
            }),
            extends: javascriptExtensions,
            rules: javascriptDefaultRules
        },
        {
            files: [
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/test/**/*.ts',
                '**/test/**/*.tsx'
            ],
            env: Object.assign({}, defaultEnv, {
                'jest/globals': true
            }),
            globals: {
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly'
            },
            extends: typescriptExtensions,
            rules: typescriptDefaultRules
        }
    ]
};
