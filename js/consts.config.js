'use strict';

define(['require', 'jquery'],function (require) {
    var $, jquery;
    $ = jquery = require('jquery');

    function CONST_OPTIONS() {
        return { }
    }

    function CONST_LAYOUT() {
        return `<!-- MULTISELECT HEADER -->
            <div class="JSM-head navbar navbar-default">
                <span class="JSM-title navbar-brand"></span>
                <span class="JSM-search form-group">
                    <input class="JSM-searchbar form-control" type="text" placeholder="Search">
                </span>
            </div>
            <!-- MULTISELECT BODY -->
            <div class="JSM-body">
                <!-- List structure and base style Via, Marcos from stackoverflow at "https://jsfiddle.net/ann7tctp/" -->
                <div class="JSM-list list-group-root">
                    
                </div>
            </div>
            <!-- MULTISELECT FOOTER -->
            <div class="JSM-footer"></div>`;
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
        GET_ROOT_OBJECT_REF: GET_ROOT_OBJECT_REF,
        CONST_LAYOUT: CONST_LAYOUT
    }
});