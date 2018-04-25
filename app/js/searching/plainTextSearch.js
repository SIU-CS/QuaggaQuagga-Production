define(['require', 'jquery', 'data_store/get', 'searching/searchHelper'],
    function (require, $, getData, searchHelper) {
    'use strict';
    
    var jquery = $;

    var plainTextSearch = function (data, str, isCaseSensitive) {
        searchHelper.searchByFunction(function (name, searchable) {
            return !str.trim() || 
            name != null && name.indexOf(str) > -1 || 
            searchable != null && searchable.indexOf(str) > -1;
        }, data, isCaseSensitive);
    };
    return function (multiName, $ele, settings) {
        var isCaseSensitive = settings.caseSensitive === true || settings.caseSensitive === "true";
        var timeout;
        $ele.find(".JSM-head .JSM-searchbar").on("keyup", function (e) {
            var valueChanged = false;

            if (e.type=='propertychange') {
                valueChanged = e.originalEvent.propertyName=='value';
            } else {
                valueChanged = true;
            }
            if (valueChanged) {
                /* Code goes here */
                var searchBar = this;
                window.clearTimeout(timeout);
                timeout = window.setTimeout(function () {
                    var data = getData.getDataByName(multiName);
                    var str = $(searchBar).val();
                    if (!isCaseSensitive)
                        str = str.toLowerCase();
                    plainTextSearch(data, str, isCaseSensitive);
                }, 200);
            }
        });
    };
});