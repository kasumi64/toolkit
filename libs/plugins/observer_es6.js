/*
 * 观察者模式observe
 * @author: leiguangyao;
 * @date: 20190611-20200421;
 */
;( function( global, factory ) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = factory();
	} else if ( typeof define === "function" ) {
		define('bus_es6', factory);
	} else if ( typeof global === 'object' ) {
		global.$bingo = factory();
	} else {
		throw new Error( "plugin requires a Object." );
	}
}) ( window || this, function(){
	"use strict";
	
	function i18nVal(keys, obj){
		var arr = keys.split('.'), len = arr.length, val;
		for (let i = 0; i < len; i++) {
			val = obj[arr[i]];
			if(val == null) return '';
		}
		return val;
	}
	
	class Bus { //observe
		
		constructor (that){
			Reflect.defineProperty(this, '_dictionary', {
				value: new Map(),
				enumerable: false
			});
			Reflect.defineProperty(this, '_onceDict', {
				value: new Map(),
				enumerable: false
			});
			Reflect.defineProperty(this, 'that', {
				value: that,
				enumerable: false
			});
		}
		
		polyfill (target, type, _key){ //递归所有属性
			if( !(target instanceof Object) ) return target;
			for (let k in target) {
				if(target[k] instanceof Object){
					if(_key) _key += '.' + k;
					else _key = k;
					console.log(k);
					target[k] = this.polyfill(target[k], type, _key);
				}
			}
			return this.proxy(target, type, _key);
		}
		
		proxy(target, type, _keys){
			// const self = this;
			return new Proxy(target, {
				set: (obj, key, val, receiver) => {
					let old = obj[key]; //旧数据
					if(val === old) return;
					if(val instanceof Object) val = this.proxy(val);//监听新对像
					obj[key] = val; //新数据
					if(_keys) _keys += '.' + key;
					this.emit(type||'update:', key, val, old, _keys);
				},
				get: function(obj, key, receiver){
					let val = obj[key];
					if(typeof(val)=="function") val = val.bind(obj);
					return val;
				}
			});
		}
		
		_bingo(master, fn, dict){
			if(!(fn instanceof Function)) return false;
			if(!dict.has(master)) dict.set(master, new Set);
			if(dict.get(master).has(fn)) return console.warn(`type: ${master}./ Function is already registered.`);
			return true;
		}
		
		on (master, fn){
			if(!this._bingo(master, fn, this._dictionary)) return this;
			this._dictionary.get(master).add(fn);
			return this;
		}
		
		emit (master, ...args){
			// console.log(master, args);
			const that = this.that;
			if(this._dictionary.has(master)){
				this._dictionary.get(master).forEach(fn => {
					fn.apply(that, args);
				});
			}
			if(this._onceDict.has(master)){
				this._onceDict.get(master).forEach(fn => {
					fn.apply(that, args);
				});
				this._onceDict.delete(master);
			}
			return this;
		}
		
		once (master, fn){
			if(!this._bingo(master, fn, this._onceDict)) return this;
			this._onceDict.get(master).add(fn);
			return this;
		}
		
		clear (master, fn){
			if(fn instanceof Function){
				if(this._dictionary.has(master)) {
					this._dictionary.get(master).delete(fn);
				}
				if(this._onceDict.has(master)) {
					this._onceDict.get(master).delete(fn);
				}
			} else if (master) {
				this._dictionary.delete(master);
				this._onceDict.delete(master);
			} else {
				this._dictionary.clear();
				this._onceDict.clear();
			}
			return this;
		}
		
		static getInstance(){
			return single;
		}
	};
	const single = new Bus();
	// Bus.getInstance = function(){return single;};
	return {
		bus: self => { return new Bus(self); },
		single: () => Bus.getInstance()
	}
});

/*
get(target, propKey, receiver)：拦截对象属性的读取，比如proxy.foo和proxy['foo']。
set(target, propKey, value, receiver)：拦截对象属性的设置，比如proxy.foo = v或proxy['foo'] = v，返回一个布尔值。
has(target, propKey)：拦截propKey in proxy的操作，返回一个布尔值。
deleteProperty(target, propKey)：拦截delete proxy[propKey]的操作，返回一个布尔值。
ownKeys(target)：拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、
	for...in循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而Object.keys()的返回结果仅包括目标对象自身的可遍历属性。
getOwnPropertyDescriptor(target, propKey)：拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。
defineProperty(target, propKey, propDesc)：拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值。
preventExtensions(target)：拦截Object.preventExtensions(proxy)，返回一个布尔值。
getPrototypeOf(target)：拦截Object.getPrototypeOf(proxy)，返回一个对象。
isExtensible(target)：拦截Object.isExtensible(proxy)，返回一个布尔值。
setPrototypeOf(target, proto)：拦截Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)。
construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args)。
*/
