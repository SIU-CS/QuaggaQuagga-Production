'use strict';

requirejs.config({
    baseUrl: './js',
    paths: {
        "app": "../app",
        init: './init.config',
        consts: './consts.config',
        lib: '../lib',
        styleI: './style/include',
        "jquery": (!window.jQuery && !window.$ ? "//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min" : window.jQuery || window.$),
        "utility": './utility',
        "logger": './utility/logger'
    }
});
