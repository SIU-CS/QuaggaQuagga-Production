({
  baseUrl: "./app/js",
  include: ['../lib/almond-0.3.3', 'main'],
  insertRequire: ['main'],
  out: './dist/main.js',
  wrap: true,
  optimize: 'none',
  paths: {
    init: './init.config',
    consts: './consts.config',
    lib: '../lib',
    "jquery": './utility/getJquery',
    "logger": './utility/logger'
  }
});