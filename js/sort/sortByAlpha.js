define(['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');
    /*
    This functon compares the data and sort it
    */
    function alphaSort(array, isReverse) 
    {
        array.sort(function(A, B) 
        {
           var a = A['@name'].toLowerCase();//Converting to lowercase to avoid case sensitive issue
           var b = B['@name'].toLowerCase();//Converting to lowercase to avoid case sensitive issue
           if (isReverse) {
                if (a < b) return 1;
                if (a > b) return -1;
           } else {
                if (a < b) return -1;
                if (a > b) return 1;
           }

           return 0; // equal 
        });
    }
    /*
    This functon goes through each header and sort it
    Nested structure sorting
    */
    function forEachHeader(data, fun) {
        for (var i in data) {
            if (data[i] != null) 
            {
                if (data[i]['@isHeader'])//If data is a header
                {
                    fun(data[i]);
                    forEachHeader(data[i]['@children'], fun);//Go inside the header and sort it
                }
            }
        }
    }
    /*
    Get the data from the multiselect in the form of an array
    */
    function handler(multiName, isReverse) 
    {
        var data = get.getDataByName(multiName);
        alphaSort(data); // data is an array by defintion
        forEachHeader(data, function(header) 
        {
            alphaSort(header['@children'], isReverse);
        });
    }
    return handler;//Return thr sorted multielect
});
