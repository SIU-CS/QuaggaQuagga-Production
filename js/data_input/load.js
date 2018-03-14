define(['require', 'jquery', 'data_input/liveHTML'],function (require) {
    var $, jquery;
    $ = jquery = require('jquery');
    var typeFunctions = {
        "liveHTML": require('data_input/liveHTML')
    };
    return function(loadFunction, dataType) {
        if (dataType == null) dataType = 'JSON';
        // determines if we can get the data from the elements passed in
        if (typeFunctions[dataType] == null ||
            window[loadFunction] == null ||
            !jQuery.isFunction(typeFunctions[dataType]) ||
            !jQuery.isFunction(window[loadFunction])) return null;
        // returns the data
        return typeFunctions[dataType](window[loadFunction]());
    }
});