const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: ['.next/**', 'node_modules/**', 'convex/**']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    rules: {
      'no-console': 'off'
    }
  }
];
