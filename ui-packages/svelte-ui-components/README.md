# NOTE

until you figure out the bundling of the css with the packages this is useless!!!

Correct scripts when this works

```json
{
  "_phase:build": "svelte-kit sync && svelte-package",
  "_phase:code-quality": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
  "_phase:test": "exit 0;",
  "build": "svelte-kit sync && svelte-package",
  "build:app": "vite build",
  "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
  "dev": "NODE_ENV=development vite --port 7778 dev",
  "format": "prettier --plugin-search-dir . --write .",
  "lint": "prettier --plugin-search-dir . --check . && eslint .",
  "preview": "vite preview",
  "watch": "svelte-package --watch"
}
```

[Svelte awesome icons](https://docs.robbrazier.com/svelte-awesome/icons)
