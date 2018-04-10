define(['require', 'jquery', 'data_store/new'], function(require) { 
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');

    function Seperator(csvString){
        var rows = csvString.trim().split("\n");
        var seperated = [];
        for(var i in rows){
            seperated.push(rows[i].split(","));
            for(var r in seperated[i]) 
                seperated[i][r] = seperated[i][r].replace(/"/g, '').trim();
        }
        return seperated;
    }

    function getHeaderItems(array, name) {
        var headerArray = [];
        for(var i = 0; i < array.length; i += 1) {
            var splitname = array[i][0].split(".");
            if(splitname.length > 1 && splitname[0] == name){
                array[i][0] = array[i][0].replace(name + ".", '');
                headerArray.push(array.splice(i, 1)[0]);
                i -= 1;
            }
        }
        return headerArray;
    }

    function NestData(sepinput){
        for(var i in sepinput) {
            if (sepinput[i][0] != null && sepinput[i][0].indexOf('.') == -1) {
                var header = getHeaderItems(sepinput, sepinput[i][0]);
                if (header.length > 0) {
                    sepinput[i][sepinput[i].length] = NestData(header);
                }
            }
        }
        return sepinput;
    }

    var NUM_ATTRIBUTES = 6;

    function ProcessCSV(data) {
        var rv = []; // returnvalue

        // loop
        for(var i =0; i <data.length; i += 1){
            var name = data[i][0];
            var value = data[i][1];
            var searchable = data[i][2];
            var selected = data[i][3] === "true";
            var image = data[i][4] != "" ? data[i][4] : null;
            var icon = data[i][5] != "" ? data[i][5] : null;
            
            //  If items length is greater than 0 , it is a header else it is an item
            if (data[i].length > NUM_ATTRIBUTES) { // is header
                var nestedItems = data[i][NUM_ATTRIBUTES];
                var header = dataStoreNew.newMultiselectHeader(
                    name,
                    ProcessCSV(nestedItems),
                    null,    
                    searchable, 
                    selected, 
                    image, 
                    icon
                );
                rv.push(header); 

            } else { // is item
                if (name == null) continue;
                // get the item and store under the given name 
                rv.push(dataStoreNew.newMultiselectItem(
                    name,
                    value, 
                    null, 
                    searchable, 
                    selected, 
                    image, 
                    icon
                ));
            }
        }
        // noop
        return rv;

    }


   return function(csvData) {
        var s = Seperator(csvData);
        //return null;
        var n = NestData(s);
        return ProcessCSV(n);
   };
});