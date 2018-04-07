define(['require'], function(require) {
    'use strict';
    
    if (window['jQuery'] == null && window['$'] == null)
        console.warn("Jquery is not insalled, please include before using the Multiselect");
    if (window['jQuery'] != null)
        return window['jQuery'];
    else
        return window['$'];
});