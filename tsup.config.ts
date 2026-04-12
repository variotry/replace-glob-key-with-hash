// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        "index": 'src/index.ts',
        "vite-plugin": 'src/vite-plugin.ts',
        "vite-plugin-rolldown": 'src/vite-plugin-rolldown.ts',
    },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    minify: true,
    clean: true,
    target: 'es2019',
    external: ['js-sha256', "radash"],
    splitting: false,
});
