define(['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');
    /*
    This functon uses the custom sorting technique defined by the user
    We have defined isReverse to sort the data reversely as defined
    */
    function customSort(array, isReverse) 
    {
        array.sort(function(A, B) 
        {
           var value = customSortFution(A, B);
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
                    forEachHeader(data[i]['@children']);//Go inside the header and sort it
                }
            }
        }
    }
    /*
    Get the data from the multiselect in the form of an array
    */
    function handler(multiName, customSortFution, isReverse) 
    {
        var data = get.getDataByName(multiName);
        alphaSort(data); // data is an array by defintion
        forEachHeader(data, function(header) 
        {
            customSort(header['@children'], customSortFution, isReverse);
        });
    }
    return handler;//Return thr sorted multielect
});
