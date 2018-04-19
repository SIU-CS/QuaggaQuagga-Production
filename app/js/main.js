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
// register onload event
(function() {
    'use strict';
    var onloadFunctions = [];
    if (window["JSMultiselect"] == null) 
        window["JSMultiselect"] = {};
    if (window["JSMultiselect"]["onload"] == null)
        window["JSMultiselect"]["onload"] = {};

    window["JSMultiselect"]["onload"]["isLoaded"] = false;
    window["JSMultiselect"]["onload"]["addCallback"] = function(func) {
        if (typeof func != "function") {
            console.warn("onload callback is not a function");
            return;
        } 
        onloadFunctions.push(func);
        if (window["JSMultiselect"]["onload"]["isLoaded"] == true) {
            func();
        }
    };
    window["JSMultiselect"]["onload"]["executeCallback"] = function() {
        for(var i = 0; i < onloadFunctions.length; i += 1) {
            if (typeof onloadFunctions[i] == "function") {
                onloadFunctions[i]();
            }
        }
    };

}());

requirejs(['jquery', 'init', 'data_input/interface', 'data_output/interface'], function ($) {
    'use strict';
    $(document).ready(function(){
        window["JSMultiselect"]["onload"]["isLoaded"] = true;
        window["JSMultiselect"]["onload"]["executeCallback"]();
    });
});
