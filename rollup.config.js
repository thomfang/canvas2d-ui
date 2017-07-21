var typescript = require('@alexlur/rollup-plugin-typescript');
var pkg = require('./package.json');

var banner =
    `/**
 * ${pkg.name} v${pkg.version}
 * Copyright (c) 2017-present ${pkg.author.name} <${pkg.author.email}>
 * All rights reserved.
 */
`;

module.exports = {
    entry: 'src/index.ts',
    format: 'umd',
    sourceMap: true,
    moduleName: 'canvas2dUI',
    moduleId: 'canvas2d-ui',
    dest: 'dist/canvas2d-ui.js',
    plugins: [
        typescript({
            typescript: require('typescript'),
            tsconfig: false,
            target: 'es5'
        })
    ],
    globals: {
        canvas2djs: 'canvas2d',
    },
    banner
}