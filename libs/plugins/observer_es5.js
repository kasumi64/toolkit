/*
 * 观察者模式
 * @author: leiguangyao;
 * @date: 20170706-20200410;
 */
;define('observer_es5', function (require, exports)
{
	function Observer()
	{
		if(arguments[0] !== '6KeC5a+f6ICF'){
			throw new Error('Observer is a single, Please use "getInstance()" method.');
			return;
		}
		var dictionary = {}, onceDict = {};
		
		function bingo(master, fn, dict){
			if(!(typeof master == 'string'&&fn instanceof Function)) return false;
			if(!dict[master]) dict[master] = [];
			if(isHas(fn, dict[master])) return false;
			return true;
		}
		function isHas(fn, arr){
			var i, len = arr.length;
			for(i=0; i<len && arr[i]!==fn; i++);
			return !(i==len);
		}
		//绑定
		this.on = function(master, fn)
		{
			if(!bingo(master, fn, dictionary)) return this;
			dictionary[master].push(fn);
			return this;
		};
		//解绑
		this.del = function(master, fn)
		{
			var keyCode = dictionary[master];
			if(keyCode == null) return this;
			var index = keyCode.indexOf(fn);
			if(index == -1) return this;
			keyCode.splice(index, 1);
			return this;
		};
		//执行回调，第一个入参为主码(必须的)，其它的为子码。
		this.emint = function(master/*,[...args]*/)
		{
			var dict = dictionary[master], i, len;
			if( dict ){
				len = dict.length;
				for (i = 0; i < len; i++)
					dict[i].apply(null, arguments);
			}
			
			dict = onceDict[master];
			if( dict ){
				len = dict.length;
				for (i = 0; i < len; i++)
					dict[i].apply(null, arguments);
				delete onceDict[master];
			}
			return this;
		};
		this.once = function(master, fn)
		{
			if(!bingo(master, fn, onceDict)) return this;
			onceDict[master].push(fn);
			return this;
		};
		//清除master主码
		this.clear = function(master) { delete dictionary[master]; return this; };
	}
	var instance; //单例
	function getInstance(){
		if(instance == void 0) instance = new Observer('6KeC5a+f6ICF');
		return instance;
	}
	return getInstance();
});

if (!Array.prototype.indexOf) {
	/**
	 * @param {Object} searchElement 要查找的元素
	 * @param {Object} fromIndex 可选, 开始查找的位置。
	 */
	Array.prototype.indexOf = function(searchElement, fromIndex) {
		var k;
		if (this == null) {
			throw new TypeError('"this" is null or not defined');
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if (len === 0) {
			return -1;
		}
		var n = +fromIndex || 0;
		if (Math.abs(n) === Infinity) {
			n = 0;
		}
		if (n >= len) {
			return -1;
		}
		k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
		while (k < len) {
			if (k in O && O[k] === searchElement) {
				return k;
			}
			k++;
		}
		return -1;
	};
}

if (!Array.prototype.map) {
	/**
	 * @param {Object} callback 生成新数组元素的函数，使用三个参数：
			currentValue callback 数组中正在处理的当前元素。
			index可选 callback 数组中正在处理的当前元素的索引。
			array可选 map 方法调用的数组。
	 * @param {Object} thisArg 可选,执行 callback 函数时值被用作this。
	 */
	Array.prototype.map = function(callback, thisArg) {
		var T, A, k;
		if (this == null) {
			throw new TypeError(" this is null or not defined");
		}
		var O = Object(this);
		var len = O.length >>> 0;
		if (typeof callback !== 'function') {
			throw new TypeError(callback + " is not a function");
		}
		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (thisArg) {
			T = thisArg;
		}
		A = new Array(len);
		k = 0;
		while (k < len) {
			var kValue, mappedValue;
			if (k in O) {
				kValue = O[k];
				mappedValue = callback.call(T, kValue, k, O);
				A[k] = mappedValue;
			}
			k++;
		}
		return A;
	};
}
