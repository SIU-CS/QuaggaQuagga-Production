define(['require', 'jquery', 'data_store/get', 'searching/searchHelper'],
    function (require, $, getData, searchHelper) {
    'use strict';
    
    var jquery = $;

    var plainTextSearch = function (data, str, isCaseSensitive) {
        searchHelper.searchByFunction(function (name, searchable) {
            return !str.trim() || str.indexOf(name) > -1 || str.indexOf(searchable) > -1;
        }, data, isCaseSensitive);
    };
    return function (multiName, $ele, settings) {
        var isCaseSensitive = settings.caseSensitive === true || settings.caseSensitive === "true";
        var timeout;
        $ele.find(".JSM-head .JSM-searchbar").on("keyup", function () {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                var data = getData.getDataByName(multiName);
                var str = $('.JSM-searchbar').val();
                if (!isCaseSensitive)
                    str = str.toLowerCase();
                plainTextSearch(data, str, isCaseSensitive);
            }, 500);

        });
    };
});