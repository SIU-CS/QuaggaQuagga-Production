'use strict';

define(['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');


    get.sort(function(a, b) 
    {
        var nameA = a.name.toLowerCase();
         nameB = b.name.toLowerCase();
        if (titleA < titleB) return -1;
        if (titleA > titleB) return 1;
        return 0;
    });
});
