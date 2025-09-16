# Migration Guide: JSON to TypeScript Translations

This document outlines the migration from JSON-based translations to TypeScript-based translations.

## What Changed

### Before (JSON-based)

- Translations stored in `frontend/public/locales/{locale}/{namespace}.json`
- Runtime fetching of JSON files
- No type safety for translation keys
- Potential for runtime errors with missing keys

### After (TypeScript-based)

- Translations stored in `frontend/locales/{locale}/{namespace}.ts`
- Compile-time imports and bundling
- Full type safety with TypeScript interfaces
- Compile-time error detection for missing keys

## Migration Steps Performed

1. **Created Type Definitions** (`frontend/locales/types.ts`)
   - Defined interfaces for all translation namespaces
   - Ensured type safety across all translation keys

2. **Converted JSON to TypeScript**
   - Migrated all translation files from JSON to TypeScript modules
   - Maintained same namespace structure (common, analysis, chat, etc.)
   - Preserved all existing translation keys and values

3. **Updated LanguageContext**
   - Modified to import translations directly instead of fetching
   - Removed async JSON loading logic
   - Improved performance by eliminating network requests

4. **Updated useTranslation Hook**
   - Added proper TypeScript typing
   - Maintained same API for components

5. **Updated Service Worker**
   - Removed references to locale JSON files
   - Reduced cache requirements

## Benefits Achieved

1. **Performance Improvements**
   - No network requests for translations
   - Faster app initialization
   - Better caching and bundle optimization

2. **Developer Experience**
   - IDE autocomplete for translation keys
   - Compile-time error detection
   - Better refactoring support

3. **Type Safety**
   - Prevents runtime errors from missing keys
   - Ensures consistency across locales

4. **Maintainability**
   - Easier to add new translations
   - Automatic detection of missing translations
   - Better tooling support

## Backwards Compatibility

The public API remains the same:

- `useTranslation()` hook works identically
- Same translation key format
- Same interpolation support
- Same namespace system

Components using translations require no changes.

## File Structure Comparison

### Before

```text
frontend/public/locales/
├── en-US/
│   ├── common.json
│   ├── analysis.json
│   └── ...
└── pt-BR/
    ├── common.json
    ├── analysis.json
    └── ...
```

### After

```text
frontend/locales/
├── types.ts
├── index.ts
├── en-US/
│   ├── index.ts
│   ├── common.ts
│   ├── analysis.ts
│   └── ...
└── pt-BR/
    ├── index.ts
    ├── common.ts
    ├── analysis.ts
    └── ...
```

## Breaking Changes

- **None for component usage** - The API remains identical
- **Development environment** - No longer need to serve locale files statically
- **Build process** - Translations are now bundled at compile time

## Future Considerations

1. **Adding New Languages**: Follow the TypeScript module pattern
2. **Translation Tools**: Consider tools that work with TypeScript files
3. **Bundle Splitting**: Consider splitting translations for very large apps
4. **Lazy Loading**: Can still implement lazy loading for optional translations

## Rollback Plan

If needed, the migration can be reversed by:

1. Restoring the JSON files from backup
2. Reverting the LanguageContext changes
3. Updating the service worker to cache JSON files again

However, this would lose all the benefits of the TypeScript-based system.
