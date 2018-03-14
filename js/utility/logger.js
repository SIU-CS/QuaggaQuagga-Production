'use strict';

define(['require'], function (require) {
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
    // main function
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
        log: function(msg, trace) { main(msg, LOG, trace) },
        warn: function(msg, trace) { main(msg, WARN, trace) },
        error: function(msg, trace) { main(msg, ERROR, trace) },
        info: function(msg, trace) { main(msg, INFO, trace) }
    }
});