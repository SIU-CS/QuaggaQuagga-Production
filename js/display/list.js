'use strict';

define(['require', 'jquery', 'data_store/get'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreGet = require('data_store/get');

    var headCount = 0;

    function recurseConvertDataToHTML(data, $parent) {
        console.log($parent);
        if (!$.isPlainObject(data)) return null;
        for (var name in data) {
            if (dataStoreGet.getMultiselectItemKeys().indexOf(name) >= 0) continue;
             if(data[name] == null) continue;
            
            var isHeader = data[name]["@isHeader"] == null ? false : data[name]["@isHeader"];
            var value = (data[name]["@value"] == null ? "" : data[name]["@value"]).trim();
            var searchText = data[name]["@searchable"] == null ? "" : data[name]["@searchable"];
            var isSelected = data[name]["@selected"] == null ? false : data[name]["@selected"];
    
            if (isHeader) {
                var groupId = "JSM-GroupID-" + headCount;
                headCount += 1;
                var itemStr = `
                    <a href="#` + groupId + `" class="list-group-item JSM-item-header collapsableIcon collapsed" data-toggle="collapse" data-searchable="` + searchText + `">
                        ` + name + `
                        <input type="checkbox" class='checkbox JSM-checkbox' ` + (isSelected ? "checked" : "") + `>
                        <span class="drop-icon"></span>
                    </a>`
                var groupStr = `
                    <div class="list-group collapse" id="` + groupId + `">
                    </div>
                `;
                
                var $item = $(itemStr);
                var $group = $(groupStr);

                $parent.append($item);
                recurseConvertDataToHTML(data[name], $group);
                $parent.append($group);
                
                data[name]["@element"] = $item;
            }
            else {
                var eleString = `
                    <span class="list-group-item" data-searchable="` + searchText + ` data-value="` + value + `">
                    ` + name + `
                    <input type="checkbox" class='checkbox JSM-checkbox' ` + (isSelected ? "checked" : "") + `>
                    </span>
                `;
                var $ele = $(eleString);
                $parent.append($ele);
                data[name]["@element"] = $ele;
            }
        }
    }

    return function(multiselectName, $ele) {
        var multiselectData = dataStoreGet.getDataByName(multiselectName);
        var $html = $('<div class="list-group"></div>');
        recurseConvertDataToHTML(multiselectData, $html);
        console.log($html);
        if ($ele == null) return null;
            $ele.append($html);

        return $html;
    }
});