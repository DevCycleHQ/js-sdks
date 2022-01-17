module.exports = {
    rules: {
        'max-len': ['error', 120, 2],
        'indent': ['error', 4, { 'SwitchCase': 1 }],
        'semi': ['error', 'never'],
        'quotes': ['error', 'single'],
        'arrow-parens': ['error', 'always'],
        'no-param-reassign': 'error',
        'space-before-function-paren': ['error', {
            'anonymous': 'never',
            'named': 'never',
            'asyncArrow': 'always'
        }],
        'object-curly-spacing': ['error', 'always'],
        'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
        'keyword-spacing': ['error', { 'before': true }],
        'no-multiple-empty-lines': [2, { 'max': 1 }]
    }
}
