define(['require', 'jquery', 'data_input/liveHTML', 'data_input/JSON'],function (require) {
    var $, jquery;
    $ = jquery = require('jquery');

    /**
     * For each input type there should be a corresponding function labeled
     * under the caller Name
     */
    var typeFunctions = {
        "liveHTML": require('data_input/liveHTML'),
        "JSON": require('data_input/JSON')
    };
    
    /**
     * Calls the load function on the data produced by the data function
     * the developer passed in
     * @param {String} loadFunction the name of the function to get the data from
     * @param {String} dataType The data type the above function returns
     */
    function load(loadFunction, dataType) {
        // JSON is default data type
        if (dataType == null) dataType = 'JSON';
        // determines if we can get the data from the elements passed in
        if (typeFunctions[dataType] == null ||
            window[loadFunction] == null ||
            !jQuery.isFunction(typeFunctions[dataType]) ||
            !jQuery.isFunction(window[loadFunction])) return null;
        // gets the developers data
        var devData = window[loadFunction]();
        if (devData == null) return null;
        // processes the data and returns 
        return typeFunctions[dataType](devData);
    }

    return load;
});