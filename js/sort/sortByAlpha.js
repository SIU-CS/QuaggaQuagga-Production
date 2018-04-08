define(['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');

    function alphaSort(array) {
        array.sort(function(A, B) {
           var a = A['@name'].toLowerCase();
           var b = B['@name'].toLowerCase();
           if (a < b) return -1;
           if (a > b) return 1;
           return 0; // equal 
        });
    }

    function forEachHeader(data, fun) {
        for (var i in data) {
            if (data[i] != null) {
                if (data[i]['@isHeader']) {
                    fun(data[i]);
                    forEachHeader(data[i]['@children'], fun);
                }
            }
        }
    }

    function handler(multiName) {
        var data = get.getDataByName(multiName);
        alphaSort(data); // data is an array by defintion
        forEachHeader(data, function(header) {
            alphaSort(header['@children']);
        });
    }
    return handler;
});
