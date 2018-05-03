(function () {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());
define("../lib/almond-0.3.3", function(){});

define('jquery',['require'], function(require) {
    'use strict';
    
    if (window['jQuery'] == null && window['$'] == null)
        console.warn("Jquery is not insalled, please include before using the Multiselect");
    if (window['jQuery'] != null)
        return window['jQuery'];
    else
        return window['$'];
});
define('consts',['require', 'jquery'],function (require) {
    'use strict';

    var $, jquery;
    $ = jquery = require('jquery');

    function CONST_OPTIONS() {
        return { 
            search: {
                type: "text"
            },
            display: {
                type: "singleColumn"
            }
         };
    }

    function CONST_SINGLECOLUMN_LAYOUT() {
        return `<!-- MULTISELECT HEADER -->
            <div class="JSM-head navbar navbar-default">
                <span class="JSM-title navbar-brand"></span>
                <span class="JSM-search">
                    <input class="JSM-searchbar form-control" type="text" placeholder="Search">
                </span>
            </div>
            <!-- MULTISELECT BODY -->
            <div class="JSM-body">
            <!-- List structure and base style Via, Marcos from stackoverflow at "https://jsfiddle.net/ann7tctp/" -->
                <div class="JSM-list list-group-root">
                    
                </div>
            </div>
            <!-- MULTISELECT FOOTER -->
            <div class="JSM-footer"></div>`;
    }

    function CONST_POPOVER_LAYOUT() {
        return `<!-- MULTISELECT HEADER -->
            <div class="JSM-head navbar navbar-default">
                <span class="JSM-title navbar-brand"></span>
                <span class="JSM-search">
                    <input class="JSM-searchbar form-control" type="text" placeholder="Search">
                </span>
            </div>
            <!-- MULTISELECT BODY -->
            <div class="JSM-popoverDisplay">
            </div>
            <div class="JSM-body">
            <!-- List structure and base style Via, Marcos from stackoverflow at "https://jsfiddle.net/ann7tctp/" -->
                <div class="JSM-list list-group-root collapse">
                    
                </div>
            </div>
            <!-- MULTISELECT FOOTER -->
            <div class="JSM-footer"></div>`;
    }

    function CONST_MULTICOLUMN_LAYOUT() {
        return `<!-- MULTISELECT HEADER -->
            <div class="JSM-head navbar navbar-default">
                <span class="JSM-title navbar-brand"></span>
                <span class="JSM-search">
                    <input class="JSM-searchbar form-control" type="text" placeholder="Search">
                </span>
            </div>
            <!-- MULTISELECT BODY -->
            <div class="JSM-body">
            <!-- List structure and base style Via, Marcos from stackoverflow at "https://jsfiddle.net/ann7tctp/" -->
                <div class="JSM-list list-group-root">
                    
                </div>
            </div>
            <!-- MULTISELECT FOOTER -->
            <div class="JSM-footer"></div>`;
    }

    function MULTISELECTOR_ROOT_NAME() {
        return "JSMultiselect";
    }
    function MULTISELECTOR_STYLE_TYPES() {
        return ['singleColumn', 'multiColumn', 'popoverSelect'];
    }
    function DEFAULT_MULTISELECTOR_STYLE_TYPE() {
        return 'singleColumn';
    }
    function GET_ROOT_OBJECT_REF() {
        if(typeof window[MULTISELECTOR_ROOT_NAME()] == 'undefined' || window[MULTISELECTOR_ROOT_NAME()] == null)
            window[MULTISELECTOR_ROOT_NAME()] = {};
        return window[MULTISELECTOR_ROOT_NAME()];
    }
    
    if(typeof window[MULTISELECTOR_ROOT_NAME()] == 'undefined' || window[MULTISELECTOR_ROOT_NAME()] == null)
            window[MULTISELECTOR_ROOT_NAME()] = {};
    
    return {
        CONST_OPTIONS: CONST_OPTIONS,
        MULTISELECTOR_ROOT_NAME: MULTISELECTOR_ROOT_NAME,
        GET_ROOT_OBJECT_REF: GET_ROOT_OBJECT_REF,
        CONST_SINGLECOLUMN_LAYOUT: CONST_SINGLECOLUMN_LAYOUT,
        CONST_POPOVER_LAYOUT: CONST_POPOVER_LAYOUT,
        CONST_MULTICOLUMN_LAYOUT: CONST_MULTICOLUMN_LAYOUT,
        MULTISELECTOR_STYLE_TYPES: MULTISELECTOR_STYLE_TYPES,
        DEFAULT_MULTISELECTOR_STYLE_TYPE: DEFAULT_MULTISELECTOR_STYLE_TYPE
    };
});
// defines the basic getters and setters of the data
define('data_store/cache',['require',
    'jquery',
    'consts'],function (require, $, CONSTS) {
    'use strict';

    var jquery = $;

    // cached data
    var MultiselectList = {};

    /**
     * Returns true if the name exists in the datbase
     * @param {String} name the name of multiselector
     * @returns {Bool} true if the name exists in multiselector, false otherwise
     */
    function hasName(name) {
        
        if (typeof name == "undefined" ||
            name == null ||
            typeof MultiselectList[name] == "undefined" ||
            MultiselectList[name] == null) 
        {
            return false;
        }
        return true;
    }

    /**
     * Runs a function for each multiselector name
     * @param {Function} func the function to ran for each multiselector name 
     * @returns {Array} An array of outputs sepecifed by the function
     */
    function forEachName(func) {
        var returnArray = [];
        for (var key in MultiselectList) {
            if (MultiselectList.hasOwnProperty(key))
                returnArray.add(func(key));
        }
            
        return returnArray;
    }

    /**
     * Returns the whole multiselecotr data object by name
     * @param {String} name the name of multiselector
     * @return {MuliselectorData} Returns the multiselecotr data if key exists, null otherwise
     */
    function getMultiselect(name) {
        if (hasName(name)) {
            return MultiselectList[name];
        }
        return null;
    }

    /**
     * Adds a new multiselector
     * Note: will not delete previous multiselectors
     * @param {String} name the name of the new multiselector 
     * @param {Element} node the living page node for the element
     * @param {Array} data The data to add under the name of the multiselector
     * @param {object} settings the settings to be used by this multiselector
     * @returns {bool} Returns a true false depending on if the data was inserted
     */
    function addMultiselect(name, node, data, settings, title) {
        if (node == null) return false;
        if (!(node instanceof jquery)) {
            node = $(node);
        }
        if (node.length <= 0) return false;
        if (!hasName(name)) {
            MultiselectList[name] = {
                Data: data,
                Settings: settings,
                Element: node,
                Title: title
            };
            return true;
        }
        return false;
    }

    /**
     * Deletes the multiselector under the name
     * @param {String} name the name of multiselector
     */
    function removeMultiselect(name) {
        delete MultiselectList[name];
    }  

    return {
        forEachName: forEachName,
        getMultiselect: getMultiselect,
        addMultiselect: addMultiselect,
        removeMultiselect: removeMultiselect,
        hasName: hasName,
    };
});
// defines the more advanced error checking getters of the data
define('data_store/get',['require', 
    'data_store/cache', 
    'jquery'],
function (require) {
    'use strict';
    var $, jquery;
    jquery = $ = require('jquery');
    var cache = require('data_store/cache');

    /**
     * Returns a list of multiselector names registed with the cache
     * @returns {String Array} and array of names
     */
    function nameList() {
        var keyList = [];
        cache.forEachName(function(name) {
            keyList.push(name);
        });
        return keyList;
    }

    /**
     * Returns the data for the multiselect specified by the name
     * @param {String} name
     * @returns {JSON Object} the data associated with the multiselect
     */
    function getDataByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            // returns a copy of the data
            return multi.Data;
        return null;
    }

    /**
     * Gets the jquery element reference for the multiselect specified by the name
     * @param {String} name 
     * @returns {Jquery Element} the element associated with the multiselect
     */
    function getElementByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi != null) {
            return multi.Element;
        }
        return null;
    }

    /**
     * Gets the settings for the multiselect specified by the name
     * @param {String} name
     * @returns {JSON Object} the settings associated with the multiselect
     */
    function getSettingsByMultiselectName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null) {
            if (multi.Settings == null || !$.isPlainObject(multi.Settings)) {
                multi.Settings = {};
            }
            return multi.Settings;
        }
        console.warn("An error occured getting settings, multiselect not loaded");
        return {};
    }

    /**
     * Gets the settings for the multiselect specified by the name
     * @param {String} settingName
     * @param {String} multiName
     * @returns {JSON Object} the settings associated with the multiselect
     */
    function getSettingByName(settingName, multiName) {
        var settings =  getSettingsByMultiselectName(multiName);
        if (!settings.hasOwnProperty(settingName) || 
            settings[settingName] == null || 
            !$.isPlainObject(settings[settingName])
        ){
            settings[settingName] = {};
        }
        return settings[settingName];
    }

    /**
     * Gets the title for the multiselect specified by the name
     * @param {String} name
     * @returns {String} the title
     */
    function getTitleByName(name) {
        var multi =  cache.getMultiselect(name);
        if (multi !== null)
            return multi.Title == null ? name : multi.Title;
        return null; // multiselect doesn't exist
    }

    /**
     * Returns a list of item keys (special meaning behind these keys)
     * @returns {String Array} and array of Item keys
     */
    function getMultiselectItemKeys() {
        return ["@value", "@element", "@searchable", "@selected", "@isHeader", "@icon", "@image"];
    }

    /**
     * Find s all items (including headers) and returns them in func
     * @param {String} name The name of the given multiselect
     * @param {Function} func a function that accepts a multiselect item
     */
    function forEachItemInMutiselect(name, func) {
        var data = getDataByName(name);
        if (data != null) {
            var forEach = function(children) {
                for(var i in children) {
                    if (children[i] != null) {
                        var rv = func(children[i]);
                        if (rv !== false && children[i]['@isHeader']) {
                            forEach(children[i]['@children']);
                        }
                    }
                }
            };
            forEach(data);
        }
    }


    return {
        nameList: nameList,
        getDataByName: getDataByName,
        getElementByName: getElementByName,
        getSettingsByMultiselectName: getSettingsByMultiselectName,
        getSettingByName: getSettingByName,
        getMultiselectItemKeys: getMultiselectItemKeys,
        getTitleByName: getTitleByName,
        forEachItemInMutiselect: forEachItemInMutiselect
    };
});
define('logger',['require'], function (require) {
    'use strict';

    // dependencies for this file
    var WARN = 'warn';
    var ERROR = 'error';
    var LOG = 'log';
    var INFO = 'info';
    // private function
    function loggerTypeExists(type) {
        return console != null && console[type] != null && typeof console[type] == "function";
    }
    function tryLog(msg) {
        if (!loggerTypeExists("log"))
            return false;
        try {
            console.log(msg);
            return true;
        } catch(e) {
            return false;
        }
    }
    function tryError(msg) {
        if (!loggerTypeExists("error"))
            return false;
        try {
            console.error(msg);
            return true;
        } catch(e) {
            return false;
        }
    }
    function tryWarn(msg) {
        if (!loggerTypeExists("warn"))
            return false;
        try {
            console.warn(msg);
            return true;
        } catch(e) {
            return false;
        }
    }
    function tryInfo(msg) {
        if (!loggerTypeExists("info"))
            return false;
        try {
            console.info(msg);
            return true;
        } catch(e) {
            return false;
        }
    }
    function tryTrace() {
        if (loggerTypeExists("trace")) {
            try {
                console.trace();
            } catch(e) {
                return;
            }
        }
    }
    function fallback(msg) {
        try {
            opera.postError(msg);
        }
        catch(e) {
            try {
            alert(msg);
            } catch(e) {
                return; // failed to display message in any form
            }
        }
    }
    // main log function
    function main(message, type, trace) {
        var typeFound = false;
        var success = false;
        // try to find the correct logger
        if (type != null) {
            typeFound = true;
            switch(type) {
                case LOG:
                    success = tryLog(message);
                break;
                case ERROR:
                    success = tryError(message);
                break;
                case WARN:
                    success = tryWarn(message);
                break;
                case INFO:
                    success = tryInfo(message);
                break;
                default: // what happens if you set the type of message, but no stadard found
                    typeFound = false;
            }
            if (!success || !typeFound)
                message = type + ": " + message;
        }
        // if not found log to standard logger
        if (!typeFound) 
            success = tryLog(message);

        // if stack is specified, try to print the call stack as well
        if (trace)
            tryTrace();

        // if no success, try to fall back
        if (!success)
            fallback(message);
    }
    return {
        logType: main,
        log: function(msg, trace) { main(msg, LOG, trace); },
        warn: function(msg, trace) { main(msg, WARN, trace); },
        error: function(msg, trace) { main(msg, ERROR, trace); },
        info: function(msg, trace) { main(msg, INFO, trace); }
    }
});
// defines the more advanced error checking getters of the data
define('data_store/set',['require',
    'data_store/get',
    'data_store/cache', 
    'logger',
    'jquery'],
function (require) {
    'use strict';

    var $, jquery;
    $ = jquery = require('jquery');
    var cache = require('data_store/cache');
    var getCache = require('data_store/get');
    var logger = require('logger');

    /**
     * deletes the old data for a multiselect and specifies new data
     * @param {String} name Multiselect Name
     * @param {Object} data The new data object to associate with the multiselects
     * @returns {Bool} True if successful, false otherwise
     */
    function replaceDataByName(name, data) {
        var multi = cache.getMultiselect(name);
        if (multi !== null) {
            multi.Data = data;
            return true;
        }
        return false;
    }

    /**
     * Extends the data associated with a multiselect
     * @param {String} name The multiselect name
     * @param {Object} items The items to add/replace with
     * @param {Bool} force if force is specified, the new items will overwrite any existing items
     * @returns {Bool} True if successful, false otherwise
     */
    function extendDataItemsByName(name, items, force) {
        var multi = cache.getMultiselect(name);
        if (multi !== null) {
            if (force)
                multi.Data = $.extend(multi.Data, items);
            else
                multi.Data = $.extend(items, multi.Data);
            return true;
        }
        return false;
    }

    /**
     * Sets optiosn by name, Hint always extends with current options (force replaces)
     * @param {String} name The multiselect name
     * @param {Object} options The new optiosn to replace the old
     * @returns {Bool} True if successful, false otherwise
     */
    function setSettingsByName(name, options) {
        var multi = cache.getMultiselect(name);
        if (multi !== null) {
            // will overrnamee any other objects
            multi.options = $.extend(multi.options, options);
            return true;
        }
        return false;
    }

    /**
     * Sets the selected option for this item and checks the element
     * @param {Object} item a data item from the cache 
     * @param {Bool} selected true if selected false otherwise
     * @param {Bool} preventChange if true, will not call the on change event
     */
    function setSelectedListenerForItem(item) {
        if (item == null) return false;
        // ensure this is a bool
        (function() {
            var Item = item;
            Item['@element'].find(".JSM-checkbox").on('change', function() {
                if (Item != null)
                    Item['@selected'] = this.checked;
            });
        }());
    }

    /**
     * sets the element for the item as well as sets up handlers
     * @param {JSON item} item the item to add the element to 
     * @param {Jquery element} $ele the jquery element to set for the item   
     */
    function setElementForItem(item, $ele) {
        if ($ele == null || $ele.length <= 0) return;
        if (item == null) return;
        item['@element'] = $ele.first();
        setSelectedListenerForItem(item);
    }

    /**
     * sets the selected value for the ckeckboxs
     * @param {JSON item} item the item find the checkbox for
     * @param {BOOL} checked the vaue to set the checkbox tos
     */
    function setSelectedForItem(item, checked) {
        checked = checked === true;
        if (item['@selected'] === checked) return;
        var ItemCheckbox = item['@element'].find(".JSM-checkbox");
        ItemCheckbox.click();
    }

    return {
        replaceDataByName: replaceDataByName,
        extendDataItemsByName: extendDataItemsByName,
        setSettingsByName: setSettingsByName,
        setElementForItem: setElementForItem,
        setSelectedForItem: setSelectedForItem
    };
});

define('display/displayHelper',['require',
        'jquery'
    ], 
function(require, $) {
    'use strict';
    var jquery = $;

    /**
     * Returns a string that is a input type check
     * @param {Bool} checked Sets the input to checked or not
     * @param {String} name The name of the input
     * @param {*} value The value for the input field
     */
    function getCheckboxLayout(checked, name, value) {
        return `
        <input type="checkbox" class='checkbox JSM-checkbox' ` +
        "value=\"" + (value != null ? value: "") + "\"" +
        // returns "on" if no value and a name
        "name=\""+ (name != null && value != null ?  name : "") +"\"" +
        (checked ? "checked=\"checked\"" : "") + 
        "data-name=\"" + name + "\"" + `>`;
        
    }

     /**
      * Gets and returns a json item with the correct formatted data
      * @param {JSON} item the object you want to get the data from
      */
    function getDisplayData(item) {
        var name = item["@name"];
        if (name == "") return null;
        // gets the value if it is a header
        var isHeader = item["@isHeader"] == null ? false : item["@isHeader"];
        // the value for the data item
        var value = (item["@value"] == null ? "" : item["@value"]).trim();
        // extra searchable text
        var searchable = item["@searchable"] == null ? "" : item["@searchable"];
        // check if the data is already selected
        var selected = item["@selected"] == null ? false : item["@selected"];
        // gets the icon
        var icon = item["@icon"] == null ? "" : item["@icon"];
        // gets the image
        var image = item["@image"] == null ? "" : item["@image"];
        return {
            name: name,
            isHeader: isHeader,
            value: value,
            searchable: searchable,
            selected: selected,
            icon: icon,
            image: image
        };
    }

    /**
     * Checks if a url holds a viable image
     * @param {String} url The image URL
     * @param {Function} callback Returns true if ir loaded fine, false otherwise
     */
    function imageExists(url, callback) {
        var img = new Image();
        img.onload = function() { callback(true); };
        img.onerror = function() { callback(false); };
        img.src = url;
     }

    /**
     * Gets the icon/image element and returns it in a callback function
     * Retuns null if no image/icon exists
     * @param {String} imagePath the path to the image
     * @param {String} icon the class to be applied to a icon tag
     * @param {Jquery Element} $elementP The parent element ot append the icon class to 
     */
    function displayImageOrIcon(imagePath, icon, $elementP) {
        var $display = $elementP.find('.JSM-itemImage');
        if ($display.length <= 0) return;
        
        var displayIcon = function() {
            if ($.type(icon) == "string" && icon != "") {
                $display.empty();
                $display.append($('<i class="'+ icon +'" aria-hidden="true"></i>'));
            }
            return null;
        };
        if ($.type(imagePath) == "string" && imagePath != "") {
            imageExists(imagePath, function(exists) {
                if (exists) {
                    var $imgEle = $('<img src="'+imagePath+'">');
                    $display.empty();
                    $display.append($imgEle);
                } else {
                    console.warn('Error displaying Image: "'+ imagePath +'", will fall back to Icon if exists...');
                    displayIcon();
                }
            });

        } else {
            displayIcon();
        }
    }

    return {
        displayImageOrIcon: displayImageOrIcon,
        getDisplayData: getDisplayData,
        getCheckboxLayout: getCheckboxLayout
    };
});
/**
 * Produces the displayed list for the data in the multiselect
 */
define('display/list',['require', 'jquery', 'data_store/get', 'data_store/set', 'display/displayHelper'], 
function(require, $, dataStoreGet, setData, displayHelper) {
    'use strict';
    
    var jquery = $;
    var getHeaderHTML;
    var getItemHTML;

    // variables ensuring unique head ids
    var headCount = 0;

    /**
     * This function iterates through a set of data setting the expected values and producing
     * an appendable jquery list
     * @param {Array} data Standard data format for this project
     * @param {jquery element} $parent A jquery element that will be appended to and searched from
     * @returns jquery nodelist that is formated against the multiselect data
     */
    function ConvertDataToHTML(data, $parent) {
        // if data is not an array
        if (!$.isArray(data)) return null;
        var appender = function(ele) {
            $parent.append(ele);
        };
        // for each multislect name in the data
        for (var i in data) {
            // ensure the name is not part of the multislectItemKeys (i.e. @searchable)
            if (data[i] != null) 
            {
                var item = data[i];
                
                var displayData = displayHelper.getDisplayData(item);
                if(displayData == null) continue;
                
                // if we have a header
                if (displayData.isHeader) {
                    item = getHeaderHTML(item, displayData, appender);
                } else { // else is just a selectable item
                    item = getItemHTML(item, displayData, appender);
                }
                // finds the icon and sets it
                displayHelper.displayImageOrIcon(displayData.image, displayData.icon, item['@element']);
            }
        }
    }

    getHeaderHTML = function(item, displayData, appendFunction) {
        // get the new group id
        var groupId = "JSM-GroupID-" + headCount;
        // update the unique count by 1
        headCount += 1;
        // this is the selectable item (expand button)
        var itemStr = `
            <a data-target="#` + groupId + 
                    `" class="list-group-item JSM-item-header collapsableIcon collapsed"
                    data-toggle="collapse" data-searchable="` + displayData.searchable + `">` +
                    displayHelper.getCheckboxLayout(displayData.selected, displayData.name) +
                '<span class="JSM-itemImage"></span>' +
                displayData.name + `
                <span class="drop-icon"></span>
            </a>
        `;
        // this is the group the above button expands
        var groupStr = `
            <div class="list-group collapse" id="` + groupId + `">
            </div>
        `;
        // get the jquery elements from the above strings
        var $ele = $(itemStr);
        var $group = $(groupStr);// the list group under the header

        // set the element portion of the data item
        setData.setElementForItem(item, $ele);
        // set all the inner data for the group
        ConvertDataToHTML(item['@children'], $group);
        // add the button and the group
        appendFunction([$ele, $group], item);
        return item;
    };

    getItemHTML = function(item, displayData, appendFunction) {
        // string format
        var eleString = `
        <span class="list-group-item" data-searchable="` + displayData.searchable + 
            `" data-value="` + displayData.value + `">` +
            displayHelper.getCheckboxLayout(displayData.selected, displayData.name, displayData.value) +
            '<span class="JSM-itemImage"></span>' +
            displayData.name + `
        </span>
        `;
        // get the jquery element
        var $ele = $(eleString);
        // set the element portion in the data cache
        setData.setElementForItem(item, $ele);
        // add it to the parent element
        appendFunction($ele, item);
        return item;
    };

    
    /**
     * Function finds the multiselect, takes the cached data and turns it into html
     * @param {String} multiselectName Name of the multiselect with data
     * @returns {Jquery HTML elements} A html list, but does already append it to the element
     */
    function init($ele, multiselectName) {
        // gets the multiselect data and elements
        var multiselectData = dataStoreGet.getDataByName(multiselectName);
        // finds the root of the list so we can append to it
        var $listRoot = $ele.find('.list-group-root').first();
        if ($listRoot == null || $listRoot.length <= 0) return null;
        // this is the starting node we are appending to
        var $html = $('<div class="list-group in"></div>');
        // recursivly append data to the html node list
        ConvertDataToHTML(multiselectData, $html);
        // add the list items to the list root
        $listRoot.append($html);
        // return the list item (non-null) to the caller
        return $html;
    }

    // finds the elements that are not displayed and shows them
    function displayMissing(multiselectName) {
        // check if data has previously been loaded
        var $multiselect = dataStoreGet.getElementByName(multiselectName);
        // if not will run init
        if ($multiselect.find(".list-group-root .list-group").length < 0) {
            return init($multiselect, multiselectName);
        }
        var appender = function($ele, item) {
            if (item == null) return;

            var myItemList = item["@parent"] != null ? item["@parent"]["@children"] : null;
            var parentElement = item["@parent"] != null ? item["@parent"]["@element"] : null;
            if (myItemList == null || parentElement == null) { // if parent is null then we are at the root
                myItemList = dataStoreGet.getDataByName(multiselectName);
                parentElement = dataStoreGet.getElementByName(multiselectName).find(".list-group-root > .list-group");
            }
            for (var i = 0; i < myItemList.length; i += 1) {
                if (myItemList[i] == item) {
                    if (i == 0) {
                        parentElement.prepend($ele);
                    } else if (myItemList[i - 1]['@element'] != null) {
                        var insertAfter = myItemList[i - 1]['@element'];
                        if (myItemList[i - 1]['@isHeader']) {
                            insertAfter = $(myItemList[i - 1]['@element'].data("target"));
                        }
                        $ele.insertAfter(insertAfter);
                    } else {
                        parentElement.append($ele);
                    }
                    break;
                }
            }
        };
        dataStoreGet.forEachItemInMutiselect(multiselectName, function(item) {
            if (item['@element'] == null) {
                var displayData = displayHelper.getDisplayData(item);
                if(displayData == null) return;
                if (item['@isHeader']) {
                    getHeaderHTML(item, displayData, appender);
                    return false;
                } else {
                    getItemHTML(item, displayData, appender);
                }
            }
        });
    }

    return {
        init: init,
        displayMissing: displayMissing
    };
});
define('utility/color',[],function () {
    'use strict';
    /**
    * Converts an RGB color value to HSL. Conversion formula
    * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes r, g, and b are contained in the set [0, 255] and
    * returns h, s, and l in the set [0, 1].
    *
    * @param   Number  r       The red color value
    * @param   Number  g       The green color value
    * @param   Number  b       The blue color value
    * @return  Array           The HSL representation
    */
    function rgbToHsl(r, g, b){
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    /**
    * Converts an HSL color value to RGB. Conversion formula
    * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes h, s, and l are contained in the set [0, 1] and
    * returns r, g, and b in the set [0, 255].
    *
    * @param   Number  h       The hue
    * @param   Number  s       The saturation
    * @param   Number  l       The lightness
    * @return  Array           The RGB representation
    */
    function hslToRgb(h, s, l){
        var r, g, b;

        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [
            Math.round(r * 255), 
            Math.round(g * 255), 
            Math.round(b * 255)
        ];
    }
    /**
    * converts rgb to hsl then will step through steps times until white
    * is acheived, all colors returned.
    * Always returns array of one or more, with the first element being the original color
    * runs fade to white steps times
    *
    * @param   Number  r       The red color value
    * @param   Number  g       The green color value
    * @param   Number  b       The blue color value
    * @param   Number  steps   The # of iterations till you reach white
    * @return  2D Array        The RGB representation of the fade, length steps + 1
    */
    function fadeRgbToWhite(r, g, b, steps) {
        var fadeArray = [[r, g, b]];
        var hsl = rgbToHsl(r, g, b);
        var reduce = (1 - hsl[2])/(steps); // the step size for the lightness
        for (var i = 0; i < steps; i += 1) {
            var l = hsl[2] + (reduce * (i + 1));
            fadeArray.push(hslToRgb(hsl[0], hsl[1], l));
        }
        return fadeArray;
    }

    /**
    * converts rgb to hsl then will step through steps times until white
    * is acheived, all colors returned.
    * Always returns array of one or more, with the first element being the original color
    * runs fade to white steps times
    *
    * @param   Number  r       The red color value
    * @param   Number  g       The green color value
    * @param   Number  b       The blue color value
    * @param   Number  steps   The # of iterations till you reach white
    * @return  2D Array        The RGB representation of the fade, length steps + 1
    */
   function fadeRgb(r, g, b, steps) {
        var fadeArray = [[r, g, b]];
        var hsl = rgbToHsl(r, g, b);
        var reduce = (1 - hsl[2])/(steps); // the step size for the lightness
        for (var i = 0; i < steps; i += 1) {
            var l = hsl[2] + (reduce * (i + 1));
            fadeArray.push(hslToRgb(hsl[0], hsl[1], l));
        }
        return fadeArray;
    }

    /**
     * Converts a string to a simple rgb array format
     * @param String rgbS       The string in format rgb(r, g, b)
     * @return Array [r,g,b], with r, g, and b as strings
     */
    function RgbStringToArray(rgbS) {
        return rgbS.replace("rgb(", "")
                .replace(")", "")
                .replace(" ", "")
                .split(",")
                .map(s => parseInt(s));
    }

    /**
     * Converts a rgb array to a standard rgb string format
     * @param array rgbA       The Array in fromat [r,g,b]
     * @return string like rgb(r,g,b)
     */
    function RgbArrayToString(rgbA) {
        if (!rgbA) return;
        return "rgb(" + 
            rgbA[0] + "," + 
            rgbA[1] + "," + 
            rgbA[2] + ")";
    }

    
    /**
     * Gets the brightness in lumens for the color,
     * Note: max is 255, so we will standardize from 0 to 1
     * @param array rgbA       The Array in fromat [r,g,b]
     * @return a float from zero to one in lumens
     */
    function GetBrightness(rgbA) {
        if (!rgbA) return;
        return (0.2126 * rgbA[0] + 
            0.7152 * rgbA[1] + 
            0.0722 * rgbA[2])/255; // per ITU-R BT.709
    }

    return {
        fadeRgbToWhite: fadeRgbToWhite,
        hslToRgb: hslToRgb,
        rgbToHsl: rgbToHsl,
        RgbStringToArray: RgbStringToArray,
        RgbArrayToString: RgbArrayToString,
        GetBrightness: GetBrightness
    };
  });
define('utility/nestedDepth',['require', 'jquery'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    // returns the depth
    /**
     * Retruns the number of "selectors" under the base element
     * Note: each element must be directly nested under the previous selecotr element
     * ---- Will not skip down to find the next selector if not among the children
     * @param $ele  the base jquery element you want to search from
     * @param selector the selector you want to search by
     * @param depth the depth you want to start from, defaults to zero if null
     * @return the integer value for the depth for each () 
     */
    function findDepth($ele, selector, depth) {
        if (typeof depth == "undefined" || depth == null) depth = 0;
        var $children = $ele.children(selector);
        var max = depth;
        $children.each(function (i, ele) {
            var d = findDepth($(ele), selector, depth + 1);
            if (d > max) max = d;
        });
        return max;
    }
    return findDepth;
});

define('style/body/colorIndent',['require', 'jquery', 'utility/color', 'utility/nestedDepth'], function(require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var colorUtil = require('utility/color');
    var nestedDepth = require('utility/nestedDepth');

    // sets the color for all list groups
    function setColorRecursively($ele, colorArray, colorI) {
        // for each child element
        $ele.children(".list-group").each(function (i, e) {
            var $e = $(e);
            // sets the background color
            $e.css("background-color", colorUtil.RgbArrayToString(colorArray[colorI]));
            // chacks the background color and changes text color for high constrast
            if (colorUtil.GetBrightness(colorArray[colorI]) < 0.5)
            {
                $e.addClass("textColorLighter");
            }else {
                $e.addClass("textColorDarker");
            }
            // finds children
            setColorRecursively($e, colorArray, colorI + 1);
        });
    }

    /**
     * sets the color fade for the multiselect
     * @param {jquery element} $multiselect the multiselect targeted  
     */
    function setColor($multiselect, color) {
        $multiselect.find(".list-group-root > .list-group").each(function(i, e) {
            var $ele = $(e);
            if (color != null) {
                $ele.css("background-color", color);
            }
            color = $ele.css("background-color");
            var rgbA = colorUtil.RgbStringToArray(color);
            var maxDepth = nestedDepth($ele, ".list-group");
            var fadeArray = colorUtil.fadeRgbToWhite(rgbA[0], rgbA[1], rgbA[2], maxDepth);

            $ele.css("background-color", colorUtil.RgbArrayToString(fadeArray[0]));
            setColorRecursively($ele, fadeArray, 1);
        });
    }
    return setColor;
});

define('style/body/spaceIndent',['require', 'jquery', 'utility/nestedDepth'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var nestedDepth = require('utility/nestedDepth');

    var initIndentPercent = 1/6;


    /**
     * Sets the sapce indentor for the specified multiselect
     * @param {Jquery element} $multiselect the multiselect 
     */
    function refresh($multiselect, indentPercent) {
        $multiselect.find(".list-group-root > .list-group").each(function() {
            var $ele = $(this);
            var bodyWidth = $multiselect.find(".JSM-body").width();
            var maxDepth = nestedDepth($ele, ".list-group");
            var indentLength = Math.ceil(bodyWidth/maxDepth*indentPercent);
            $ele.find(".list-group").css("margin-left", indentLength);
        }); 
    } 
    return {
        setInit: function($multiselect, localIndentPercent) {
            if(localIndentPercent == null) localIndentPercent = initIndentPercent;
            refresh($multiselect, localIndentPercent);
            (function() {
                var $m = $multiselect;
                var iP =  localIndentPercent;
                $(window).resize(function(){
                    refresh($m, iP);
                });
            }());
        },
        refresh: refresh
    };
});
define('sort/sortByAlpha',['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');
    /*
    This functon compares the data and sort it alphabtically
     We have defined isReverse to sort the data in reverse alphabetical order
    */
    function alphaSort(array, isReverse) 
    {
        array.sort(function(A, B) 
        {
            if (A == null && B == null) return 0;
            if (A == null) return -1;
            if (B == null) return 1;
           var a = A['@name'].toLowerCase();//Converting to lowercase to avoid case sensitive issue
           var b = B['@name'].toLowerCase();//Converting to lowercase to avoid case sensitive issue
           if (isReverse) {
                if (a < b) return 1;
                if (a > b) return -1;
           } else {
                if (a < b) return -1;
                if (a > b) return 1;
           }

           return 0; // equal 
        });
    }
    /*
    This functon goes through each header and sort it
    Nested structure sorting
    */
    function forEachHeader(data, fun) {
        for (var i in data) {
            if (data[i] != null) 
            {
                if (data[i]['@isHeader'])//If data is a header
                {
                    fun(data[i]);
                    forEachHeader(data[i]['@children'], fun);//Go inside the header and sort it
                }
            }
        }
    }
    /*
    Get the data from the multiselect in the form of an array
    */
    function handler(multiName, isReverse) 
    {
        var data = get.getDataByName(multiName);
        alphaSort(data, isReverse); // data is an array by defintion
        forEachHeader(data, function(header) 
        {
            alphaSort(header['@children'], isReverse);
        });
    }
    return handler;//Return thr sorted multielect
});

define('sort/sortByCustom',['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');
    /*
    This functon uses the custom sorting technique defined by the user
    We have defined isReverse to sort the data reversely as defined
    */
    function customSort(array, customSortFunction, isReverse) 
    {
        array.sort(function(A, B) 
        {
           var value = customSortFunction(A['@name'], B['@name']);
           if (isReverse) return -value;//Revrese sorting
           return value;
        });
    }
    /*
    This functon goes through each header and use the custom sort
    Nested structure sorting
    */
    function forEachHeader(data, fun) 
    {
        for (var i in data) 
        {
            if (data[i] != null) 
            {
                if (data[i]['@isHeader'])//If data is a header
                {
                    fun(data[i]);
                    forEachHeader(data[i]['@children'], fun);//Go inside the header and sort it
                }
            }
        }
    }
    /*
    Get the data from the multiselect in the form of an array
    */
    function handler(multiName, customSortFunction, isReverse) 
    {
        var data = get.getDataByName(multiName);
        customSort(data, customSortFunction, isReverse); // data is an array by defintion
        forEachHeader(data, function(header) 
        {
            customSort(header['@children'], customSortFunction, isReverse);
        });
    }
    return handler;//Return thr sorted multielect
});

define('sort/sort.config',['require',
        'data_store/get',
        'jquery', 
        'sort/sortByAlpha', 
        'sort/sortByCustom', 
    ], 
function(require, getData, $, sortByAlpha, sortByCustom) {
    'use strict';
    var jquery = $;

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler(name) {
        var sortSettings = getData.getSettingByName("sort", name);

        if (sortSettings != null) {
            var isReverse = (sortSettings.reverse === true || sortSettings.reverse === "true");

            if(sortSettings.type == "custom") {
                if ($.isFunction(sortSettings['sortDefine'])) {
                    sortByCustom(name, sortSettings['sortDefine'], isReverse);
                } else {
                    console.warn("custom for was not passed a function, refer to documentation");
                }
            } else if(sortSettings.type == "alpha") {
                sortByAlpha(name, isReverse);
            }
        }
    }

    return handler;
});
// defines the consructors for the data object
define('data_store/new',['require',
    'data_store/cache',
    'data_store/set',
    'data_store/get',
    'consts',
    'jquery',
    'display/list',
    'style/body/colorIndent',
    'style/body/spaceIndent',
    'sort/sort.config'],
function (require, cache, cacheSet, cacheGet, CONSTS, $, displayList, colorIndent, spaceIndent, sortConfig) {
    'use strict';

    var jquery;
    jquery = $;

    /**
     * Sets a new multiselect in the cache with these fields
     * @param {A Jquery or Plain HTML node} ele the element referencing the multiselect
     * @param {Object} data The inital data for the multiselect
     * @param {Object} options The inital options for the multiselect
     * @param {String} title The title (not name) for the multiselect
     * @returns {String} The name you can reference the multiselect by
     */
    function newMultiselect(ele, data, options, title) {
        var name = $(ele).attr('name');
        if (typeof name === 'undefined' || name == null) return null;
        if (data == null) data = [];
        if (!$.isPlainObject(options)) options = {};
        options = $.extend(CONSTS.CONST_OPTIONS(), options);

        var jqueryEle = $(ele).first();
        if (!cache.addMultiselect(name, jqueryEle, data, options, title)) return null;
        return name;
    }
    /**
     * Builds a new multiselect item so we don't miss any fields
     * @param {String} name the name of the item in the multiselect
     * @param {*} value the value to be placed into the multiselect
     * @param {Jquery Element} element The element reference to this item
     * @param {String} searchable The searchable text for this item
     * @param {Bool} selected A bool specifing if the item is pre-selected
     * @param {String} imagePath The path to the image to be displayed with this element
     */
    function newMultiselectItem(name, value, element, searchable, selected, imagePath, iconClass) {
        if (!(element instanceof jquery) && element != null) {
            element = $(element);
        }
        if (element != null && element.length <= 0 ) return null;

        if (value == null || value === "") return null;
        return {
            "@name": name,
            "@value": value,
            "@element": element,
            "@searchable": (searchable == null ? "": searchable),
            "@selected": (selected == null ? false : selected),
            "@isHeader": false,
            "@image": imagePath,
            "@icon": iconClass,
            "@parent": null
        };
    }

    /**
     * Builds a new multiselect header item so we don't miss any fields
     * @param {String} name the name of the header in the multiselect
     * @param {Array} children an array of objects that are the children for this item
     * @param {Jquery Element} element The element reference to this item
     * @param {String} searchable The searchable text for this item
     * @param {Bool} selected A bool specifing if the item is pre-selected
     * @param {String} imagePath The path to the image to be displayed with this element
     * @param {String} iconClass The classes to be attached to the icon tag if no image exists
     */
    function newMultiselectHeader(name, children, element, searchable, selected, imagePath, iconClass) {
        if (!(element instanceof jquery) && element != null) {
            element = $(element);
        }
        if (element != null && element.length <= 0 ) return null;
        if (!$.isArray(children) || children.length <= 0) return null;

        var header = {
            "@name": name,
            "@element": element,
            "@searchable": (searchable == null ? "": searchable),
            "@selected": (selected == null ? false : selected),
            "@isHeader": true,
            "@image": (imagePath == null ? "": imagePath),
            "@icon": (iconClass == null ? "": iconClass),
            "@children": children,
            "@parent": null
        };

        for(var i in children) {
            if (children[i] != null)
                children[i]['@parent'] = header;
        }
        
        return header;
    }

    /**
     * Merges the data existing in the multiselect with the new data
     * @param {String} name Multiselector name 
     * @param {JSON} newData JSON data to add to the multiselect
     */
    function addNewData(name, newData) {
        var removeElement = function(item) {
            if (item['@isHeader']) {
                $(item['@element'].data("target")).remove();
            }
            if (item['@element'] != null)
                item['@element'].remove();
        }
        if (name == null) return;
        // defers to dataA
        var recurseCompareData = function(dataA, dataB) {
            if (dataA == null) dataA = [];
            if (dataB == null) dataB = [];
            var bIndex = 0;
            var returnData = [];
            var issueNames = [];
            var aNames = dataA.map(x => x['@name']);
            var bNames = dataB.map(x => x['@name']);
            var foundBIndexes = [];
            for (var aIndex = 0; aIndex < aNames.length; aIndex += 1) {
                bIndex = bNames.indexOf(aNames[aIndex]);
                if (bIndex >= 0) {
                    foundBIndexes.push(bIndex);
                    // merg the data recusivly
                    var issueA = dataA[aIndex];
                    var issueB = dataB[bIndex];
                    if (issueA['@isHeader'] || issueB['@isHeader']) {
                        issueA['@children'] = recurseCompareData(issueA['@children'], issueB['@children']);                          
                        issueA['@isHeader'] = true;
                    }
                    if (issueB['@element'] != null)
                        removeElement(issueB);
                    if (issueB['@selected'] == true) issueA['@selected'] = true;
                    returnData.push(issueA);
                } else { // we can now safly add aIndex
                    returnData.push(dataA[aIndex]);
                }
            }

            for (bIndex = 0; bIndex < dataB.length; bIndex += 1) {
                if (foundBIndexes.indexOf(bIndex) < 0) // selects unmerged indexes
                    returnData.push(dataB[bIndex]);
            }
                
            return returnData;
        };
        var data = cacheGet.getDataByName(name);
        cacheSet.replaceDataByName(name, recurseCompareData(newData, data));
        sortConfig(name);
        displayList.displayMissing(name);
        spaceIndent.refresh(cacheGet.getElementByName(name));
        colorIndent(cacheGet.getElementByName(name));
    }

    return {
        newMultiselect: newMultiselect,
        newMultiselectHeader: newMultiselectHeader,
        newMultiselectItem: newMultiselectItem,
        addNewData: addNewData
    };
});
define('data_input/liveHTML',['require', 'jquery', 'data_store/new'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');

    /**
     * A Private function that recurses over the html list and builds the
     * Multiselect data cache
     * @param {Jquery Nodelist} $groupHead The start of the group
     * @return {Object} The multiselect formatted data in JSON object
     */
    function ProcessHTML($groupHead) {
        // return object
        var rv = [];
        // for each child under the head
        $groupHead.children("li").each(function() {
            var $child = $(this);
            // get the attributes
            var name = $child.attr('name') != null ? $child.attr('name') : $child.attr('title');
            var searchable = $child.attr('searchable') == null ? "" : $child.attr('searchable');
            // this is a special property
            var selected = $child.attr('selected') != null || $child.attr('checked') != null;
            // get the text contents
            var content = $child.contents()[0] != null ? $child.contents()[0].nodeValue : null;
            if (content != null) {
                content = content.trim();
                if (content == "") content = null;
            }

            // get the images and icons
            var iconClass = $child.children("i").first().attr("class");
            var imagePath = $child.children("img").first().attr("src");
            if ((iconClass == null || iconClass == "") && (imagePath == null || imagePath == "")) {
                iconClass = $child.data()['icon'];
                imagePath = $child.data()['img'];
            }

            // define name if not already
            if (typeof name === 'undefined' || name === null) {
                if (content != null) name = content;
                else return null;
            }
            
            // check is group or just item
            if ($child.children("ul").length > 0) { // is group
                // get the group (only sleect first group)
                var $group = $child.children("ul").first();
                // get the children for this node
                var children = ProcessHTML($group);
                // if no children continue
                if (children == null) return null;
                // get the group object
                var header = dataStoreNew.newMultiselectHeader(
                    name,
                    children,
                    null, 
                    searchable, 
                    selected, 
                    imagePath, 
                    iconClass
                );
                rv.push(header);
                
            } else { // is item
                // get the value for the item
                var value = $child.attr('value');
                // make sure the important attribute exist

                if (typeof value === 'undefined' || value === null) {
                    // we deffinitly have a name at this point
                    value = name;
                }
                // get the new data item and store under given name
                var item = dataStoreNew.newMultiselectItem(
                    name,
                    value, 
                    null, 
                    searchable, 
                    selected, 
                    imagePath, 
                    iconClass
                );
                if (item == null) return;
                rv.push(item);
            }
        });
        return rv;
    }

    /**
     * This function processes a live nodelist or jquery node list into
     * a data format that can be stored by the multiselect
     * @param {Jquery or HTML nodelist} nodeList data will be extracted from this item
     */
    return function(nodeList) {
        // checks to make sure the list is jquery
        if (!(nodeList instanceof jquery)) {
            nodeList = $(nodeList);
        }
        // clones the list so we don't mess it up
        nodeList = nodeList.clone();

        // processes the html into a correct data format
        return ProcessHTML(nodeList);
    };
});
define('data_input/inputHelper',['require', 'jquery'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');

    /**
     * Finds either name or @ name within the jsonItem and returns it
     * NOTE: Preference is given to @ name
     * @param {String} name The name of the attribute
     * @param {Object} jsonItem The json object the value will be tried to pull from
     * @param {Bool} remove If true, removes that name from the jsonItem
     */
    function getAttributeFromJSON(name, jsonItem, remove) {
        remove = remove == null || remove == "true" || remove == true;
        var rv = null;
        if ($.isPlainObject(jsonItem) && $.type(name) == "string" && name.length > 0) {
            if(jsonItem['@' + name] != null) {
                rv = jsonItem['@' + name];
                if (remove) delete jsonItem['@' + name];
            } else if(jsonItem[name] != null) {
                rv = jsonItem[name];
                if (remove) delete jsonItem[name];
            }
            return rv;
        }
        return null;
    }

    /**
     * This function takes the object and strips out the data fields from it and returns in a standardized list
     * For gather @attr vs just attr items 
     * @param {Object} jsonItem 
     */
    function getJSONValues(jsonItem)
    {
        var valueNames = ['value', 'searchable', 'selected', 'image', 'icon'];
        var rv = {};

        for (var n in valueNames) {
            if (valueNames[n] != null) {
                rv['@' + valueNames[n]] = getAttributeFromJSON(valueNames[n], jsonItem, true);
            }
        }
        // any special processing we need to do
        rv['@selected'] =  rv['@selected'] == true ||  rv['@selected'] == "true";

        return rv;
    }


    return {
        getJSONValues: getJSONValues,
        getAttributeFromJSON: getAttributeFromJSON
    };
});
define('data_input/array',['require', 'jquery', 'data_store/new', 'logger', 'data_input/inputHelper'], function(require) { 
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    var logger = require('logger');
    var helper = require('data_input/inputHelper');

    /**
     * An internal function that recurses over the input array data and builds 
     * the Multiselect data cache 
     * @param {type} array array inputted data 
     * @return {object} the multiselect formatted data in JSON object
     */
    function ProcessArray(array) {
        if(!$.isArray(array)) return null; // if the input is not an array 
        var rv = []; // returnvalue
        for (var i in array) { // for every item in the array check 
            if ($.isPlainObject(array[i])) {

                //get attributes associated with the object
                var name = helper.getAttributeFromJSON('name', array[i], true);
                if (name == null) continue;

                var items = helper.getAttributeFromJSON('items', array[i], true);

                var values = helper.getJSONValues(array[i]);

                //  If items length is greater than 0 , it is a header else it is an item
                if ($.isArray(items) && items.length > 0) { // is header
                    var header = dataStoreNew.newMultiselectHeader(
                        name,
                        ProcessArray(items), // Recursive processing
                        null, 
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    if (header == null) continue;
                    
                    rv.push(header); 

                } else { // is item
                    if (values['@value'] == null) continue;
                    // get the item and store under the given name
                    var item = dataStoreNew.newMultiselectItem(
                        name,
                        values['@value'], 
                        null, 
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    if (item == null) continue;

                    rv.push(item);
                }
            }
        }
        return rv;
    }

   return function(arrayData) {
        var clonedArrayData = JSON.parse(JSON.stringify(arrayData));
        return ProcessArray(clonedArrayData);
   };
});
define('data_input/HTML',['require', 'jquery', 'data_store/new', 'logger', 'data_input/liveHTML'], function(require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    var logger = require('logger');
    var liveHTML = require('data_input/liveHTML');

    return function loadHTML(strHTML) {
        var html = null;
        try { // try to parse html
            html = $.parseHTML(strHTML.trim());
            
        } catch (ex) {
            // give some warning to the user
            console.warn("Not a valid HTML");
            return null;
        }
        // process using liveHTML and return
        if (html != null) return liveHTML(html);
        return null;
    };
});
define('data_input/JSON',['require', 'jquery', 'data_store/new', 'data_input/inputHelper'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');
    var helper = require('data_input/inputHelper');
    /**
     * This function is used to process the JSON data 
     * remove any null keys 
     * to distinguish between the special keys(@..)and the normal one
    */
    function ProcessJson(jsonData)
    {
        var rv = [];
        for(var name in jsonData) {
            if(typeof jsonData[name] =='object' && jsonData[name] != null) 
            {
                // get then delete object attributes here
                var values = helper.getJSONValues(jsonData[name]);

                if(values['@value'] == null) // is header
                {
                    var children = ProcessJson(jsonData[name]);
                    if (children == null) continue;
                    var header = dataStoreNew.newMultiselectHeader(
                        name,
                        children,
                        null,
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    rv.push(header);             
                } else 
                { // is item
                    var item = dataStoreNew.newMultiselectItem(
                        name,
                        values['@value'], 
                        null, 
                        values['@searchable'], 
                        values['@selected'], 
                        values['@image'], 
                        values['@icon']
                    );
                    if (item == null) continue;
                    rv.push(item);
                }
            }
        }
        return rv;
    }
    /**
     * this function takes the JSON data as a parameter
     * checks whether the data is JSON or not
     * clone the JSON data
     * process the JSON data
    */
    return function(jsonData) 
    {
        if(typeof jsonData !='object') //Checking whether the data read is object 
        {
            try {
                jsonData = $.parseJSON(jsonData);//Ot takes the JSON data nd return the JavaScript value
            } catch(err) {
                console.warn("Data is not json or json parsable"); //Throw error if data is not JSON format
                return null;
            }
        }
        //merge the JSON data within another empty file or making a copy of the JSON data
        jsonData = $.extend(true, {}, jsonData);
        
        return ProcessJson(jsonData);
    };
});
define('data_input/CSV',['require', 'jquery', 'data_store/new'], function(require) { 
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');

    function Seperator(csvString){
        var rows = csvString.trim().split("\n");
        var seperated = [];
        for(var i in rows){
            seperated.push(rows[i].split(","));
            for(var r in seperated[i]) 
                seperated[i][r] = seperated[i][r].replace(/"/g, '').trim();
        }
        return seperated;
    }

    function getHeaderItems(array, name) {
        var headerArray = [];
        for(var i = 0; i < array.length; i += 1) {
            var splitname = array[i][0].split(".");
            if(splitname.length > 1 && splitname[0] == name){
                array[i][0] = array[i][0].replace(name + ".", '');
                headerArray.push(array.splice(i, 1)[0]);
                i -= 1;
            }
        }
        return headerArray;
    }

    function NestData(sepinput){
        for(var i in sepinput) {
            if (sepinput[i][0] != null && sepinput[i][0].indexOf('.') == -1) {
                var header = getHeaderItems(sepinput, sepinput[i][0]);
                if (header.length > 0) {
                    sepinput[i][sepinput[i].length] = NestData(header);
                }
            }
        }
        return sepinput;
    }

    var NUM_ATTRIBUTES = 6;

    function ProcessCSV(data) {
        var rv = []; // returnvalue

        // loop
        for(var i =0; i <data.length; i += 1){
            var name = data[i][0];
            var value = data[i][1];
            var searchable = data[i][2];
            var selected = data[i][3] === "true";
            var image = data[i][4] != "" ? data[i][4] : null;
            var icon = data[i][5] != "" ? data[i][5] : null;
            
            //  If items length is greater than 0 , it is a header else it is an item
            if (data[i].length > NUM_ATTRIBUTES) { // is header
                var nestedItems = data[i][NUM_ATTRIBUTES];
                var header = dataStoreNew.newMultiselectHeader(
                    name,
                    ProcessCSV(nestedItems),
                    null,    
                    searchable, 
                    selected, 
                    image, 
                    icon
                );
                rv.push(header); 

            } else { // is item
                if (name == null) continue;
                // get the item and store under the given name 
                rv.push(dataStoreNew.newMultiselectItem(
                    name,
                    value, 
                    null, 
                    searchable, 
                    selected, 
                    image, 
                    icon
                ));
            }
        }
        // noop
        return rv;

    }


   return function(csvData) {
        var s = Seperator(csvData);
        //return null;
        var n = NestData(s);
        return ProcessCSV(n);
   };
});
define('data_input/XML',['require', 'jquery', 'data_store/new'], function (require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreNew = require('data_store/new');  

    function ProcessXML($parentXml) {
        // return object
        var rv = [];
        $parentXml.children("item").each(function () {
            var child = $(this);
            var name = child.children("name").first().text();
            var value = child.children("value").first().text();
            var searchable = child.children("searchable").first().text();
            var selected = child.children("selected").first().text() === "true";
            var iconClass = child.children("icon").first().text();
            var imagePath = child.children("image").first().text();

            if (child.children("item").length > 0) {// is header

                var children = ProcessXML(child);

                if (children == null || $.isEmptyObject(children)) return null;

                rv.push(dataStoreNew.newMultiselectHeader(
                    name, 
                    children, 
                    null, 
                    searchable, 
                    selected, 
                    imagePath, 
                    iconClass)
                );

            } else { // is item
                if (typeof value === 'undefined' || value === null) {
                    // we deffinitly have a name at this point
                    value = name;
                }
                // get the new data item and store under given name
                rv.push(dataStoreNew.newMultiselectItem(
                    name, 
                    value, 
                    null, 
                    searchable, 
                    selected, 
                    imagePath, 
                    iconClass)
                );
            } 
        });
        return rv;
    }

    return function (xmlString) {
        var parsedXML = null;
        try {
            parsedXML = $($.parseXML(xmlString));
        } catch (ex) {
            return null;
        }
        if (parsedXML == null) return null;
        return ProcessXML(parsedXML.children().first());
    };
});
define('data_input/load',['require', 'jquery', 'data_input/liveHTML', 'data_input/array', 'data_input/HTML', 
'data_input/JSON', 'data_input/CSV', 'data_input/XML'],function (require) {
    'use strict';
    
    var $, jquery;
    $ = jquery = require('jquery');

    function getLoadFunction(functionPath) {
        if (jquery.isFunction(functionPath)) return functionPath;
        if (typeof functionPath != "string") return null;
        var functionArray = functionPath.split(".");
        var fun =  window[functionArray[0]];
        for (var i = 1; i < functionArray.length; i += 1) {
            if (functionArray[i] == null) return null;
            else if (fun != null) fun = fun[functionArray[i]];
            else return null;
        }
        return fun;
    }

    /**
     * For each input type there should be a corresponding function labeled
     * under the caller Name
     */
    var typeFunctions = {
        "liveHTML": require('data_input/liveHTML'),
        "JSON": require('data_input/JSON'),
        "array": require('data_input/array'),
        "HTML": require('data_input/HTML'),
        "XML": require('data_input/XML'),
        "CSV": require('data_input/CSV')
    };
    
    /**
     * Calls the load function on the data produced by the data function
     * the developer passed in
     * @param {String} functionPath the name of the function to get the data from
     * @param {String} dataType The data type the above function returns
     */
    function load(functionPath, dataType) {
        // JSON is default data type
        if (dataType == null) dataType = 'JSON';
        var loadFunction = getLoadFunction(functionPath);

        // determines if we can get the data from the elements passed in
        if (typeFunctions[dataType] == null ||
            !jquery.isFunction(typeFunctions[dataType]) ||
            !jquery.isFunction(loadFunction)) return null;
        // gets the developers data
        var devData = loadFunction();
        if (devData == null) return null;
        // processes the data and returns 
        return typeFunctions[dataType](devData);
    }

    return {
        load: load,
        loadTypes: function() {
            return Object.keys(typeFunctions);
        }
    };
});
define('display/title',['require', 'jquery', 'data_store/get'], function(require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var dataStoreGet = require('data_store/get');

    /**
     * Finds the data store and pulls the title and element,
     * The find the title-header and adds it to the element
     * @param {String} multiName The name of the multiselect
     */
    return function($ele, multiName) {
        var title = dataStoreGet.getTitleByName(multiName);
        if (title == null) return;
        $ele.find(".JSM-head .JSM-title").text(title);
    };
});
define('display/display.config',['require',
        'consts',
        'data_store/get',
        'jquery',
        'display/list',
        'display/title'
    ], 
function(require, CONSTS, getData, $, displayList, displayTitle) {
    'use strict';
    var jquery = $;

    var displayClasses = ['popoverSelect', 'multiColumn', 'singleColumn'];
    
    function removeDisplayClasses($ele) {
        for (var i in displayClasses) {
            if ($ele.hasClass(displayClasses[i]))
                $ele.removeClass(displayClasses[i]);
        }
    }

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler(name) {
        var $ele = getData.getElementByName(name);
        var displaySettings = getData.getSettingByName("display", name);

        if ($ele == null) return;

        // empty the element
        $ele.empty();

        removeDisplayClasses($ele);

        if (displaySettings.type == "popover") {
            // get the basic layout
            $ele.html(CONSTS.CONST_POPOVER_LAYOUT());
            $ele.addClass("popoverSelect");
        } else if (displaySettings.type == "multiColumn") {
            $ele.html(CONSTS.CONST_MULTICOLUMN_LAYOUT());
            $ele.addClass("multiColumn");
        } else {
            $ele.addClass("singleColumn");
            $ele.html(CONSTS.CONST_SINGLECOLUMN_LAYOUT());
        }

        displayList.init($ele, name);

        displayTitle($ele, name);
    }
    return handler;
});
define('style/multicolumn',['require',
        'jquery'
    ], 
function(require, $) {
    'use strict';
    var jquery = $;

    /**
     * Turns the multiselect into a responsize multicolumn select
     * @param {jquery element} $multiselect the targeted multiselect
     * @param {JSON} settings the settings of the target multiselect
     */
    function handler($multiselect, settings) {
        var $jsmBody = $multiselect.find(".JSM-body");
        var $jsmList = $jsmBody.find(".JSM-list");
        var $jsmFirstGroup = $jsmList.children(".list-group");
        var currentNumColumns = -1;

        var maxColumns = settings['numColumns'] = $.isNumeric(settings['numColumns']) ? settings['numColumns'] : 3;
        if (maxColumns <= 0) maxColumns = 3;

        function toggleSpace(numVisibleItems, itemHeight) {
            // adds and removes space as needed to keep the list balanced
            var numCurrSpace = $jsmFirstGroup.children(".JSM-spacer").length;

            var totalNeededSpaces = currentNumColumns - (numVisibleItems % currentNumColumns);
            var neededSpace = totalNeededSpaces % currentNumColumns - numCurrSpace;

            if (neededSpace > 0) {
                for(var i = 0; i < neededSpace; i += 1) {
                    $jsmFirstGroup.append('<div class="JSM-spacer"></div>');
                }
            } else if (neededSpace < 0) {
                var $removal = $jsmFirstGroup.children(".JSM-spacer").slice(0,-neededSpace);
                $removal.animate({
                        height: "0",
                    }, 0,
                    function() {
                        $removal.remove();
                    }
                );
            }
            $jsmFirstGroup.children(".JSM-spacer").animate({
                    height: itemHeight + "px",
                }, 0
            );
        }

        function toggleCSS($selectedItem) {
            var itemHeight = Math.ceil(
                $jsmList.find('.list-group-item:visible').first().outerHeight()
            );
            var numVisItems = $jsmList.find('.list-group-item:visible').length;

            var maxHeight = $jsmBody.css('max-height').replace('px', '');
            var currHeight = itemHeight * numVisItems;

            if (settings['dynamicColumns'] === true || settings['dynamicColumns'] === "true") {
                currentNumColumns = Math.ceil(currHeight/maxHeight);
                if (currentNumColumns > maxColumns) currentNumColumns = maxColumns;
                if (currentNumColumns < 1) currentNumColumns = 1;
            } else {
                currentNumColumns = maxColumns;
            }
            if ($jsmFirstGroup.css('column-count') != currentNumColumns) {
                $jsmFirstGroup.css({
                    '-webkit-column-count': currentNumColumns,
                    'moz-column-count': currentNumColumns,
                    'column-count': currentNumColumns
                });
            }

            $jsmFirstGroup.animate({
                    width: (100/maxColumns * currentNumColumns) + "%",
                }, 200
            );
            toggleSpace(numVisItems, itemHeight);
        }

        $jsmList.on("shown.bs.collapse hidden.bs.collapse", ".list-group.collapse", function(e) {
            toggleCSS($(this));
        });
        toggleCSS();
    }
    
    return handler;
});

define('utility/showHideItems',['require',
    'jquery'
],
    function (require, $) {
        'use strict';
        var jquery = $;

        function hideItem(item) {
            if (item['@element'] != null) {
                item['@element'].hide();
                if (item['@isHeader']) {
                    $(item['@element'].data('target')).css({"display": "none"});
                }
            }
        }

        function showItem(item) {
            if (item['@element'] != null) {
                item['@element'].show();
                if (item['@isHeader']) {
                    $(item['@element'].data('target')).css({"display": ""});
                }
            }
        }

        function showAllChildren(item) {
            if (item != null && item['@isHeader']) {
                for (var i = 0; i < item['@children'].length; i += 1) {
                    showItem(item['@children'][i]);
                    showAllChildren(item['@children'][i]);
                }
            }
        }

        



        return {
            hideItem: hideItem,
            showItem: showItem,
            showAllChildren: showAllChildren
        };
    });

define('searching/searchHelper',['require', 'jquery', 'data_store/get', 'utility/showHideItems'],
    function (require, $, getData, showHideItems) {
    'use strict';

    var jquery = $;

    var searchByFunction = function(determineSearch, data, isCaseSensitive, filterInterval) {
        var returnVisible = false;
        for (var i = 0; i < data.length; i += 1) {
            var item = data[i];

            var name = item['@name'];
            var searchable = item['@searchable'];
            if (!isCaseSensitive) {
                name = name.toLowerCase();
                searchable = searchable.toLowerCase();
            }
            if (filterInterval == null || filterInterval == '') {
                filterInterval = 0;
            }

            // if input is not empty, and the input matches an entry in the 
            // multiselect, show the item and its children
            if (determineSearch(name, searchable)) {
                showHideItems.showItem(item);
                showHideItems.showAllChildren(item);
                returnVisible = true;
            } else {
                if (item['@isHeader']) {
                    // recursively performs the plain text search on the child items 
                    // to check if they are visible
                    var isAnyVisible = searchByFunction(
                        determineSearch, 
                        item['@children'], 
                        isCaseSensitive,
                        filterInterval
                    );
                    if (isAnyVisible) {
                        showHideItems.showItem(item);
                        returnVisible = true;
                    } else {
                        showHideItems.hideItem(item);
                    }
                } else {
                    showHideItems.hideItem(item);
                }
            }
        }
        return returnVisible;
    };
    return {
        searchByFunction: searchByFunction,
        clearSearch: function($multi) {
            var $searchBar = $multi.find(".JSM-head .JSM-search .JSM-searchbar");
            $searchBar.val("");
            $searchBar.trigger("keyup");
        }
    };
});
define('style/popover',['require', 'jquery', 'data_store/get', 'data_store/set', 'style/body/spaceIndent', 'searching/searchHelper'], 
function(require, $, getData, setData, spaceIndent, searchHelper) {
    'use strict';
    
    var jquery = $;
    var isPopped = [];

    // Function to Display popovers after selection
    function Popup(item, $multiselect){
        // Popover Basic style
        var poppedItem = $(            
            '<span class="JSM-popover">'+
                item["@name"] +
                '<span class="fa fa-times JSM-closePopover" style="margin-left: 10px"aria-hidden="true"></span>' +
            '</span>'
        );
        $multiselect.find(".JSM-popoverDisplay").append(poppedItem);

        isPopped.push({
            remove: (function() {
                var Item = item;
                var ItemCheckbox = item['@element'].find(".JSM-checkbox");
                var PoppedItem = poppedItem;

                var remove = function(userInit) {
                    if (PoppedItem != null && Item != null) {
                        PoppedItem.remove();
                        if (userInit == true)
                            setData.setSelectedForItem(Item, false);

                        var items = isPopped.map(function(p) { return p.item; });
                        var itemIndex = items.indexOf(Item);
                        if (itemIndex >= 0)
                            isPopped.splice(itemIndex, 1);
                    }
                };
                PoppedItem.find(".JSM-closePopover").on("click", function() { remove(true); });
                return remove;
            }()),
            item: item
        });
    }

    //Handler function to retrieve data
    function handler(multiName, $multiselect, settings) {

        var timeoutVar = null;

        var showList = function(event) {
            $multiselect.find(".JSM-list").collapse("show");
            if (timeoutVar != null) {
                clearTimeout(timeoutVar);
                timeoutVar = null;
            }
        };

        //Display the list of items only when the focus is ON
        $multiselect.on("mouseenter", "*", showList);
        $multiselect.on("mouseenter", showList);
        //Hide the list when the focus goes off the multiselect
        $multiselect.on("mouseleave", function(){
            timeoutVar = setTimeout(function() {
                $multiselect.find(".JSM-list").collapse("hide");
            }, 500);

        });

        var onCheckboxChange = function() {
            var data = getData.getDataByName(multiName);
            var shouldBePopped = [];
            var recurseChildren = function(data) {
                if (data == null) return [];
                var rv = [];
                for (var i in data) {
                    if (data[i] != null && data[i]['@selected']) {
                        rv.push(data[i]);
                    } else if (data[i]['@isHeader']) {
                        rv = rv.concat(recurseChildren(data[i]['@children']));
                    }
                }
                return rv;
            };
            shouldBePopped = recurseChildren(data);

            var i;
            for (i = 0 ; i < isPopped.length; i += 1) {
                var index = -1;
                // finds the index for those that should be popped
                for (var should = 0; should < shouldBePopped.length; should += 1) {
                    if (shouldBePopped[should]['@element'] == isPopped[i]['item']['@element']) {
                        index = should;
                    }
                }
                // if already popped, don't pop again
                if (index >= 0) {
                    shouldBePopped.splice(index, 1);
                } else { // if isPopped should not be, remove it
                    isPopped[i].remove();
                    i -= 1; // adjusts the index
                }
            }
            // all those that should be popped but are not need to be displayed
            for (i = 0; i < shouldBePopped.length; i += 1) {
                Popup(shouldBePopped[i], $multiselect);
            }
        }
        $multiselect.on("change", ".JSM-list .JSM-checkbox", onCheckboxChange);
        onCheckboxChange();
    }

    return handler;
});
define('utility/getMultiselectName',['require', 'jquery', 'consts'], function(require) {
    'use strict';
    
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
define('style/body/cascadingSelect',['require', 
        'jquery', 
        'utility/getMultiselectName', 
        'data_store/get', 'data_store/set'], 
    function(require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var getMultiselectorName = require('utility/getMultiselectName');
    var getData = require('data_store/get');
    var setData = require('data_store/set');

    var keyCheckbox = "input.JSM-checkbox:checkbox";
    var keyItem = ".list-group-item";
    var keyNonheaders = keyItem + ":not(.JSM-item-header)";
    var keyHeaders = keyItem + ".JSM-item-header";

    /**
     * Sets the on click event for the multiselect
     * @param {jquery element} $multiselect the targeted multiselect  
     */
    function registerCheckboxClick(name, $multiselect) {
        if (name == null) return;

        var selectItem = function(that, event) {
            $(that).parents(".list-group").each(function() {
                var $this = $(this);
                var id = $this.prop("id");
                var header = $this.siblings('[data-target="#'+id+'"]');
                var headerCheckbox = header.find(keyCheckbox);
                if ($this.find(keyNonheaders + " " + keyCheckbox).length === 
                    $this.find(keyNonheaders + " " + keyCheckbox + ":checked").length) {
                    if (headerCheckbox.prop('checked') != true)
                        headerCheckbox.prop('checked', true).change();
                } else {
                    if (headerCheckbox.prop('checked') != false)
                        headerCheckbox.prop('checked', false).change();
                }
            });
        };

        var selectHeader = function(that, event) {
            var $this = $(that);
            var isChecked = $this.is(':checked') === true;
            var item = $this.parent();
            var listId = item.data("target");
            var list = $(listId);
            var setItems = null;
            if (isChecked) {
                setItems = list.find(keyItem + " " + keyCheckbox + ":not(:checked)");
            } else {
                setItems = list.find(keyItem + " " + keyCheckbox + ":checked"); 
            }
            if (setItems != null)
                setItems.prop('checked', isChecked).change();
            selectItem(that, event);
        };

        $multiselect.on("click", keyHeaders + " " + keyCheckbox, function(event) {
            
            selectHeader(this, event);
            // keep the drop down from expanding
            event.stopPropagation();
        });
        $multiselect.on("keypress", keyHeaders + " " + keyCheckbox, function(event) {
            if (event.keyCode == 13)
                selectHeader(this, event);
        });

        
        $multiselect.on("click", keyNonheaders + " " + keyCheckbox, function(event) {
            selectItem(this, event);
        });

        $multiselect.on("keypress", keyHeaders + " " + keyCheckbox, function(event) {
            if (event.keyCode == 13)
                selectItem(this, event);
        });

        // trigger on change for selected
        $multiselect.find(keyNonheaders + " " + keyCheckbox + ":checked").each(function() {
            selectItem(this);
        });
        // find headers with unselected children and select them
        var HeaderItems = $multiselect.find(keyHeaders).has(keyCheckbox + ":checked");

        HeaderItems.each(function() {
            $($(this).data("target")).find(keyCheckbox + ":not(:checked)").prop('checked', true).change();
        });


    }

    return registerCheckboxClick;
});
define('style/body/textColor',['require', 'jquery', 'utility/color'], function (require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var colorUtil = require('utility/color');

    /**
     * sets the color fade for the multiselect
     * @param {jquery element} $multiselect the multiselect targeted  
     */
    function setTextColor($multiselect, color) {
        $multiselect.find(".list-group-item").each(function (i, e) {
            var $ele = $(e);
            if (color != null) {
                $ele.css("color", color);
            }
            color = $ele.css("color");
        });
    }
    return setTextColor;
});

define('style/body/borderSettings',['require', 'jquery', 'utility/color'], function (require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var colorUtil = require('utility/color');

    //can also use this to just set the borders to all one color
    function setBorderColor($multiselect, color) {
        $multiselect.find(".list-group-item").each(function (i, e) {
            var $ele = $(e);
            if (color != null) {
                $ele.css("border-color", color);
            }
            color = $ele.css("border-color");
        });
    }

    function setBorderWidth($multiselect, widthInPixels) {
        $multiselect.find(".list-group-item").each(function (i, e) {
            var $ele = $(e);
            if (widthInPixels != null) {
                $ele.css("border-width", widthInPixels)
            }
            widthInPixels = $ele.css("border-width");
        });
    }

    return {
        setBorderColor: setBorderColor,
        setBorderWidth: setBorderWidth
    };
});

define('style/body/backgroundColor',['require', 'jquery', 'utility/color'], function (require) {
    'use strict';

    var $, jquery;
    jquery = $ = require('jquery');
    var colorUtil = require('utility/color');

    /**
     * sets the color fade for the multiselect
     * @param {jquery element} $multiselect the multiselect targeted  
     */
    function setBGColor($multiselect, color) {
        $multiselect.css("background-color", color);
    }
    return setBGColor;
});

define('style/colorSelect',['require', 'jquery', 'data_store/get', 'style/body/colorIndent'], function(require, $, dataStoreGet, colorIndent) {
    'use strict';

    function lightDisplay($multiselect) {
        var color = "#a29fa8";
        colorIndent($multiselect, color);
    }

    function darkDisplay($multiselect) {
        var color = "#0d0916";
        colorIndent($multiselect, color);
    }

    function customFadeDisplay(ccolor){
        colorIndent.setColorRecursively($ele, colorArray, ccolor);
    }
    
    var $, jquery;
    jquery = $ = require('jquery');
    var getData = require('data_store/get');
    function handler(multiName, $multiselect, displaySettings) {

        if (displaySettings.lightDisplay == true) lightDisplay($multiselect);
        if (displaySettings.darkDisplay == true) darkDisplay($multiselect);
        if (displaySettings.customFadeDisplay == true) customFadeDisplay(color);
    }
    return handler;
});
define('style/style.config',['require',
        'consts',
        'jquery',
        'style/multicolumn',
        'style/popover',
        'style/body/cascadingSelect', 
        'style/body/colorIndent', 
        'style/body/spaceIndent',
        'style/body/textColor',
        'style/body/borderSettings',
        'style/body/backgroundColor',
        'style/colorSelect',
        'data_store/get'], 
function(require, CONSTS, $, multicolumnStyle, popoverStyle, cascadingSelect, 
    colorIndent, spaceIndent, textColor, borderSettings,backgroundColor, colorSelect, getData) {
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
        
        cascadingSelect(name, $multiselect);
        if (typeof displaySettings.displayFadeColor === "undefined" || 
            displaySettings.displayFadeColor === true || 
            displaySettings.displayFadeColor === "true") {
            colorIndent($multiselect, displaySettings.fadeColor);
        }

        if ((typeof displaySettings.indentPercent != "undefined" || displaySettings.indentPercent != "") && (displaySettings.displayFadeColor === true))
            spaceIndent.setInit($multiselect, displaySettings.indentPercent);
        else
            spaceIndent.setInit($multiselect, 1 / 6);

        if ((typeof displaySettings.textColor != "undefined" || displaySettings.textColor != "") && (displaySettings.displayFadeColor == true)) {
            textColor($multiselect, displaySettings.textColor);
        } else if ((displaySettings.displayFadeColor != true || displaySettings.textColor != "") && (displaySettings.darkDisplay === true)) {
            textColor($multiselect, "#a29fa8");
        } else if ((displaySettings.displayFadeColor != true || displaySettings.textColor != "") && (displaySettings.lightDisplay === true)) {
            textColor($multiselect, "#0d0916");
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
define('searching/fuzzySearch',['require', 'jquery', 'data_store/get', 'searching/searchHelper'],
    function (require, $, getData, searchHelper) {
    'use strict';

    var jquery = $;

    // This is not all my code, I used someone else's fuzzy searching algorithm, all credit goes to him
    // The source is https://github.com/mattyork/fuzzy/blob/master/lib/fuzzy.js

    var root = {};

    var fuzzy = {};

    // Use in node or in browser
    root.fuzzy = fuzzy;

    // If `pattern` matches `str`, wrap each matching character
    // in `opts.pre` and `opts.post`. If no match, return null
    fuzzy.match = function (pattern, str, opts, filterInterval) {
            opts = opts || {};
            var patternIdx = 0,
            result = [],
            len = str.length,
            totalScore = 0,
            currScore = 0,
            maxScore = Math.pow(2, pattern.length + 1) - pattern.length - 2,
            // prefix
            pre = opts.pre || '',
            // suffix
            post = opts.post || '',
            // String to compare against. This might be a lowercase version of the
            // raw string
            compareString = opts.caseSensitive && str || str.toString().toLowerCase(),
            ch;

        pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

        // For each character in the string, either add it to the result
        // or wrap in template if it's the next string in the pattern
        for (var idx = 0; idx < len && patternIdx < pattern.length; idx += 1) {
            ch = str[idx];
            if (compareString[idx] === pattern[patternIdx]) {
                ch = pre + ch + post;
                patternIdx += 1;

                // consecutive characters should increase the score more than linearly
                currScore += 1 + currScore;
            } else {
                currScore = 0;
            }

            totalScore += currScore;
            result[result.length] = ch;
            }

        // If the totalScore of the string (anywhere from 0 to 99; 100 is essentially text searching) is more than the
        // determined interval (filterInterval * maxScore), then show results with scores above that interval
        if (filterInterval * maxScore < totalScore) {
            return { rendered: result.join(''), score: totalScore };
        } else return null;
    };


    var fuzzySearch = function (data, str, isCaseSensitive, filterInterval) {
        searchHelper.searchByFunction(function (name, searchable) {
            return !str.trim() || 
                fuzzy.match(str, name, null, filterInterval) || 
                fuzzy.match(str, searchable, null, filterInterval);
        }, data, isCaseSensitive, filterInterval);
    };

    return function (multiName, $ele, settings) {
        var isCaseSensitive = settings.caseSensitive === true || settings.caseSensitive === "true";
        var filterInterval = settings.filterInterval;
        var timeout;
        $ele.find(".JSM-head .JSM-searchbar").on("change", function () {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                var data = getData.getDataByName(multiName);
                var str = $('.JSM-searchbar').val();
                if (!isCaseSensitive)
                    str = str.toLowerCase();
                fuzzySearch(data, str, isCaseSensitive, filterInterval);
            }, 200);

        });
    };
});

define('searching/plainTextSearch',['require', 'jquery', 'data_store/get', 'searching/searchHelper'],
    function (require, $, getData, searchHelper) {
    'use strict';
    
    var jquery = $;

    var plainTextSearch = function (data, str, isCaseSensitive) {
        searchHelper.searchByFunction(function (name, searchable) {
            return !str.trim() || 
            name != null && name.indexOf(str) > -1 || 
            searchable != null && searchable.indexOf(str) > -1;
        }, data, isCaseSensitive);
    };
    return function (multiName, $ele, settings) {
        var isCaseSensitive = settings.caseSensitive === true || settings.caseSensitive === "true";
        var timeout;
        $ele.find(".JSM-head .JSM-searchbar").on("keyup", function (e) {
            var valueChanged = false;

            if (e.type=='propertychange') {
                valueChanged = e.originalEvent.propertyName=='value';
            } else {
                valueChanged = true;
            }
            if (valueChanged) {
                /* Code goes here */
                var searchBar = this;
                window.clearTimeout(timeout);
                timeout = window.setTimeout(function () {
                    var data = getData.getDataByName(multiName);
                    var str = $(searchBar).val();
                    if (!isCaseSensitive)
                        str = str.toLowerCase();
                    plainTextSearch(data, str, isCaseSensitive);
                }, 200);
            }
        });
    };
});
define('searching/searching.config',['require',
        'data_store/get',
        'jquery', 
        'searching/fuzzySearch', 
        'searching/plainTextSearch'
    ], 
function(require, getData, $, fuzzySearch, textSearch) {
    'use strict';
    var jquery = $;

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler(name) {
        var $ele = getData.getElementByName(name);
        var searchSettings = getData.getSettingByName("search", name);


        // if there is no filterInterval defined in the search settings, default it to 0 for the purposes of the function
        if (searchSettings.filterInterval == null || searchSettings.filterInterval == '') {
            searchSettings.filterInterval = 0;
        } else if (searchSettings.filterInterval > 1) {
            searchSettings.filterInterval /= 100;
        }


        if ($ele == null) return;

        if (searchSettings.type == "fuzzy") {
            fuzzySearch(name, $ele, searchSettings, searchSettings.filterInterval);
        } else {
            textSearch(name, $ele, searchSettings);
        }
    }

    return handler;
});
define('data_output/flatArray',['require', 'jquery', 'data_store/get'], function(require, $, getData) { 
    'use strict';

    var jquery;
    jquery = $;

    function recursData(data) {
        var rv = [];
        for(var i in data) {
            if (data[i]['@isHeader']) {
                rv = rv.concat(recursData(data[i]['@children']));
            } else if(data[i]['@selected']) {
                rv.push({ 'name': data[i]['@name'], 'value': data[i]['@value'] });
            }
        }
        return rv;
    }

    function flatArrayOutput(multiselectName) {
        var data = getData.getDataByName(multiselectName);
        if (data == null || $.isEmptyObject(data)) {
            console.warn(
                "Tried to get output from " + 
                multiselectName + 
                " but data doesn't exist or multiselect not registered"
            );
            return null;
        }
        var element = getData.getElementByName(multiselectName);
        if (element == null) {
            console.warn(
                "Tried to get output from " + 
                multiselectName + 
                " but element isn't loaded"
            );
            return null;
        }
        return recursData(data);
    }

   return flatArrayOutput;
});
define('data_output/JSON',['require', 'jquery', 'data_store/get'], function(require, $, getData) { 
    'use strict';

    var jquery;
    jquery = $;

    function recursData(data) {
        var rv = {};
        for(var i in data) {
            if (data[i]['@isHeader']) {
                rv[data[i]['@name']] = recursData(data[i]['@children']);
            } else if(data[i]['@selected']) {
                rv[data[i]['@name']] = data[i]['@value'];
            }
        }
        return rv;
    }


    function outputJSON(multiselectName) {
        var data = getData.getDataByName(multiselectName);
        if (data == null || $.isEmptyObject(data)) {
            console.warn(
                "Tried to get output from " + 
                multiselectName + 
                " but data doesn't exist or multiselect not registered"
            );
            return null;
        }
        var element = getData.getElementByName(multiselectName);
        if (element == null) {
            console.warn(
                "Tried to get output from " + 
                multiselectName + 
                " but element isn't loaded"
            );
            return null;
        }
        return recursData(data);
    }

   return outputJSON;
});
define('data_output/interface',['require', 'consts', 'data_output/flatArray', 'data_output/JSON'],
function(require, CONSTS, flatArray, JSONoutput) { 
    'use strict';

    var rootObject = CONSTS.GET_ROOT_OBJECT_REF();

    rootObject['GetData'] = {
        flatArray: flatArray,
        JSON: JSONoutput
    };
});
define('data_output/selectionOutput',['require', 'jquery', 'data_store/get'], function (require) {
    'use strict';
    
    var $, jquery;
    jquery = $ = require('jquery');
    var get = require('data_store/get');


    function handler($multiselect, onSelect, onDeselect) 
    {
        if(onSelect != null || onDeselect != null)
        {
            $multiselect.on("change", ".JSM-list .JSM-checkbox", function() 
            {
                var $this = $(this);
                var name = $this.data("name");
                var value = $this.attr("value");
                if (name != null && value != null) {
                    var rv = { name: name, value: value }
                    if (this.checked) 
                    {
                        onSelect(rv);
                    } else 
                    {
                        onDeselect(rv);
                    }
                }
            });
        }
        else
        {
            console.warn("The notification function which you defined is null.");
        }
    }
    return handler;

});
define('data_output/data_output.config',['require',
        'data_store/get',
        'jquery', 
        'data_output/interface', 
        'data_output/selectionOutput', 
    ], 
function(require, getData, $, outInterface, selectionOut) {
    'use strict';
    var jquery = $;

    /**
     * Handles the style part of the multiselect, selecting the apprpriate styles
     * For each based upon optons/multiselect type
     * @param {jquery element} $multiselect the targeted multiselect
     */
    function handler($multiselect, name) {
        var outputSettings = getData.getSettingByName("output", name);

        if (outputSettings != null) {
            selectionOut($multiselect, outputSettings.onSelect, outputSettings.onDeselect);
        }
    }

    return handler;
});
define('utility/verifySettings',['require', 'jquery'], function (require, $) {
    'use strict';
    
    var jquery = $;

    /**
     * This function ensures we are getting proper settings for the multiselect
     * @param {Function} settingsFunction A function that returns the settings for the multiselect
     */
    function verifySettingsFunction(settingsFunction) {
        if (!$.isFunction(window[settingsFunction])) return null;
        var settings = window[settingsFunction]();
        return settings;
    }

    return verifySettingsFunction;
});
define('init',['require', 
        'jquery',  
        'data_input/load',
        'sort/sort.config',
        'display/display.config', 
        'style/style.config',
        'searching/searching.config',
        'data_output/data_output.config',
        'consts',
        'data_store/new',
        'utility/verifySettings'
    ], function(require, $, loadData, sortConfig,
        displayConfig, styleConfig, searchConfig, outputConfig) {
    'use strict';
    var jquery = $;
    var CONSTS = require("consts");
    var dataStoreNew = require('data_store/new');
    var verifySettings = require('utility/verifySettings');
    // for each multiselect on the screen
    $("." + CONSTS.MULTISELECTOR_ROOT_NAME()).each(function() {
        var $this = $(this);
        // get the data items from the list
        var loadType = $this.data('load-type'); // the type of data the developer is giving
        var loadFunction = $this.data('load'); // the function to call to get the data
        var settings = verifySettings($this.data('settings')); // the type of data the developer is giving
        var title = $this.data('title'); // the title of the multiselect, defaults to name if not set
        // parse the data from the above function
        var data = loadData.load(loadFunction, loadType);
        // set new data store for multiselect
        var name = dataStoreNew.newMultiselect(this, data, settings, title);
        // adds the output functions for ths multiselect
        outputConfig($this, name);
        // sorting the data in the multiselect
        sortConfig(name);
        // if we couldn't set a new data store, error here
        if (name == null) return;
        // display list and title
        displayConfig(name);
        // configure the searching
        searchConfig(name);
        // check those selected in the list
        styleConfig($this, name);
    });
});
define('data_input/interface',['require', 'jquery', 'data_store/new', "consts", 'data_input/load'],
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
(function() {
    'use strict';
    // set the rest of the options
    requirejs.config({
        paths: {
            "app": "../app",
            init: './init.config',
            consts: './consts.config',
            lib: '../lib',
            "jquery": './utility/getJquery',
            "utility": './utility',
            "logger": './utility/logger'
        }
    });
}());
// register onload event
(function() {
    'use strict';
    var onloadFunctions = [];
    if (window["JSMultiselect"] == null) 
        window["JSMultiselect"] = {};
    if (window["JSMultiselect"]["onload"] == null)
        window["JSMultiselect"]["onload"] = {};

    window["JSMultiselect"]["onload"]["isLoaded"] = false;
    window["JSMultiselect"]["onload"]["addCallback"] = function(func) {
        if (typeof func != "function") {
            console.warn("onload callback is not a function");
            return;
        } 
        onloadFunctions.push(func);
        if (window["JSMultiselect"]["onload"]["isLoaded"] == true) {
            func();
        }
    };
    window["JSMultiselect"]["onload"]["executeCallback"] = function() {
        for(var i = 0; i < onloadFunctions.length; i += 1) {
            if (typeof onloadFunctions[i] == "function") {
                onloadFunctions[i]();
            }
        }
    };

}());

requirejs(['jquery', 'init', 'data_input/interface', 'data_output/interface'], function ($) {
    'use strict';
    $(document).ready(function(){
        window["JSMultiselect"]["onload"]["isLoaded"] = true;
        window["JSMultiselect"]["onload"]["executeCallback"]();
    });
});

define("main", function(){});


require(["main"]);
}());