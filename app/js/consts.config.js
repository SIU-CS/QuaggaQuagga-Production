define(['require', 'jquery'],function (require) {
    'use strict';

    var $, jquery;
    $ = jquery = require('jquery');

    function CONST_OPTIONS() {
        return { 
            search: {
                type: "text"
            },
            display: {
                type: "singleColumn"
            }
         };
    }

    function CONST_SINGLECOLUMN_LAYOUT() {
        return `<!-- MULTISELECT HEADER -->
            <div class="JSM-head navbar navbar-default">
                <span class="JSM-title navbar-brand"></span>
                <span class="JSM-search">
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

    function CONST_POPOVER_LAYOUT() {
        return `<!-- MULTISELECT HEADER -->
            <div class="JSM-head navbar navbar-default">
                <span class="JSM-title navbar-brand"></span>
                <span class="JSM-search">
                    <input class="JSM-searchbar form-control" type="text" placeholder="Search">
                </span>
            </div>
            <!-- MULTISELECT BODY -->
            <div class="JSM-body">
                <div class="JSM-popoverDisplay collapse in">
                </div>
            <!-- List structure and base style Via, Marcos from stackoverflow at "https://jsfiddle.net/ann7tctp/" -->
                <div class="JSM-list list-group-root">
                    
                </div>
            </div>
            <!-- MULTISELECT FOOTER -->
            <div class="JSM-footer"></div>`;
    }

    function CONST_MULTICOLUMN_LAYOUT() {
        return `<!-- MULTISELECT HEADER -->
            <div class="JSM-head navbar navbar-default">
                <span class="JSM-title navbar-brand"></span>
                <span class="JSM-search">
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
        return "JSMultiselect";
    }
    function MULTISELECTOR_STYLE_TYPES() {
        return ['singleColumn', 'multiColumn', 'popoverSelect'];
    }
    function DEFAULT_MULTISELECTOR_STYLE_TYPE() {
        return 'singleColumn';
    }
    function GET_ROOT_OBJECT_REF() {
        if(typeof window[MULTISELECTOR_ROOT_NAME()] == 'undefined' || window[MULTISELECTOR_ROOT_NAME()] == null)
            window[MULTISELECTOR_ROOT_NAME()] = {};
        return window[MULTISELECTOR_ROOT_NAME()];
    }
    
    if(typeof window[MULTISELECTOR_ROOT_NAME()] == 'undefined' || window[MULTISELECTOR_ROOT_NAME()] == null)
            window[MULTISELECTOR_ROOT_NAME()] = {};
    
    return {
        CONST_OPTIONS: CONST_OPTIONS,
        MULTISELECTOR_ROOT_NAME: MULTISELECTOR_ROOT_NAME,
        GET_ROOT_OBJECT_REF: GET_ROOT_OBJECT_REF,
        CONST_SINGLECOLUMN_LAYOUT: CONST_SINGLECOLUMN_LAYOUT,
        CONST_POPOVER_LAYOUT: CONST_POPOVER_LAYOUT,
        CONST_MULTICOLUMN_LAYOUT: CONST_MULTICOLUMN_LAYOUT,
        MULTISELECTOR_STYLE_TYPES: MULTISELECTOR_STYLE_TYPES,
        DEFAULT_MULTISELECTOR_STYLE_TYPE: DEFAULT_MULTISELECTOR_STYLE_TYPE
    };
});