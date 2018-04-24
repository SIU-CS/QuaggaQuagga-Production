// defines the consructors for the data object
define(['require',
    'data_store/cache',
    'data_store/set',
    'data_store/get',
    'consts',
    'jquery',
    'display/list',
    'style/body/colorIndent',
    'style/body/spaceIndent',
    'sort/sort.config'],
function (require, cache, cacheSet, cacheGet, CONSTS, $, displayList, colorIndent, spaceIndent, sortConfig) {
    'use strict';

    var jquery;
    jquery = $;

    /**
     * Sets a new multiselect in the cache with these fields
     * @param {A Jquery or Plain HTML node} ele the element referencing the multiselect
     * @param {Object} data The inital data for the multiselect
     * @param {Object} options The inital options for the multiselect
     * @param {String} title The title (not name) for the multiselect
     * @returns {String} The name you can reference the multiselect by
     */
    function newMultiselect(ele, data, options, title) {
        var name = $(ele).attr('name');
        if (typeof name === 'undefined' || name == null) return null;
        if (data == null) data = [];
        if (!$.isPlainObject(options)) options = {};
        options = $.extend(CONSTS.CONST_OPTIONS(), options);

        var jqueryEle = $(ele).first();
        if (!cache.addMultiselect(name, jqueryEle, data, options, title)) return null;
        return name;
    }
    /**
     * Builds a new multiselect item so we don't miss any fields
     * @param {String} name the name of the item in the multiselect
     * @param {*} value the value to be placed into the multiselect
     * @param {Jquery Element} element The element reference to this item
     * @param {String} searchable The searchable text for this item
     * @param {Bool} selected A bool specifing if the item is pre-selected
     * @param {String} imagePath The path to the image to be displayed with this element
     */
    function newMultiselectItem(name, value, element, searchable, selected, imagePath, iconClass) {
        if (!(element instanceof jquery) && element != null) {
            element = $(element);
        }
        if (element != null && element.length <= 0 ) return null;

        if (value == null || value === "") return null;
        return {
            "@name": name,
            "@value": value,
            "@element": element,
            "@searchable": (searchable == null ? "": searchable),
            "@selected": (selected == null ? false : selected),
            "@isHeader": false,
            "@image": imagePath,
            "@icon": iconClass,
            "@parent": null
        };
    }

    /**
     * Builds a new multiselect header item so we don't miss any fields
     * @param {String} name the name of the header in the multiselect
     * @param {Array} children an array of objects that are the children for this item
     * @param {Jquery Element} element The element reference to this item
     * @param {String} searchable The searchable text for this item
     * @param {Bool} selected A bool specifing if the item is pre-selected
     * @param {String} imagePath The path to the image to be displayed with this element
     * @param {String} iconClass The classes to be attached to the icon tag if no image exists
     */
    function newMultiselectHeader(name, children, element, searchable, selected, imagePath, iconClass) {
        if (!(element instanceof jquery) && element != null) {
            element = $(element);
        }
        if (element != null && element.length <= 0 ) return null;
        if (!$.isArray(children) || children.length <= 0) return null;

        var header = {
            "@name": name,
            "@element": element,
            "@searchable": (searchable == null ? "": searchable),
            "@selected": (selected == null ? false : selected),
            "@isHeader": true,
            "@image": (imagePath == null ? "": imagePath),
            "@icon": (iconClass == null ? "": iconClass),
            "@children": children,
            "@parent": null
        };

        for(var i in children) {
            if (children[i] != null)
                children[i]['@parent'] = header;
        }
        
        return header;
    }

    /**
     * Merges the data existing in the multiselect with the new data
     * @param {String} name Multiselector name 
     * @param {JSON} newData JSON data to add to the multiselect
     */
    function addNewData(name, newData) {
        var removeElement = function(item) {
            if (item['@isHeader']) {
                $(item['@element'].data("target")).remove();
            }
            if (item['@element'] != null)
                item['@element'].remove();
        }
        if (name == null) return;
        // defers to dataA
        var recurseCompareData = function(dataA, dataB) {
            if (dataA == null) dataA = [];
            if (dataB == null) dataB = [];
            var bIndex = 0;
            var returnData = [];
            var issueNames = [];
            var aNames = dataA.map(x => x['@name']);
            var bNames = dataB.map(x => x['@name']);
            var foundBIndexes = [];
            for (var aIndex = 0; aIndex < aNames.length; aIndex += 1) {
                bIndex = bNames.indexOf(aNames[aIndex]);
                if (bIndex >= 0) {
                    foundBIndexes.push(bIndex);
                    // merg the data recusivly
                    var issueA = dataA[aIndex];
                    var issueB = dataB[bIndex];
                    if (issueA['@isHeader'] || issueB['@isHeader']) {
                        issueA['@children'] = recurseCompareData(issueA['@children'], issueB['@children']);                          
                        issueA['@isHeader'] = true;
                    }
                    if (issueB['@element'] != null)
                        removeElement(issueB);
                    if (issueB['@selected'] == true) issueA['@selected'] = true;
                    returnData.push(issueA);
                } else { // we can now safly add aIndex
                    returnData.push(dataA[aIndex]);
                }
            }

            for (bIndex = 0; bIndex < dataB.length; bIndex += 1) {
                if (foundBIndexes.indexOf(bIndex) < 0) // selects unmerged indexes
                    returnData.push(dataB[bIndex]);
            }
                
            return returnData;
        };
        var data = cacheGet.getDataByName(name);
        cacheSet.replaceDataByName(name, recurseCompareData(newData, data));
        sortConfig(name);
        displayList.displayMissing(name);
        spaceIndent.refresh(cacheGet.getElementByName(name));
        colorIndent(cacheGet.getElementByName(name));
    }

    return {
        newMultiselect: newMultiselect,
        newMultiselectHeader: newMultiselectHeader,
        newMultiselectItem: newMultiselectItem,
        addNewData: addNewData
    };
});