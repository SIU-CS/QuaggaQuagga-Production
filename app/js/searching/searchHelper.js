define(['require', 'jquery', 'data_store/get', 'utility/showHideItems'],
    function (require, $, getData, showHideItems) {
    'use strict';

    var jquery = $;

    var searchByFunction = function(determineSearch, data, isCaseSensitive, filterInterval) {
        var returnVisible = false;
        for (var i = 0; i < data.length; i += 1) {
            var item = data[i];

            var name = item['@name'];
            var searchable = item['@searchable'];
            if (!isCaseSensitive) {
                name = name.toLowerCase();
                searchable = searchable.toLowerCase();
            }
            if (filterInterval == null || filterInterval == '') {
                filterInterval = 0;
            }

            // if input is not empty, and the input matches an entry in the 
            // multiselect, show the item and its children
            if (determineSearch(name, searchable)) {
                showHideItems.showItem(item);
                showHideItems.showAllChildren(item);
                returnVisible = true;
            } else {
                if (item['@isHeader']) {
                    // recursively performs the plain text search on the child items 
                    // to check if they are visible
                    var isAnyVisible = searchByFunction(
                        determineSearch, 
                        item['@children'], 
                        isCaseSensitive,
                        filterInterval
                    );
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
        return returnVisible;
    };
    return {
        searchByFunction: searchByFunction
    };
});