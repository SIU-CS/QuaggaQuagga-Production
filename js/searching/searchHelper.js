define(['require', 'jquery', 'data_store/get', 'utility/showHideItems'],
    function (require, $, getData, showHideItems) {
        'use strict';

        var jquery = $;

        var searchByFunction = function(determineSearch, data, isCaseSensitive) {
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
                    if (determineSearch(name, searchable)) {
                        returnVisible = true;
                        showHideItems.showItem(item);
                        showHideItems.showAllChildren(item);
                    } else {
                        if (item['@isHeader']) {
                            // recursively performs the plain text search on the child items to check if they are visible
                            var isAnyVisible = searchByFunction(determineSearch, item['@children'], isCaseSensitive);
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
        return {
            searchByFunction: searchByFunction
        };
    });