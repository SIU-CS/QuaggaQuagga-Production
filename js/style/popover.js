define(['require', 'jquery', 'data_store/get', 'data_store/set'], function(require, $, getData, setData) {
    'use strict';
    
    var jquery = $;
    var itemNum = 0;

    function showHideHandler($multiselect, $popDisplay, onClose) {
        var $searchBar = $multiselect.find(".JSM-head .JSM-search .JSM-searchbar")
        $searchBar.on("focus", function() {
            $popDisplay.empty();
            $popDisplay.collapse("hide");
        // Display list when search bar is on focus 
            $multiselect.find(".JSM-list.collapse").collapse("show");
        });
        var $close = $multiselect.find(".JSM-head .JSM-closePopList")
        $close.on("click", function() {
        // Hide list when ClosePoplist is clicked and show the selected items as popovers
            $multiselect.find(".JSM-list.collapse").collapse("hide");
            $popDisplay.empty();
            $popDisplay.collapse("show");
            if (onClose != null) onClose();
        });
    }
        // Function to Display popovers after selection
    function Popup(item, $popDisplay){
        $popDisplay.append(
        // Popover Basic style
            '<span style="background-color:rgb(238, 161, 147);margin-right: 20px; display: inline-block; height: 35px; border-style: outset; border-radius: 10px; padding: 5px;">'+
                item["@name"] +
                '<span id="JSM-closePopover-'+itemNum+'" class="fa fa-times JSM-closePopover" style="margin-left: 10px"aria-hidden="true"></span>' +
            '</span>'
        );
    

        (function() {
            var Item = item;
            var selector = '#JSM-closePopover-'+itemNum;
            $(".JSM-body " + selector).on("click", function() {
                setData.setSelectedForItem(Item, false, true);
                $(this).parent().remove();
            });
        }());

        itemNum += 1;
    }

    // Display selected items as Popovers
    function displaySelectedInPopover(data, popup) {
        for(var i in data){
            var item = data[i];
            if (item["@selected"]) { 
                if (popup != null)
                    popup(item);
            } 
    // Display only the selected children items if it's parent is not selected
            else if (item["@isHeader"]){
                displaySelectedInPopover(item["@children"], popup);
            }
        }
    }
    //Handler function to retrieve data
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