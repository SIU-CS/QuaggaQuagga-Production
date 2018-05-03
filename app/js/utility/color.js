define(function () {
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