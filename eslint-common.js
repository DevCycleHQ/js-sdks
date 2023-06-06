module.exports = {
    "extends": ["prettier"],
    rules: {
    'max-len': ['error', 120, 2],
    'no-param-reassign': 'error',
    'object-curly-spacing': ['error', 'always'],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'keyword-spacing': ['error', { before: true }],
    'no-multiple-empty-lines': [2, { max: 1 }],
  },
}
