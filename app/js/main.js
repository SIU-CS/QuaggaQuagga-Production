(function() {
    'use strict';
    // set the rest of the options
    requirejs.config({
        paths: {
            "app": "../app",
            init: './init.config',
            consts: './consts.config',
            lib: '../lib',
            "jquery": './utility/getJquery',
            "utility": './utility',
            "logger": './utility/logger'
        }
    });
}());
requirejs(['init', 'data_input/interface', 'data_output/interface'], function () {

});
