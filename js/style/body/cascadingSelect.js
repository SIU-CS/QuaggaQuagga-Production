'use strict';

define(['require', 'jquery', 'utility/getMultiselectName', 'data_store/get'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var getMultiselectorName = require('utility/getMultiselectName');
    var getData = require('data_store/get');

    $(document).ready(function() {
        var key = ".JSM-checkbox";
        $(key).click(function(event) {
            event.stopPropagation(); // keep the drop down from expanding
            var $cbox = $(this);
            var multiselectName = getMultiselectorName.byChildElement($cbox);
            if (multiselectName == null) return;
            var cachedData = getData.getDataByName(multiselectName);
            var dataElement = FindDataElement(cachedData, $cbox.parent());
            console.log(dataElement)
        });
        /**
         * 
         * @param {Jquery element} $listGroup   
         */
        function FindDataElement(cachedData, callingElement) {
            for (var key in cachedData) {
                if ($.isPlainObject(cachedData[key]) && cachedData[key] != null) {
                    var data = cachedData[key];
                    if(callingElement[0] == data['@element'][0]) {
                        return data;
                    }
                    var find = FindDataElement(data, callingElement);
                    if (find != null) return find;
                }
            }
            return null;
        }

        function CheckAllUnderCached(cachedData) {

        }
    });
});