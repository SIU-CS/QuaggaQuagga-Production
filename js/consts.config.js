'use strict';

define(['require'],function (require) {

    function CONST_OPTIONS() {
        return { }
    }

    function MULTISELECTOR_ROOT_NAME() {
        return "JS_Multiselect";
    }
    function GET_ROOT_OBJECT_REF() {
        if(typeof window[MULTISELECTOR_ROOT_NAME()] == 'undefined' || window[MULTISELECTOR_ROOT_NAME()] == null)
            window[MULTISELECTOR_ROOT_NAME()] = {};
        return window[MULTISELECTOR_ROOT_NAME()];
    }
    
    return {
        CONST_OPTIONS: CONST_OPTIONS,
        MULTISELECTOR_ROOT_NAME: MULTISELECTOR_ROOT_NAME,
        GET_ROOT_OBJECT_REF: GET_ROOT_OBJECT_REF
    }
});