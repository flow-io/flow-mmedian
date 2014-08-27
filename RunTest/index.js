var timeSt = new Date().getTime();
console.log("Time at start is: " + timeSt);

var eventStream = require('event-stream'),
	medStream = require('./../lib'),
	seedrandom = require('seedrandom');

var prng = seedrandom('hello.')

// Create an array containing random numbers:
var randoms = new Array( 1000999 );
for (var i = 0; i < randoms.length; i++) {
    randoms[i] = Math.round(prng() * 100);
}

// check randoms
/*
for (var i = 0; i < 100; i++) {
    console.log(randoms[i]);
}
*/

// Create a readable stream from an array:
var randStream = eventStream.readArray(randoms);

// Create a new moving-median stream:
var myStream = medStream()
	.window(1000)
	.stream();

function printEnd() {
	console.log("\nStart time was: " + timeSt );
	var timeEnd = new Date().getTime();
	console.log("End time is: " + timeEnd);
	console.log("Time taken: " + (timeEnd - timeSt) );
}

setTimeout(printEnd, 0);

// Pipe the data:
randStream.pipe(myStream)
    .pipe(eventStream.map(function(d,clbk){
		clbk(null,d.toString());
    }))
	.pipe(process.stdout);

