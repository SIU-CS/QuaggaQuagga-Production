define(['require', 'jquery', 'data_store/new', "consts", 'data_input/load'],
    function (require, $, newData, CONSTS, loadData) {
    'use strict';

    var rootObject = CONSTS.GET_ROOT_OBJECT_REF();

    rootObject['AddData'] = {};
    var loadTypes = loadData.loadTypes();
    $.each(loadTypes, function(i, Type) {
        rootObject['AddData'][Type] = (function() {
            var type = Type;
            return function(multiname, unprocessed) {
                var data;
                if ($.isFunction(unprocessed)) {
                    data = loadData.load(unprocessed, type);
                } else {
                    data = loadData.load(function() {
                        return unprocessed;
                    }, type);
                }
                if (data == null) {
                    console.warn("Error loading new data.");
                } else {
                    newData.addNewData(multiname, data);
                }
            };
        }());
    });
});