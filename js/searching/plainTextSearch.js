define(['require', 'jquery', 'data_store/get', 'utility/showHideItems'],
    function (require, $, getData, showHideItems) {
    'use strict';
    
    var jquery = $;

    var plainTextSearch = function (data, str, isCaseSensitive) {
        var returnVisible = false;
        for (var i in data) {
            if (data[i] !== null) {
                var item = data[i];

                var name = item['@name'];
                var searchable = item['@searchable'];
                if (!isCaseSensitive) {
                    name = name.toLowerCase();
                    searchable = searchable.toLowerCase();
                }

                // if input is not empty, and the input matches an entry in the multiselect, show the item and its children
                if (!str.trim() || str.indexOf(name) > -1 || str.indexOf(searchable) > -1) {
                    returnVisible = true;
                    showHideItems.showItem(item);
                    showHideItems.showAllChildren(item);
                } else {
                    if (item['@isHeader']) {
                        // recursively performs the plain text search on the child items to check if they are visible
                        var isAnyVisible = plainTextSearch(item['@children'], str, isCaseSensitive);
                        if (isAnyVisible) {
                            showHideItems.showItem(item);
                            returnVisible = true;
                        } else {
                            showHideItems.hideItem(item);
                        }
                    } else {
                        showHideItems.hideItem(item);
                    }
                }
            }
        }
        return returnVisible;
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