requirejs(['./require.config'], function () {
    'use strict';
    requirejs(['jquery'], function ($) {
        $(document).ready(function() {
            requirejs(['init'], function (init) {
                requirejs([
                'consts',
                ], function() {
                    // assign JS_Multiselect developer functions here
                    var CONST = require('consts');
                    var ROOT_OBJ = CONST.GET_ROOT_OBJECT_REF();
                });
            });
        });// end on ready require
    });
});