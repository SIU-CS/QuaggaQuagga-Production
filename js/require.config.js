(function() {
    'use strict';
    var baseURL = require.toUrl('');
    // set default base url if not already done
    if (baseURL == './') // inital base url
        requirejs.config({ baseUrl: './js' });

    // set the rest of the options
    requirejs.config({
        paths: {
            "app": "../app",
            init: './init.config',
            consts: './consts.config',
            lib: '../lib',
            styleI: './style/include',
            "jquery": '../lib/jquery-3.3.1.min',
            "utility": './utility',
            "logger": './utility/logger'
        }
    });
}());