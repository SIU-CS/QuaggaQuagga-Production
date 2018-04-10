define(['require', 'jquery', 'data_store/get'], function(require, $, getData) { 
    'use strict';

    var jquery;
    jquery = $;

    function recursData(data) {
        var rv = {};
        for(var i in data) {
            if (data[i]['@isHeader']) {
                rv[data[i]['@name']] = recursData(data[i]['@children']);
            } else if(data[i]['@selected']) {
                rv[data[i]['@name']] = data[i]['@value'];
            }
        }
        return rv;
    }


    function outputJSON(multiselectName) {
        var data = getData.getDataByName(multiselectName);
        if (data == null || $.isEmptyObject(data)) {
            console.warn(
                "Tried to get output from " + 
                multiselectName + 
                " but data doesn't exist or multiselect not registered"
            );
            return null;
        }
        var element = getData.getElementByName(multiselectName);
        if (element == null) {
            console.warn(
                "Tried to get output from " + 
                multiselectName + 
                " but element isn't loaded"
            );
            return null;
        }
        return recursData(data);
    }

   return outputJSON;
});