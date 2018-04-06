define(['require', 'consts', 'data_output/flatArray', 'data_output/JSON'],
function(require, CONSTS, flatArray, JSONoutput) { 
    'use strict';

    var rootObject = CONSTS.GET_ROOT_OBJECT_REF();

    rootObject['GetData'] = {
        flatArray: flatArray,
        JSON: JSONoutput
    };
});