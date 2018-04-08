define(['require', 'jquery', 'data_store/get'], function(require, $, getData) {
    'use strict';
    
    var jquery = $;
    var itemNum = 0;

    function showHideHandler($multiselect, $popDisplay, onClose) {
        var $searchBar = $multiselect.find(".JSM-head .JSM-search .JSM-searchbar");
        $searchBar.on("focus", function() {
            $popDisplay.empty();
            $popDisplay.collapse("hide");
            $multiselect.find(".JSM-list.collapse").collapse("show");
        });
        var $close = $multiselect.find(".JSM-head .JSM-closePopList");
        $close.on("click", function() {
            $multiselect.find(".JSM-list.collapse").collapse("hide");
            $popDisplay.collapse("show");
            if (onClose != null) onClose();
        });
    }
    function Popup(item, $popDisplay){
        $popDisplay.append(
            '<span style="background-color:white; margin-right: 20px;">'+
                item["@name"] +
                '<span id="JSM-closePopover-'+itemNum+'" class="fa fa-times JSM-closePopover" aria-hidden="true">'+
                '</span>' +
            '</span>'
        );

        (function() {
            var Item = item;
            var selector = '#JSM-closePopover-'+itemNum;
            $(".JSM-body " + selector).on("click", function() {
                if(Item['@element'] != null) {
                    Item['@element'].find(".JSM-checkbox").prop('checked', false);
                }
                $(selector).parent().remove();
            });
        }());
    }

    function displaySelectedInPopover(data, popup) {
        for(var i in data){
            if ($.isPlainObject(data[i])) {
                var item = data[i];
                if (item["@selected"]) {
                    if (popup != null)
                        popup(item);
                }
                else if (item["@isHeader"]){
                    displaySelectedInPopover(item["@children"], popup);
                }
            }
        }
    }

    function handler(multiName, $multiselect, settings) {
        var data = getData.getDataByName(multiName);
        var $popDisplay = $multiselect.find(".JSM-body .JSM-popoverDisplay").first();

        showHideHandler($multiselect, $popDisplay, function() {
            data = getData.getDataByName(multiName);
            displaySelectedInPopover(data, function(item) {
                Popup(item, $popDisplay);
            });
        });

        displaySelectedInPopover(data, function(item) {
            Popup(item, $popDisplay);
        });        
    }

    return handler;
});