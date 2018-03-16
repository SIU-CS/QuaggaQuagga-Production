'use strict';

define(['require', 'jquery', 'consts'], function(require) {
    var $, jquery;
    jquery = $ = require('jquery');
    var CONSTS = require('consts');

    function byChildElement($element) {
        var $p = $element.parents('.' + CONSTS.MULTISELECTOR_ROOT_NAME()).first();
        if ($p.length > 0) return $p.attr('name');
        return null;
    }

    return {
        byChildElement: byChildElement
    };
});