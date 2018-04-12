define(['require',
        'consts',
        'jquery',
        'style/multicolumn',
        'style/popover',
        'style/body/cascadingSelect', 
        'style/body/checkSelected', 
        'style/body/colorIndent', 
        'style/body/spaceIndent',
        'style/colorSelect',
        'data_store/get'], 
function(require, CONSTS, $, multicolumnStyle, popoverStyle, cascadingSelect, 
    checkSelected, colorIndent, spaceIndent, colorSelect, getData) {
    'use strict';
    var jquery = $;

    function setDefaultMultiselectType($m) {
        var types = CONSTS.MULTISELECTOR_STYLE_TYPES();
        for(var i in types) {
            if ($m.hasClass(types[i])) return;
        }
        $m.addClass(CONSTS.DEFAULT_MULTISELECTOR_STYLE_TYPE());
    }

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} name the targeted multiselect
     */
    function handler($multiselect, name) {
        var displaySettings = getData.getSettingByName("display", name);

        setDefaultMultiselectType($multiselect);
        
        cascadingSelect($multiselect);
        checkSelected(name);
        if (typeof displaySettings.displayFadeColor === "undefined" || 
            displaySettings.displayFadeColor === true || 
            displaySettings.displayFadeColor === "true") {
            colorIndent($multiselect, displaySettings.fadeColor);
        }
        spaceIndent($multiselect);

        colorSelect(name, $multiselect, displaySettings);
        
        if (displaySettings.type === "multiColumn") {
            multicolumnStyle($multiselect, displaySettings);
        } else if (displaySettings.type === "popover") {
            popoverStyle(name, $multiselect, displaySettings);
        }

    }

    return handler;
});