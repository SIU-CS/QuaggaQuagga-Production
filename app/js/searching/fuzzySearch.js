define(['require', 'jquery', 'data_store/get', 'searching/searchHelper'],
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
            return !str.trim() || fuzzy.match(str, name, null, filterInterval) || fuzzy.match(str, searchable, null, filterInterval);
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
