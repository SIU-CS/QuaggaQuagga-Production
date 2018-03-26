define(['require', 'jquery', 'data_store/new'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');

    /**
     * A Private function that recurses over the html list and builds the
     * Multiselect data cache
     * @param {Jquery Nodelist} $groupHead The start of the group
     * @return {Object} The multiselect formatted data in JSON object
     */
    function ProcessHTML($groupHead) {
        // return object
        var rv = {};
        // for each child under the head
        $groupHead.children("li").each(function() {
            var $child = $(this);
            // get the attributes
            var name = $child.attr('name') != null ? $child.attr('name') : $child.attr('title');
            var searchable = $child.attr('searchable') == null ? "" : $child.attr('searchable');
            // this is a special property
            var selected = $child.attr('selected') != null || $child.attr('checked') != null;
            // get the text contents
            var content = $child.contents()[0] != null ? $child.contents()[0].nodeValue : null;
            if (content != null) {
                content = content.trim();
                if (content == "") content = null;
            }

            // get the images and icons
            var iconClass = $child.children("i").first().attr("class");
            var imagePath = $child.children("img").first().attr("src");
            if ((iconClass == null || iconClass == "") && (imagePath == null || imagePath == "")) {
                iconClass = $child.data()['icon'];
                imagePath = $child.data()['img'];
            }

            // define name if not already
            if (typeof name === 'undefined' || name === null) {
                if (content != null) name = content;
                else return null;
            }
            
            // check is group or just item
            if ($child.children("ul").length > 0) { // is group
                // get the group (only sleect first group)
                var $group = $child.children("ul").first();
                // get the children for this node
                var children = ProcessHTML($group);
                // if no children continue
                if (children == null) return null;
                // get the group object
                rv[name] = dataStoreNew.newMultiselectHeader(null, searchable, selected, imagePath, iconClass);
                // extend the group ovject with the children elements
                rv[name] = $.extend(children, rv[name]);
                
            } else { // is item
                // get the value for the item
                var value = $child.attr('value');
                // make sure the important attribute exist

                if (typeof value === 'undefined' || value === null) {
                    // we deffinitly have a name at this point
                    value = name;
                }
                // get the new data item and store under given name
                rv[name] = dataStoreNew.newMultiselectItem(value, null, searchable, selected, imagePath, iconClass);
            }
        });
        return rv;
    }

    /**
     * This function processes a live nodelist or jquery node list into
     * a data format that can be stored by the multiselect
     * @param {Jquery or HTML nodelist} nodeList data will be extracted from this item
     */
    return function(nodeList) {
        // checks to make sure the list is jquery
        if (!(nodeList instanceof jquery)) {
            nodeList = $(nodeList);
        }
        // clones the list so we don't mess it up
        nodeList = nodeList.clone();

        // processes the html into a correct data format
        return ProcessHTML(nodeList);
    };
});