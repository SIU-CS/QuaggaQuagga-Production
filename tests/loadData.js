var loadData = (function() {
    "use strict";

    var array = function() {
        var rv = [
            { // a header
                "name": "Item 1",
                "searchable": "search me",
                "selected": false,
                "image": "./quagga.jpg",
                "icon": "fa fa-chrome",
                "items": [
                    { // list of items 
                        "name": "Item 1.1",
                        "searchable": "search me",
                        "selected": false,
                        "value" : "1.1",
                        "icon": "fa fa-chrome"
                    },
                    { // item 1.2 is also a header 
                        "name": "Item 1.2",
                        "searchable": "search me",
                        "selected": false,
                        "items" : [            
                            {  // list of items for 1.2
                                "name": "Item 1.2.1",
                                "searchable": "search me",
                                "selected": true,
                                "value" : "1.2.1"
                            },
                            
                        ]
                    }
                ]
            },
            {
                "name": "Item 2",
                "searchable": "search me",
                "selected": false,  
                "value" : "2" 
            }
        ];
        return rv;
    };

    var CSV = function() {
        var rv = 
        '"h1", "2", "a b c", "false", "", "fa fa-truck"\n' + 
        '"h6", "2", "a b c", "false", "", "fa fa-truck"\n' +
        '"h1.h2", "5", "a b c", "true", "", "fa fa-truck"\n' +
        '"h1.h4", "5", "a b c", "false", "", "fa fa-truck"\n' +
        '"h1.h2.h3", "7", "a b c", "false", "./quagga.jpg", "fa fa-truck"\n';
        return rv;
    };

    // a test function
    var HTML = function() {
        var rv =
        '<ul>\n' +
        '    <li name="Item 1" searchable="search me">\n' +
        '    <img src="./quagga.jpg">\n' +
        '        <ul>\n' +
        '            <li name="Item 1.1" value="1.1" searchable="search me"><i class="fa fa-chrome"></i></li>\n' +
        '            <li name="Item 1.2" searchable="search me" data-icon="fa fa-chrome" selected>\n' +
        '                <ul>\n' +
        '                    <li name="Item 1.2.1" value="1.2.1" searchable="search me" data-img="./quagga.jpg"></li>\n' +
        '                </ul>\n' +
        '            </li>\n' +
        '        </ul>\n' +
        '    </li>\n' +
        '    <li name="Item 2" value="2" searchable="search me" data-img="./quagga.jpg">\n' + 
        '       <i class="fa fa-chrome"></i>\n' + 
        '    </li>\n' +
        '</ul>';
        return rv;
    };

    // a test function
    var JSON = function() {
        var rv = {
            "Item 1": {
                searchable: "value",
                "@selected": false,
                "@image": "./quagga.jpg",
                "@icon": "fa fa-chrome",
                selected: {
                    "image": "./quagga.jpg",
                    searchable: "value",
                    selected: false,
                    value: "1.1"
                },
                "Item 1.2": {
                    "@searchable": "value",
                    "@selected": false,
                    "@icon": "fa fa-chrome",
                    "Item 1.2.1": {
                        "icon": "fa fa-chrome",
                        searchable: "value",
                        selected: true,
                        value: "2.1"
                    }
                }
            },
            "Item 2": {
                "@searchable": "value",
                "@selected": false,
                "@icon": "",
                "value": "3"
            }
        };
        return rv;
    };

    var liveHTML = function() {
        var rv = HTML();
        rv = $.parseHTML(rv.trim());
        return rv;
    };

    var XML = function() {
        var rv =
        '<data>\n' +
        '     <item>\n' +
        '          <name>Item A</name>\n' +
        '          <searchable>Item 1</searchable>\n' +
        '          <selected>false</selected>\n' +
        '          <item>\n' +
        '                  <name>Item B</name>\n' +
        '                  <value>Item 1.1</value>\n' +
        '                  <searchable>Item 1.1</searchable>\n' +
        '                  <selected>false</selected>\n' +
        '                  <image>./quagga.jpg</image>\n' +
        '          </item>\n' +
        '          <item>\n' +
        '                  <name>Item C</name>\n' +
        '                  <searchable>Item 1.2</searchable>\n' +
        '                  <selected>true</selected>\n' +
        '                  <item>\n' +
        '                          <name>Item D</name>\n' +
        '                          <value>Item 1.2.1</value>\n' +
        '                          <searchable>Item 1.2.1</searchable>\n' +
        '                          <selected>false</selected>\n' +
        '                  </item>\n' +
        '          </item>\n' +
        '     </item>\n' +
        '     <item>\n' +
        '          <name>Item E</name>\n' +
        '          <value>Item 2</value>\n' +
        '          <searchable>Item 2</searchable>\n' +
        '          <selected>false</selected>\n' +
        '     </item>\n' +
        '</data>';
        return rv;
    };

    return {
        array: array,
        CSV: CSV,
        HTML: HTML,
        JSON: JSON,
        liveHTML: liveHTML,
        XML: XML
    };
}());