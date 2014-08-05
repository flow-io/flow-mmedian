
// MODULES //

var chai = require('chai'),          // Expectation library
    utils = require('./utils'),      // Test utilities
    medStream = require('./../lib'); // Module to be tested

// VARIABLES //

var expect = chai.expect,
    assert = chai.assert;

// TESTS //

describe('moving median', function tests() {
    'use strict';

    // Test 1
    it('should export a factory function', function test() {
		expect(medStream).to.be.a('function');
    });

    // Test 2
    it('should provide a method to set/get the window size', function test() {
		var tStream = medStream();
		expect(tStream.window).to.be.a('function');
    });

    // Test 3
    it('should set the window size', function test() {
		var tStream = medStream();
		tStream.window(42);
		assert.strictEqual(tStream.window(),42);
    });

    // Test 4
    it('should not allow a non-numeric window size', function test() {
		var tStream = medStream();

		expect( badValue('5') ).to.throw(Error);
		expect( badValue([]) ).to.throw(Error);
		expect( badValue({}) ).to.throw(Error);
		expect( badValue(null) ).to.throw(Error);
		expect( badValue(undefined) ).to.throw(Error);
		expect( badValue(NaN) ).to.throw(Error);
		expect( badValue(false) ).to.throw(Error);
		expect( badValue(function(){}) ).to.throw(Error);

		function badValue(value) {
			return function() {
				tStream.window(value);
			};
		}
    }); //end non-numeric window

    // Test 5
    it('should find the median value of the data in the window', function test(done) {
		var data, expected, tStream, WINDOW = 5;

		// Simulate some data
		data = [19,24,3,67,84,26,74,23,26,15,98,75];

		// Expected values of median in moving window
		expected = [24,26,67,67,26,26,26,26];

		// Create a new median stream
		tStream = medStream()
			.window(WINDOW)
			.stream();

		// Mock reading from the stream
		utils.readStream(tStream,onRead);

		// Mock piping to the stream
		utils.writeStream(data,tStream);

		return;

		/**
		 * FUNCTION: onRead(error, actual)
		 * Read event handler. Checks for errors. Compares streamed and expected data.
		 */
		function onRead(error,actual) {
			expect(error).to.not.exist;

			assert.lengthOf(actual,data.length-WINDOW+1);

			for ( var i = 0; i < expected.length; i++ ) {
				assert.strictEqual( actual[i], expected[i] );
			}

			done();

		} // end FUNCTION onRead
    });

    // Test 6
    it('should calculate the median of piped data using an arbitrary window size', function test(done) {
		var data, expected, tStream, WINDOW = 6;

		// Simulate some data
		data = [75,34,14,56,97,85,15,24,37,56,85,35];

		// Expected values of median in moving window
		expected = [65.5,45,40,46.5,46.5,46.5,36];

		// Create a new median stream
		tStream = medStream()
			.window(WINDOW)
			.stream();

		// Mock reading from the stream
		utils.readStream(tStream,onRead);

		// Mock piping to the stream
		utils.writeStream(data,tStream);

		return;

		/**
		* FUNCTION: onRead(error, actual)
		* Read event handler. Check for errors. Compare streamed and expected data.
		*/
		function onRead(error,actual) {
			expect(error).to.not.exist;

			assert.lengthOf(actual,data.length-WINDOW+1);

			for ( var i = 0; i < expected.length; i++ ) {
				assert.strictEqual( actual[i], expected[i] );
			}

			done();
		} // end FUNCTION onRead()
	});

}); //end test descriptions

