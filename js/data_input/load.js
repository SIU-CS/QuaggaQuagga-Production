define(['require', 'jquery', 'data_input/liveHTML', 'data_input/array', 'data_input/HTML', 
'data_input/JSON', 'data_input/CSV', 'data_input/XML'],function (require) {
    'use strict';
    
    var $, jquery;
    $ = jquery = require('jquery');

    function getLoadFunction(functionPath) {
        var functionArray = functionPath.split(".");
        var fun =  window[functionArray[0]];
        for (var i = 1; i < functionArray.length; i += 1) {
            if (functionArray[i] == null) return null;
            else if (fun != null) fun = fun[functionArray[i]];
            else return null;
        }
        return fun;
    }

    /**
     * For each input type there should be a corresponding function labeled
     * under the caller Name
     */
    var typeFunctions = {
        "liveHTML": require('data_input/liveHTML'),
        "JSON": require('data_input/JSON'),
        "array": require('data_input/array'),
        "HTML": require('data_input/HTML'),
        "XML": require('data_input/XML'),
        "CSV": require('data_input/CSV')
    };
    
    /**
     * Calls the load function on the data produced by the data function
     * the developer passed in
     * @param {String} functionPath the name of the function to get the data from
     * @param {String} dataType The data type the above function returns
     */
    function load(functionPath, dataType) {
        // JSON is default data type
        if (dataType == null) dataType = 'JSON';
        var loadFunction = getLoadFunction(functionPath);
        // determines if we can get the data from the elements passed in
        if (typeFunctions[dataType] == null ||
            !jquery.isFunction(typeFunctions[dataType]) ||
            !jquery.isFunction(loadFunction)) return null;
        // gets the developers data
        var devData = loadFunction();
        if (devData == null) return null;
        // processes the data and returns 
        return typeFunctions[dataType](devData);
    }

    return load;
});