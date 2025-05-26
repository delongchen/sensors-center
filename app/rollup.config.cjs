const typescript = require('@rollup/plugin-typescript')
const pkg = require('./package.json')
const { builtinModules } = require('node:module')

module.exports = {
  input: {
    master: 'src/master/index.ts',
    worker: 'src/worker/index.ts',
    main: 'src/main.ts',
  },
  output: [
    {
      dir: 'dist',
      format: 'cjs',
    }
  ],
  plugins: [
    typescript({}),
  ],
  external: [
    ...builtinModules,
    ...builtinModules.map(name => `node:${name}`),
    ...Object.keys(pkg?.dependencies ?? {}),
    ...Object.keys(pkg?.devDependencies ?? {}),
    'winston',
    'winston-daily-rotate-file'
  ]
}
