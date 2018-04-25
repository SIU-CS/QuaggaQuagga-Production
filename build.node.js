(function() {
    'use strict';
    const hound = require("./lib/node-hound");
    const { spawn, exec } = require('child_process');

    /*
     * Watch JavaScript files
     */

    var jsWatcher = hound.watch('./app/js');

    var compileJSFiles = function(callback) {
        var compileJS = spawn('node', ['./r.js', '-o', 'require.build.js']);
        console.log('\n------------------- Start compiling RequireJS -------------------');

        compileJS.stdout.on('data', function(data) {
            console.log('stdout:' + data);
        });

        compileJS.stderr.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        compileJS.on('close', function(code) {
            console.log('------------------- Stop compiling RequireJS -------------------');
            if (callback != null) callback();
        });
    };

    jsWatcher.on('create', function(file, stats) {
        file = file.replace("\\", "/");
        console.log('------------------- ' + file.replace("\\", "/") + ' was created -------------------');
        compileJSFiles();
    });
    jsWatcher.on('change', function(file, stats) {
        file = file.replace("\\", "/");
        console.log('------------------- ' + file.replace("\\", "/") + ' was changed -------------------');
        compileJSFiles();
    });
    jsWatcher.on('delete', function(file) {
        file = file.replace("\\", "/");
        console.log('------------------- ' + file.replace("\\", "/") + ' was deleted -------------------');
        compileJSFiles();
    });

    /*
     * Watch less files
     */

    var lessWatcher = hound.watch('./app/style');

    var compileLESSFiles = function(callback) {
        console.log('\n------------------- Start compiling LESS -------------------');
        exec('lessc ./app/style/main.less ./dist/main.css', (error, stdout, stderr) => {
            if (error) {
              console.error('exec error: ' + error);
              return;
            }
            if (stdout.trim())
                console.log('stdout:' + stdout);
            if (stderr.trim())
                console.log('stderr: ' + stderr);
            console.log('------------------- Stop compiling LESS -------------------');
            if (callback != null) callback();
          });
    };

    lessWatcher.on('create', function(file, stats) {
        file = file.replace("\\", "/");
        console.log('------------------- ' + file.replace("\\", "/") + ' was created -------------------');
        compileLESSFiles();
    });
    lessWatcher.on('change', function(file, stats) {
        file = file.replace("\\", "/");
        console.log('------------------- ' + file.replace("\\", "/") + ' was changed -------------------');
        compileLESSFiles();
    });
    lessWatcher.on('delete', function(file) {
        file = file.replace("\\", "/");
        console.log('------------------- ' + file.replace("\\", "/") + ' was deleted -------------------');
        compileLESSFiles();
    });


    // init
    (function() {
        compileJSFiles(function() {
            compileLESSFiles();
        });
    }());

}());
