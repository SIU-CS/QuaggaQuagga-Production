define(['require',
        'consts',
        'jquery',
        'style/multicolumn',
        'style/popover',
        'style/body/cascadingSelect', 
        'style/body/checkSelected', 
        'style/body/colorIndent', 
        'style/body/spaceIndent',
        'style/body/textColor',
        'style/body/borderSettings',
        'style/body/backgroundColor',
        'style/colorSelect',
        'data_store/get'], 
function(require, CONSTS, $, multicolumnStyle, popoverStyle, cascadingSelect, 
    checkSelected, colorIndent, spaceIndent, textColor, borderSettings,backgroundColor, colorSelect, getData) {
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

        if ((typeof displaySettings.indentPercent != "undefined" || displaySettings.indentPercent != "") && (displaySettings.displayFadeColor === true))
            spaceIndent.setInit($multiselect, displaySettings.indentPercent);
        else
            spaceIndent.setInit($multiselect, 1 / 6);

        if ((typeof displaySettings.textColor != "undefined" || displaySettings.textColor != "") && (displaySettings.displayFadeColor === true)) {
            textColor($multiselect, displaySettings.textColor);
        } else if ((typeof displaySettings.textColor != "undefined" || displaySettings.textColor != "") && (displaySettings.displayFadeColor !== true) && (displaySettings.darkDisplay === true)) {
            textColor($multiselect, "#a29fa8");
        } else if ((typeof displaySettings.textColor != "undefined" || displaySettings.textColor != "") && (displaySettings.displayFadeColor !== true) && (displaySettings.lightDisplay === true)) {
            textColor($multiselect, "#0d0916");
        } else {
            textColor($multiselect, "#000000");
        }

        if ((typeof displaySettings.borderColor != "undefined" || displaySettings.borderColor != "") && (displaySettings.displayFadeColor === true)) {
            borderSettings.setBorderColor($multiselect, displaySettings.borderColor);
        }

        if ((typeof displaySettings.borderWidth != "undefined" || displaySettings.borderWidth != "") && (displaySettings.displayFadeColor === true)) {
            borderSettings.setBorderWidth($multiselect, displaySettings.borderWidth);
        }

        if ((typeof displaySettings.backgroundColor != "undefined" || displaySettings.backgroundColor != "") && (displaySettings.displayFadeColor === true)) {
            backgroundColor($multiselect, displaySettings.backgroundColor);
        } else if ((displaySettings.displayFadeColor !== true) && (displaySettings.darkDisplay === true)) {
            backgroundColor($multiselect, "#000000");
        } else if ((displaySettings.displayFadeColor !== true) && (displaySettings.lightDisplay === true)) {
            backgroundColor($multiselect, "#cccccc");
        }

        colorSelect(name, $multiselect, displaySettings);
        
        if (displaySettings.type === "multiColumn") {
            multicolumnStyle($multiselect, displaySettings);
        } else if (displaySettings.type === "popover") {
            popoverStyle(name, $multiselect, displaySettings);
        }

    }

    return handler;
});