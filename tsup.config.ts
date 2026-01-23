// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: {
        //index: 'src_ts/index.ts',
        node: 'src/node.ts',
        //browser: 'src_ts/browser.ts',
    },
    outDir: 'dist',
    format: ['esm', 'cjs'],
    dts: true,
    minify: true,
    clean: true,
    target: 'es2019'
});
