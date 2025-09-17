// i18next-parser.config.js
export default {
  locales: ['en-US', 'pt-BR'],
  // onde gerar os JSONs
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  // onde procurar strings
  input: [
    //'./**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    //'./pages/**/*.{ts,tsx,js,jsx}',
  ],
  // namespaces que você já usa
  namespace: ['common', 'kanban', 'dashboard', 'analysis', 'landing', 'input', 'docReview', 'errors'],
  createOldCatalogs: true, // move órfãs pra _old.json
  keepRemoved: true,
  lexers: {
    tsx: ['JsxLexer'],
    ts: ['JsxLexer'],
    js: ['JsxLexer'],
    jsx: ['JsxLexer'],
  },
  // IGNORA node_modules, build, dist, etc
  ignore: [
    './node_modules/**',
    './build/**',
    './dist/**',
    './public/**',
    './.next/**',
    './out/**',
    './coverage/**',
    './*.config.js',
    './*.config.cjs',
    './*.config.mjs',
    './i18n/**',
    './*.test.{ts,tsx,js,jsx}',
    './*.spec.{ts,tsx,js,jsx}',
    './__tests__/**',
    './__mocks__/**',
  ],
};
