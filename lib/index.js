/**
*
*     STREAM: moving median
*
*
*     DESCRIPTION:
*        - Transform stream factory to find sliding-window median values (moving median) over a numeric data stream.
*
*
*     NOTES:
*
*
*     TODO:
*
*
*     HISTORY:
*        - 2014/08/04: Created. [RJSmith]
*
*     DEPENDENCIES:
*        [1] through2
*
*     LICENSE:
*        MIT
*
*     COPYRIGHT (C) 2014. Rebekah Smith.
*
*
*     AUTHOR:
*        Rebekah Smith. rebekahjs17@gmail.com. 2014.
*
*/

(function() {
    'use strict';

    // MODULES //

    var through2 = require( 'through2' );

    // FUNCTIONS //

    /**
    * FUNCTION: getBuffer(W)
    *   Returns a buffer array pre-initialized to 0.
    * 
    * @private
    * @param {Number} W - buffer size
    * @returns {Array} buffer
    */
    function getBuffer(W) {
        var buffer = new Array(W);
        for (var i = 0; i < W; i++) {
            buffer[i] = 0;
        }
        return buffer;
    } // end FUNCTION getBuffer()

    /**
    * FUNCTION: compFunc(a,b)
    *   Finds difference between two numbers, used as compare function for sorting.
    * 
    * @private
    * @param {Number} a, b - numeric values in an array
    * @returns {Number} difference, sign used to sort a and b 
    */
    function compFunc(a,b) {
       return a-b;
    } // end FUNCTION compFunc() 

    /**
    * FUNCTION: findMedian(sArray)
    *   Finds the middle array element(s) and returns the median value
    *
    * @private
    * @param {Number} B - size of window buffer
    * @param {Array} sArray - sorted array containing window values
    * @returns {Number} median value
    */
    function findMedian(B, sArray) {
        var median = 0;
        
        if(B%2 === 0) {
            median = ( sArray[ B/2 ] + sArray[ (B/2) - 1 ] )/2;
        }
        else {
            median = sArray[ (B - 1)/2 ];
        }
        return median;
    } // end FUNCTION findMedian()


    /**
    * FUNCTION: onData(W)
    *   Returns a callback which calculates a moving median.
    *
    * @private
    * @param {Number} W - window size
    * @returns {Function} callback
    */
    function onData(W) {
        var buffer = getBuffer(W),  // first buffer, contains values in current window
            findMed = getBuffer(W), // second buffer, to be sorted
            full = false,
            median = 0,
            N = 0;

        /**
        * FUNCTION: onData(newVal, encoding, clbk)
        *   Data event handler. Calculates the moving median.
        *
        * @private
        * @param {Number} newVal - streamed data value
        * @param {String} encoding
        * @param {Function} clbk - callback to invoke after finding a median value. Function accepts two arguments: [ error, chunk ].
        */
        return function onData(newVal,  encoding, clbk) {
            // Fill buffers of size W and find initial median:
            if (!full) {
                buffer[N] = newVal;
                findMed[N] = newVal;

                N++;

                if (N===W) {
                    full = true;

                    // Sort copy of first buffer:
                    findMed.sort(compFunc);

                    // Get first median value:
                    median = findMedian(W, findMed);

                    this.push(median);
                }
                clbk();
                return;
            }

            // Update buffer: (drop old value, add new)
            buffer.shift();
            buffer.push(newVal);

            // Copy updated buffer
            findMed = buffer.slice();

            // Sort copy of buffer
            findMed.sort(compFunc);

            median = findMedian(W, findMed);

            clbk(null, median);

        }; // end FUNCTION onData()
    } // end FUNCTION onData()


    // STREAM //

    /**
    * FUNCTION: Stream()
    *  Stream constructor.
    *
    * @constructor
    * @returns {Stream} Stream instance
    */
    function Stream() {
        this._window = 5; //default window size
        return this;
    } // end FUNCTION Stream()


    /**
    * METHOD: window(value)
    *   Window size setter/getter. If a value is provided, sets the window size. If no value is provided, returns the window size.
    *
    * @param {Number} value - window size
    * @returns {Stream|Number} stream instance or window size
    */
    Stream.prototype.window = function(value) {
        if (!arguments.length) {
            return this._window;
        }
        if(typeof value !== 'number' || value !== value) {
            throw new Error('window()::invalid input argument. Window must be numeric.');
        }
            this._window = value;
        return this;
    }; // end METHOD window()


    /**
    * METHOD: stream()
    *   Returns a through stream which finds the sliding-window median.
    *
    * @returns {Object} through stream
    */
    Stream.prototype.stream = function(){
        return through2({'objectMode': true}, onData(this._window));
    }; // end METHOD stream()

    // EXPORTS //

    module.exports = function createStream() {
        return new Stream();
    };

})();