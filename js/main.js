'use strict';

requirejs(['./require.config'], function () {
    requirejs(['init'], function (init) {
        requirejs([
        'consts',
        'styleI'
        ], function() {
            // assign JS_Multiselect developer functions here
            var CONST = require('consts');
            var ROOT_OBJ = CONST.GET_ROOT_OBJECT_REF();
            ROOT_OBJ.style = require('styleI');
        });
    });
});