/*
 * @author: leiguangyao;
 * @date: 20180104--20180119;
 */
(function(globals)
{
	//obj.isPrototypeOf(); 判断原型 //hasOwnProperty(obj.name); 自己的属性
	//Object.getPrototypeOf(obj); 获得实例的原型对象
	//Object.keys();  //Object.getOwnPropertyNames(); 所有的key
	//是否有原型对象的属性
	Object.addProto(Object.prototype, 'isProperty', function(nature){
		return !this.hasOwnProperty(nature) && nature in this;
	}, false, false);
	var nativePro = {};
	/*nativePro.inArray = function(obj) {
		var len = this.length, i;
		for(i=0; i<len && this[i]!==obj; i++){
			if(this[i] instanceof Array){
				if(this[i].inArray(obj)) return true;
			}
		};
		return !(i==len);
	};
	nativePro.each = function(fnt) {
		var len = this.length, i = 0 ,item;
		if(!(fnt instanceof Function) || len == 0) return;
		do{
			item = this[i];
			if(item instanceof Array){
				item.each(fnt);
			} else fnt.call(this, item, i);
		} while(++i < len);
		item = null;
	};*/
	//获得一个无空数组，生成新的副本。
	nativePro.noNull = function() {
	    if(this.length == 0) return null;
		var len = this.length, item,
			i = 0, arr = [];
		do{
			item = this[i];
			if(item instanceof Array){
				var temp = item.noNull();
				if(temp) arr.push(temp);
			} else if(item != void 0) arr.push(item);
		} while(++i < len);
		item = null;
		return arr;
	};
	/*排序{keys:val}*/
	nativePro.sorting = function(keys) {
		this.sort(function(val1, val2){
			val1 = typeof(val1)!="object" ? val1 : val1[keys];
			val2 = typeof(val2)!="object" ? val2 : val2[keys];
			return val1 < val2 ? -1 : 1;
		});
	};
	//数组不重复,不生成副本, 完美，速度慢
	nativePro.noRepeat = function () {
		var  i = 0, item, k;
		if(this.length == 0) return null;
		do{
			item = this[i];
			if(item instanceof Array){
				item.noRepeat();
			} else {
				k = i;
				while(++k < this.length){
					if(item === this[k]){
						this.splice(k, 1); k--;
					}
				}
			}
		} while(++i < this.length);
		item = null;
	};
	/*一维数组去重，生成一个新的副本，多个obj会被覆盖成一个obj*/
	nativePro.noSame = function() {
		var len = this.length, i,
		obj = {}, arr = [];
		for(i = 0; i<len; i++) obj[this[i]] = this[i];
		for(var sub in obj) arr.push(obj[sub]);
		return arr;
	};
	/*多维数组去重，生成一个新的副本,多个obj会被覆盖成一个obj*/
	nativePro.noDistinct = function() {
		function toObj(){
			var len = this.length, i, obj = {}, item;
			for(i = 0; i<len; i++){
				item = this[i];
				if(item instanceof Array){
					obj[item] = toObj.call(item);;
				} else obj[item] = item;
			}
			return obj;
		}
		function toArr(obj){
			var arr = [], item;
			for(var sub in obj){
				item = obj[sub];
				if(typeof(item)=="object"){
					arr.push(toArr(item));
				} else arr.push(item);
			}
			return arr;
		}
		return toArr(toObj.call(this));
	};
	if(!Array.prototype.indexOf){
		nativePro.indexOf = function(obj){
			var len = this.length, i;
			for (i = 0; i < len; i++) {
				if(this[i] === obj) return i;
			}
			return -1;
		};
	}
	Object.addForin(Array.prototype, nativePro, false, false);
	
	nativePro = {};
	/*保留几位小数*/
	nativePro.toFixNum = function(num) { return parseFloat(this.toFixed(num)); };
	//转成角度,1到100为0到360度
	nativePro.toAngle = function(isRadian) {
		if(!isRadian){
			var n = this % 100;
			if(this!=0&&n==0) n=100;
			return n * 360 / 100;
		} else return 180 / Math.PI * this;
	};
	//转成弧度
	nativePro.toRadian = function(isAngle) {
		if(!isAngle){
			return this.toAngle().toRadian(true);
		}else return Math.PI / 180 * this;
	};
	Object.addForin(Number.prototype, nativePro, false, false);
	
	nativePro = {};
	//计算一个数的立方根
	nativePro.cbrt = Math.cbrt || function(x) {
		var y = Math.pow(Math.abs(x), 1/3);
		return x < 0 ? -y : y;
	};
	//阶乘
	nativePro.factorial = function(num){
		if(num <= 1) return 1;
		else return num * arguments.callee(num - 1);
	};
	Object.addForin(Math, nativePro, false, false);
	
	nativePro = {};
	//是否以某个客串开头
	nativePro.startsWith = String.prototype.startsWith ||function(prefix) {
		return this.slice(0, prefix.length) === prefix;
	};
	//是否以某个客串结尾
	nativePro.endsWith = String.prototype.endsWith ||function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
	Object.addForin(String.prototype, nativePro, false, false);
	nativePro = null;
/******************************************************************************/
	var elPro = Element.prototype;
	//matchesSelector()方法接收一个CSS选择符参数，如果调用元素与该选择符相匹配，返回true；否则返回false
    elPro.matches = elPro.matchesSelector ||  elPro.webkitMatchesSelector ||
                    elPro.mozMatchesSelector ||  elPro.msMatchesSelector ||
                    elPro.oMatchesSelector;
    elPro = null;
}(this));
//TODO
define('main/utils', function (require, exports, module)
{
	var kit = require('main/kit'), ToolKit = exports;
	
	/**
	* Checks if an object could be an instantiable class.
	* @returns {boolean}
	*/
	ToolKit.isClass = function(fn){
		if (typeof fn !== "function") return false;
		if (fn.prototype === void 0) return false;
		if (fn.prototype.constructor !== fn) return false;
		//ES6
		var str = fn.toString();
		if (str.slice(0, 5) === "class") return true;
		if (str.slice(0, 5) === "async") return false;
		//有没有实例属性
		if (Object.getOwnPropertyNames(fn.prototype).length >= 2) return true;
		if (/this\./.test(str)) return true;
		//匿名函数
		if (fn.name === '') return false;
		if (/^function \(|^function anonymous/.test(str)) return false;
		return true;
	};
	
	//随机验证码verify
	ToolKit.randomCode = function(num){
		var s = '', len = parseInt(num), i;
		len = len > 0 ? len : 6;
		for (i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
		return s;
	};
	/**
	 * 把number轉成有位數符號的字符串。
	 * @param num: 一个数字。
	 * @return String 如"123,456"。
	 */
	ToolKit.numAddDot = function (num) {
		var flag = num < 0 ? true : false;
		num = Math.abs(num);
		var str = Math.floor(num).toString();
		var dotStr = '', len = str.length;
		for (var i = len - 1; i >= 0; i--) {
			dotStr = str.charAt(i) + dotStr;
			if ((len - i) % 3 == 0 && i > 0)
				dotStr = "," + dotStr;
		}
		if (flag) dotStr = "-" + dotStr;
		return dotStr;
	};
	/**
	 * 把轉成有位數符號的字符串的數字轉成number。
	 * @param str: 一个数字字符串,如"123,456"。
	 * @return number 如123456。
	 */
	ToolKit.numSubDot = function (str) {
		var arr = str.split(",");
		var num = 0, len = arr.length;
		for (var i = 0; i < len; i++) {
			num = parseInt(arr[i]) + num * 1000;
		}
		return num;
	};
	ToolKit.distance = function (p1, p2) {
		var a = Math.abs(p1.x - p2.x),
		b = Math.abs(p1.y - p2.y);
		return Math.sqrt(a*a+b*b);
	}
	/**
	 * 中文排序
	 * @param obj: 可是数组或字符串,或arguments;
	 */
	ToolKit.stringSort = function (obj) {
		var isStr = false;
		if(arguments.length > 1){
			obj = kit.toArray(arguments);
		} else {
			if(typeof(obj)=="string"){
				obj = obj.split('');
				isStr = true;
			}else if(!obj instanceof Array) return obj;
		}
		try{
			obj = obj.sort(function(a,b){
				return a.localeCompare(b);
			});
		}catch(e){console.warn('sort error!'); return obj;}
		return isStr ? obj.join('') : obj;
		
	};
	function _compile(code) {
	    var i, len = code.length, c = String.fromCharCode(code.charCodeAt(0) + len);
	    for(i = 1; i < len; i++) 
	        c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
		return c;
	}
	function _uncompile(code) {
		var i, len = code.length, c = String.fromCharCode(code.charCodeAt(0) - len);
	    for(i = 1; i < len; i++) 
	        c += String.fromCharCode(code.charCodeAt(i) - c.charCodeAt(i - 1));
	    return c;
	}
	var _storage = {
		set : function(val) {
			if(kit.isObject(val)) val = _toStr(val) + '^~Obj';
			else val += '^~Str';
			return _compile(_compile(val));
		}, get : function(val) {
			val = _uncompile(_uncompile(val)).split('^~', 2);
			if(val[1] == 'Obj') val[0] = _toJson(val[0]);
			return val[0]
		}, clear : function(stor, keys) {
			if(keys) stor.removeItem(keys);
			else stor.clear();
		}, keys : function(stor) {
			var i, len = stor.length, arr = [];
			for(i = 0; i < len; i++) arr.push(stor.key(i));
			return arr;
		}
	};
	ToolKit.setLStorage = function(keys, val) {
		localStorage.setItem(keys, _storage.set(val));
	};
	ToolKit.getLStorage = function(keys) {
		var val = localStorage.getItem(keys);
		return _storage.get(val);
	};
	ToolKit.clearLStorage = function(keys) {
		_storage.clear(localStorage, keys);
	};
	ToolKit.LStorageKey = function() {
		return _storage.keys(localStorage);
	};
	
	
	ToolKit.setSStorage = function(keys, val) {
		sessionStorage.setItem(keys, _storage.set(val));
	};
	ToolKit.getSStorage = function(keys) {
		var val = sessionStorage.getItem(keys);
		return _storage.get(val);
	};
	ToolKit.clearSStorage = function(keys) {
		_storage.clear(sessionStorage, keys);
	};
	ToolKit.SStorageKey = function() {
		return _storage.keys(sessionStorage);
	};
	/*获取input的字宽*/
	ToolKit.getChartWd = function (which) {
		if(!(which instanceof HTMLInputElement)) return 0;
	    var iCount = which.value.replace(/[^\u0000-\u00ff]/g,"aa");
		which.size = iCount.length + 2;
		return iCount.length;
	};
	/**中文转utf-8*/
	ToolKit.toUtf8 = function (str) {
	    var out = '', i, len = str.length, c;
	    for(i = 0; i < len; i++) {
	        c = str.charCodeAt(i);
	        if ((c >= 0x0001) && (c <= 0x007F)) {
	            out += str.charAt(i);
	        } else if (c > 0x07FF) {
	            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
	            out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
	            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
	        } else {
	            out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
	            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
	        }
	    }
	    return out;
	};
	/**utf-8转中文*/
	ToolKit.toUtf16 = function (str) {
	    var i = 0, len = str.length, c,
	    	out = '', char2, char3;
	    while(i < len) {
	    	c = str.charCodeAt(i++);
		    switch(c >> 4) {
		      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
		        // 0xxxxxxx
		        out += str.charAt(i-1); break;
		      case 12: case 13:
		        // 110x xxxx   10xx xxxx
		        char2 = str.charCodeAt(i++);
		        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
		        break;
		      case 14:
		        // 1110 xxxx  10xx xxxx  10xx xxxx
		        char2 = str.charCodeAt(i++);
		        char3 = str.charCodeAt(i++);
		        out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
		        break;
		    }
	    }
	    return out;
	};
	
	//将字符串转换成二进制形式，中间用空格隔开
	function strToBinary(str){
		if(typeof str != "string") str +=''; 
	    var result = [], len =str.length;
	    // var list = str.split("");
	    for(var i=0; i<len; i++){
	        if(i != 0){
	            result.push(" ");
	        }
			var item = str[i];
			console.log(item.charCodeAt())
	        var binaryStr = item.charCodeAt().toString(2);
	        result.push(binaryStr);
	    }   
	    return result.join("");
	}
	
	//将二进制字符串转换成Unicode字符串
	function binaryToStr(str){
	    var result = [];
	    var list = str.split(" ");
	    for(var i=0;i<list.length;i++){
	         var item = list[i];
	         var asciiCode = parseInt(item,2);
	         var charValue = String.fromCharCode(asciiCode);
	         result.push(charValue);
	    }
	    return result.join("");
	}
	
	
	return exports;
});
