'use strict';

//var fs = require('fs');
//var input = fs.readFileSync('/dev/stdin', {'encoding': 'utf8'});
//process.argv[2]
//process.stdout.write(output + "\n"); // TODO utf8?

var BILLION = 1000000000,
    HUNDRED_MILLION = 100000000,
    TEN_MILLION = 10000000;

/*
console.log('starting');
//counter(1000000000, 10000000);
setInterval(function() {counter(HUNDRED_MILLION, TEN_MILLION, 'a');}, 10);
setInterval(function() {counter(HUNDRED_MILLION, TEN_MILLION, 'b');}, 10);
setInterval(function() {counter(HUNDRED_MILLION, TEN_MILLION, 'c');}, 10);
setInterval(function() {counter(HUNDRED_MILLION, TEN_MILLION, 'd');}, 10);
console.log('done');
*/

function counter(max, logInterval, decoration) {
	for (var i = 0; i < max; i++) {
		if (i % logInterval === 0) {
			console.log('progress: ' + i / max + ' for ' + decoration);
		}
	}
}

var PROMISE_STATES = {
    "ready"	   : 1,
    "executing": 1,
    "succeeded": 1,
    "failed"   : 1
};

function Promise(f) {
    this.f = f;
    this.state = "ready";
    this.thens = [];
    this.fails = [];
    this.error = undefined;
}

Promise.prototype.isDone = function() {
    return (this.state === "succeeded") || (this.state === "failed");
};

Promise.prototype.addThen = function(g) {
    if (this.state !== "ready") {
        throw new Error("Promise state must be 'ready' in order to add a 'Then'");
    }
    this.thens.push(g);
};

Promise.prototype.addFail = function(h) {
    if (this.state !== "ready") {
        throw new Error("Promise state must be 'ready' in order to add a 'Fail'");
    }
    this.fails.push(h);
};

Promise.prototype.log = function(str) {
    console.log('in Promise ' + this.name + ': ' + str);
};

Promise.prototype.execute = function() {
    if (this.state !== "ready") {
    	throw new Error("Promise must be in 'ready' state in order to start executing");
    }
    this.log('executing');
    this.state = "executing";
    var args = Array.prototype.slice.call(arguments, 0);
    try {
        this.value = this.f.apply(null, args);
        this.state = "succeeded";
        this.log("succeeded");
        var self = this;
        this.thens.forEach(function(t) {
            self.log("going ...");
            t.execute(self.value);
        });
    } catch (e) {
        this.error = e;
        this.state = "failed";
        var self = this;
        this.fails.forEach(function(fail) {
            fail.execute(self.error);
        });
    }
    this.log('state: ' + this.state + ' ' + this.error);
};


var p1 = new Promise(function() {counter(HUNDRED_MILLION, TEN_MILLION, '1')}),
    p2 = new Promise(function() {counter(HUNDRED_MILLION, TEN_MILLION, '2')}),
    p3 = new Promise(function() {counter(HUNDRED_MILLION, TEN_MILLION, '3')}),
    p4 = new Promise(function() {counter(HUNDRED_MILLION, TEN_MILLION, '4')});

p1.name = 'p1';
p2.name = 'p2';
p3.name = 'p3';
p4.name = 'p4';

p1.addThen(p2);
p1.addThen(p3);
p2.addThen(p4);
console.log('starting');
p1.execute();
console.log('done');
