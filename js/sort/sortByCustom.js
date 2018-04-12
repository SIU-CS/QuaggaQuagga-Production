define(['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');
    /*
    This functon uses the custom sorting technique defined by the user
    We have defined isReverse to sort the data reversely as defined
    */
    function customSort(array, customSortFunction, isReverse) 
    {
        array.sort(function(A, B) 
        {
           var value = customSortFunction(A['@name'], B['@name']);
           if (isReverse) return -value;//Revrese sorting
           return value;
        });
    }
    /*
    This functon goes through each header and use the custom sort
    Nested structure sorting
    */
    function forEachHeader(data, fun) 
    {
        for (var i in data) 
        {
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
    function handler(multiName, customSortFunction, isReverse) 
    {
        var data = get.getDataByName(multiName);
        customSort(data, customSortFunction, isReverse); // data is an array by defintion
        forEachHeader(data, function(header) 
        {
            customSort(header['@children'], customSortFunction, isReverse);
        });
    }
    return handler;//Return thr sorted multielect
});
