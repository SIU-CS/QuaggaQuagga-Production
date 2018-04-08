define(['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');

    var plainTextSearch = function (selectionEl, str, isCaseSensitive) {
        if (typeof isCaseSensitive == 'undefined')
            isCaseSensitive = true;
        if (isCaseSensitive)
            str = str.toLowerCase();

        var $el = $(selectionEl);

        $el.children(".list-group-item");
        $el.val('');
        $el.children(".list-group-item").hide();

        $el.children(".list-group-item").filter(function () {
            var text = $(this).attr("data-value").text();
            var searchableText = $(this).attr("data-searchable").text();
            if (isCaseSensitive) {
                text = text.toLowerCase();
                searchableText = searchableText.toLowerCase();
            }

            if (text.indexOf(str) > -1 || searchableText.indexOf(str) > -1)
                return true;

            return false;
        }).show();

    };
    return function ($ele) {
        var timeout;
        $ele.find(".JSM-head .JSM-searchbar").on("keyup", function () {
            var userInput = $(".JSM-searchbar").val();
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                plainTextSearch($(".JSM-list"), userInput, true);
            }, 500);

        });
    };
});