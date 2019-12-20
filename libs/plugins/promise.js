/**
 * ES5模仿Promise
 * @author: leiguangyao;
 * @date 20191209~~20191217;
 * @version: 1.0.2;
 */
;( function( global, factory ) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = factory();
	} else if ( typeof define === "function" ) {
		define('promise', factory);
	} else if ( typeof global === 'object' ) {
		global.$Promise = factory();
	} else {
		throw new Error( "plugin requires a Object." );
	}
}) ( window || this, function(require, exports, module){
	"use strict";
	function ProtectedObserver(){
		// if(!(this instanceof ProtectedObserver)) {
		// 	return new ProtectedObserver();
		// }
		this.dict = {};
	}
	var proto = ProtectedObserver.prototype;
	proto.on = function(type, fn){
		if(!this.dict[type]) this.dict[type] = [];
		this.dict[type].push(fn);
	};
	proto.emint = function(type){
		var arr = this.dict[type];
		if(!arr) return;
		var fn = arr.shift();
		while(fn){
			fn.apply(null, arguments);
			fn = arr.shift();
		};
		if(!arr.length) delete this.dict[type];
	}
	proto.clear = function(type){
		delete this.dict[type]
	};
	
	function EnsurePromise(executor) {
		var self = this;
		this.state = "pending"; //resolved  rejected
		this.value = null;
		this.obs = null;
		executor(resolve, reject);
		
		function resolve(result) {
			self.state = "then";
			dispatch(self, result);
		}
		
		function reject(reason) {
			self.state = "catch";
			dispatch(self, reason);
		}
	}
	
	function dispatch(self, val){
		self.value = val;
		if(self.obs) {
			self.obs.emint('waitExecute', val);
		}
		self.obs = null;
	}
	function waits(self, callback, reason){
		return new EnsurePromise(function(resolve, reject){
			if(self.state === 'pending'){
				if(!self.obs) self.obs = new ProtectedObserver();
				self.obs.on('waitExecute', function(type, value){
					execute(self.state, callback, reason, value, resolve, reject);
				});
			} else {
				execute(self.state, callback, reason, self.value, resolve, reject);
			}
		});
	}
	function execute(type, callback, reason, value, resolve, reject){
		var param, fn = type === 'then' ? callback : reason;
		if(fn instanceof Function) param = fn(value);
		else console.warn("Then's second parameter is not a function");
		if( param instanceof EnsurePromise){
			param.then(resolve, reject);
		} else resolve(param);
	}
	function isValid(success, fail){
		if(success instanceof Function){
			if(fail == null) return !0;
			if(!(fail instanceof Function)) return !1; 
		} else return !1; 
		return !0;
	}
	
	module.exports = EnsurePromise;
	var proto = EnsurePromise.prototype;
	
	proto.then = function(callback, reason){
		if(isValid(callback, reason)) return waits(this, callback, reason);
		else return console.warn('Then "param" is not a function!');
	};
	proto = null;
});
