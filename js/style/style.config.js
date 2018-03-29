define(['require',
        'consts',
        'jquery', 
        'style/body/cascadingSelect', 
        'style/body/checkSelected', 
        'style/body/colorIndent', 
        'style/body/spaceIndent'], 
function(require, CONSTS, $, cascadingSelect, checkSelected, colorIndent, spaceIndent) {
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
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler($multiselect) {
        setDefaultMultiselectType($multiselect);
        cascadingSelect($multiselect);
        checkSelected($multiselect);
        colorIndent($multiselect);
        spaceIndent($multiselect);
    }

    return handler;
});