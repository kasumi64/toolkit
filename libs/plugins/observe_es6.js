/*
 * 观察者模式
 * @author: leiguangyao;
 * @date: 20190611-20190621;
 */
;define('observe', function (require, exports, module)
{
( function( global, factory ) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = factory();
	} else if ( typeof global === 'object' ) {
		global.$bingo = factory();
	} else {
		throw new Error( "plugin requires a Object." );
	}
}) ( typeof window !== "undefined" ? window : this, function(){
	"use strict";
	
	class BingoData { //observe
		
		constructor (that){
			Reflect.defineProperty(this, 'dictionary', {
				value: new Map(),
				enumerable: false
			});
			Reflect.defineProperty(this, 'that', {
				value: that,
				enumerable: false
			});
		}
		
		polyfill (target){
			if( !(target instanceof Object) ) return target;
			for (let k in target) {
				if(target[k] instanceof Object){
					target[k] = this.polyfill(target[k]);
				}
			}
			return this.proxy(target);
		}
		
		proxy(target){
			const self = this;
			return new Proxy(target, {
				set: function(obj, key, val, target){
					let old = obj[key];
					if(val instanceof Object) val = self.proxy(val);
					obj[key] = val;
					self.emint('update:'+key, val, old);
					return true;
				},
				get: function(obj, key, target){
					return obj[key]
				}
			});
		}
		
		on (master, fn/*, once */){
			if( !(fn instanceof Function) ) return this;
			if(!this.dictionary.has(master)) this.dictionary.set(master, new Set);
			let dict = this.dictionary.get(master);
			if(dict.has(fn)) return console.error(`type: ${master}./ Function is already registered.`);
			Reflect.defineProperty(fn, '$_once_', {
				value: arguments[2],
				enumerable: false,
				writable: false,
				configurable: false
			});
			dict.add(fn);
			return this;
		}
		
		emint (master, ...args){
			// console.log(master, args);
			if(!this.dictionary.has(master)) return this;
			const that = this.that;
			this.dictionary.get(master).forEach((fn, k, set) => {
				let arr = [...args];
				if(fn.$_once_ === true) set.delete(k);
				fn.call(that, ...arr);
			});
			return this;
		}
		
		once (master, fn){
			this.on(master, fn, true);
			return this;
		}
		
		clear(master, fn){
			if(fn instanceof Function){
				if(!this.dictionary.has(master)) return this;
				this.dictionary.get(master).forEach((fn, k, set) => {
					if(fn === fn) {
						set.delete(k);
						return this;
					}
				});
			} else if(master) this.dictionary.delete(master);
			else this.dictionary.clear();
			return this;
		}
		
	};
	return self => { return new BingoData(self); };
});

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
