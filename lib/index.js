/**
*
*     STREAM: moving median - method 2
*
*
*     DESCRIPTION:
*        - Transform stream factory to find sliding-window median values (moving median) over a numeric data stream.
*
*
*     NOTES: Method 2: Sorts first buffer, then with arrival of a new value, drops the oldest value and places the new value into the sorted buffer.
*
*
*     TODO: Add extra tests for buffer sizes and newVal placements.
*
*
*     HISTORY:
*        - 2014/08/17: Created. [RJSmith]
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
    function getArray(W) {
        var myArray = new Array(W);
        for (var i = 0; i < W; i++) {
            myArray[i] = { streamVal:0 , pos:0 };
        }
        return myArray;
    } // end FUNCTION getBuffer()

    /**
    * FUNCTION: onData(W)
    *   Returns a callback which calculates a moving median.
    *
    * @private
    * @param {Number} W - window size
    * @returns {Function} callback
    */
    function onData(W) {

        var buffer = getArray(W),
            full = false,
            median = 0,
            N = 0,
            minIndex = 0,
            maxIndex = 0,
            tIndex = 0,
            tElement = 0,
            rIndex = 0;

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
            // Fill buffer of size W and find initial median:
            if (!full) {
                buffer[N].streamVal = newVal;
                buffer[N].pos = N;

                /* console.log("buffer[N].streamVal = " + buffer[N].streamVal);
                console.log("buffer[N].pos = " + buffer[N].pos);
                */

                N++;

                if (N===W) {
                    full = true;

                    // sort first full buffer according to streamVal
                    buffer.sort(function(a, b) {
                        return a.streamVal - b.streamVal;
                    });

                    // find first median
        			if(W%2 === 0) {
            			median = ( buffer[W/2].streamVal + buffer[(W/2)-1].streamVal )/2;
        			}
        			else {
            			median = buffer[(W - 1)/2].streamVal;
        			}

                    this.push(median);
                }

                clbk();
                return;
            }

            //console.log("After initial sort");
            for (var i = 0; i < W; i++) {
                /* console.log("buffer[].streamVal = " + buffer[i].streamVal);
                console.log("buffer[].pos = " + buffer[i].pos);
                */
            }

            // Update buffer: (drop oldest value in window)
            for (var i = 0; i < W; i++) {
            	if (buffer[i].pos  === (N-W)) {
            		buffer.splice(i,1);
                    break;
            	}
            }
			// buffer currently has W-1 elements

            // Update buffer: (insert newVal into sorted buffer)
            // re-initialise variables used to find position of newest value
			minIndex = 0;
			maxIndex = buffer.length - 1; // (W-2) 
			tIndex = 0;
			tElement = 0;
			rIndex = 0;

			while (minIndex <= maxIndex) {

				tIndex = Math.floor( (minIndex + maxIndex) / 2 );
				tElement = buffer[tIndex].streamVal;

				if (tElement === newVal) { // find equal value, can insert after
					rIndex = tIndex;
					break;
				}
				else if (tElement < newVal) {
					minIndex = tIndex + 1;
				}
				else if (tElement > newVal) {
					maxIndex = tIndex - 1;
				}

				rIndex = maxIndex;

			}

			var newObj = {streamVal:newVal, pos:N};
			buffer.splice(rIndex+1, 0, newObj);
			// buffer has W elements

			// find median
			if(W%2 === 0) {
            	median = ( buffer[W/2].streamVal + buffer[(W/2)-1].streamVal )/2;
        	}
        	else {
            	median = buffer[(W - 1)/2].streamVal;
        	}

			N++;

            clbk(null, median);

        }; // end FUNCTION onData()
    } // end FUNCTION onData()


    /**
    * FUNCTION: onEnd(W)
    *   Get time at end of new value stream
    */
    /*
    function onEnd() {
        var timeEnd = new Date().getTime();
        console.log("Time at end is: " + timeEnd);
    }
    */

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