/*
 * @author: leiguangyao;
 * @date: 20160523--20180807;
 */
;(function(doc){ //20180712
	'use strict';
	/**
	 * @description 把类的成员，或属性设置为是否可枚举，只读。
	 * @param  {Object} target         目标对像
	 * @param  {String} keys           属性名，或函数名
	 * @param  {[type]} methods        属性值，或函数体，无用null
	 * @param  {Boolean} writable      能否修改属性，默认true。
	 * @param  {Boolean} enumerable    能否用for-in枚举，默认true。
	 * @param  {Boolean} configurable  是否能通过delete删除属性，默认true。
	 */
	var setProto = function (){
		return (doc.createEvent === void 0) ? function(target, keys, methods){
			target[keys] = methods;
			return target;
		} : function (target, keys, methods, enumerable, writable, configurable){
			var obj;
			if(!methods||!(methods.get||methods.set)){
				obj = {value: methods};
				obj.writable = writable === false ? false : true;
			} else obj = methods;
			obj.enumerable = enumerable === false ? false : true;
			obj.configurable = configurable === false ? false : true;
			Object.defineProperty(target, keys, obj);
			return target;
		};
	}();
	var nativePro = {};
	nativePro.addProto = setProto;
	nativePro.addForin = function(target, methods, enumerable, writable, configurable){
		for(var keys in methods) this.addProto(target, keys, methods[keys], enumerable, writable, configurable);
		return target;
	};
	nativePro.getSet = function(target, keys, methods, enumerable, configurable){
		if(typeof(methods)=="function")
			methods = methods.length > 0 ? {set: methods} : {get: methods};
		this.addProto(target, keys, methods, enumerable, 'getset', configurable);
		return target;
	};
	nativePro.inObject = function(target, obj, key){
		if(!(obj&&obj.constructor.name=='Object') || target==void 0) return false;
		var tar = target[key] || target, o, k;
		if(key){
			o = obj[key];
			if(tar === o) return true;
			for(k in obj){
				o = obj[k];
				if(o && o.constructor.name == 'Object'){
					if(Object.inObject(tar, o, key)) return true;
				}
			}
		} else {
			for(k in obj){
				o = obj[k];
				if(o && o.constructor.name == 'Object'){
					if(Object.inObject(tar, o)) return true;
				} else if(tar === o) return true;
			}
		}
		return false;
	};
	nativePro.addForin(Object, nativePro, false, false, false);
	nativePro = {};
	nativePro.inArray = function(obj, key) {
		var len = this.length, i, o;
		obj = obj[key] || obj;
		if(key){
			for(i = 0; i < len; i++) {
				o = this[i];
				if(obj === o) return true;
				if(Object.inObject(obj, o, key)) return true;
				if(o instanceof Array) {
					if(o.inArray(obj, key)) return true;
				}
			};
			return !(i == len);
		} else {
			for(i=0; i<len && this[i]!==obj; i++){
				if(this[i] instanceof Array){
					if(this[i].inArray(obj)) return true;
				}
			};
			return !(i==len);
		}
	};
	/*nativePro.inArray = function(obj) {
		var len = this.length, i;
		for(i=0; i<len && this[i]!==obj; i++);
		return !(i==len);
	};*/
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
	};
	Object.addForin(Array.prototype, nativePro, false, false);
	nativePro = {};
	/*保留几位小数*/
	nativePro.toFixNum = function(num) { return parseFloat(this.toFixed(num)); };
	Object.addForin(Number.prototype, nativePro, false, false);
	setProto = nativePro = null;
}(document));
(function(win, doc) { //TODO //20180202
	'use strict';
	var evtPro = win.EventTarget || win.Node || win.Element;
	evtPro = evtPro.prototype;
	
	evtPro.getEventListeners = function(a) {
		if (!this.eventListenerList) this.eventListenerList = {};
		if (a == undefined) return this.eventListenerList;
		return this.eventListenerList[a];
	};
	evtPro.clearEventListeners = function(a) {
		if (!this.eventListenerList) this.eventListenerList = {};
		if (a == undefined) {
			var evtList = this.getEventListeners();
			for (var x in evtList) this.clearEventListeners(x);
			return;
		}
		var el = this.getEventListeners(a);
		if (el == undefined) return;
		for (var i = el.length - 1; i >= 0; --i) {
			var ev = el[i];if(!ev) continue;
			this.removeEventListener(a, ev.listener, ev.useCapture);
		}
	};
	
	function IE8Event(evt){
		var fn, i, l, e = evt || win.event;
		e.target = e.srcElement; e.currentTarget = this;
		var fn = this.getEventListeners(e.type);
		if (fn == undefined) return;
		for (i = 0, l = fn.length; i < l; ++i) {
			fn[i].listener.call(this, e);
			if(l > fn.length){ --i; l = fn.length; }
		}
	} //this.attachEvent('on'+a, b);
	if(typeof(evtPro.addEventListener)!=="function"){
		evtPro.addEventListener = function(a){ this['on' + a] = IE8Event; };
		evtPro.removeEventListener = function(){ /*this.detachEvent('on'+a, b);*/ };
		win.addEventListener = doc.addEventListener = evtPro.addEventListener;
		win.removeEventListener = doc.removeEventListener = evtPro.removeEventListener;
		win.getEventListeners = doc.getEventListeners = evtPro.getEventListeners;
		win.clearEventListeners = doc.clearEventListeners = evtPro.clearEventListeners;
		StaticNodeList.prototype.toString = function(){ return '[object StaticNodeList]'; };
		win.getComputedStyle = function(el){ return el.currentStyle; };
		Object.prototype.constructor.name = 'Object';
	}
	var eve = {_addEventListener: evtPro.addEventListener, _removeEventListener: evtPro.removeEventListener};
	Object.addForin(evtPro, eve, false, false);
	evtPro.addEventListener = function(a, b, c) {
		if (c == undefined) c = false;
		this._addEventListener(a, b, c);
		if (!this.eventListenerList) this.eventListenerList = {};
		if (!this.eventListenerList[a]) this.eventListenerList[a] = [];
		var EA = this.eventListenerList[a], i, l = EA.length;
		for(i = 0; i < l; i++){ if(EA[i].listener === b) break; }
		if(i==l) EA.push( {listener: b, useCapture: c} );
	};
	evtPro.removeEventListener = function(a, b, c) {
		if (c == undefined) c = false;
		this._removeEventListener(a, b, c);
		if (!this.eventListenerList) this.eventListenerList = {};
		if (!this.eventListenerList[a]) this.eventListenerList[a] = [];
		// find the event in the list
		for (var i = 0; i < this.eventListenerList[a].length; i++) {
			if (this.eventListenerList[a][i].listener == b && this.eventListenerList[a][i].useCapture == c) {
				this.eventListenerList[a].splice(i, 1);
				break;
			}
		}
		if (this.eventListenerList[a].length == 0) delete this.eventListenerList[a];
	};
	evtPro = null;
}(window, document));
(function(globals, doc) { //20180807 TODO
	'use strict';
	var initTime = Date.now(), mapping = {}, cache = {}, plugins = [],
		regJS = /\.js$/, regCSS = /\.css$/, curReq = null, initFn = [];
	var exp = {}, config = {}, wait = {}, alias, errorFn = {}, firstInit = true;
	
	function isArr(arr){return (arr instanceof Array) ? true : false;}
	function sta(q){ return (typeof(q)=="string") ? [q] : (isArr(q) ? q : []); }
	function isFn(fn){return (fn instanceof Function) ? true : false;}
	var isIE8 = (function(){ return doc.createEvent === void 0 ? true : false;}());
	exp.initModule = function(main, exFn) {
		var kit = exp.kitRequire('main/kit');
		if(isFn(main)||kit.type(main)=="object"){
			exFn = main; main = null;
		}else if(arguments.length==1) return configEvent(main, '', getID());
		var id = getID(), rely = parseRely(main, exFn, id);
		if(isFn(exFn)||typeof(exFn)=="object"){
			initFn.push({mod: create(id, rely), fn: exFn});
		}
		if( isReady() ) globals.setTimeout( execute );
	};
	exp.define = function(id /*,rely, fn*/) {
		var fn, rely;
		if(config.complete) id = toVars(id);
		if(arguments.length > 2){
			rely = arguments[1];
			fn = arguments[2];
		} else fn = arguments[1];
		if(isFn(fn) && id){
			mapping[id] = {mod: create(id, parseRely(rely, fn, id)), fn: fn};
		} else if(id) exp.initModule(id);
	};
	exp.kitRequire = function (id) {
		id = toVars(id);
		if(cache[id]) return cache[id];
		var M = mapping[id], c;
		if(!M){
			if(!alias[id]) console.warn(id+'：Module is not define!');
			return;
		}
		c = M.mod.exports = {};
		cache[id] = M.fn.call(c, exp.kitRequire, c, M.mod) || M.mod.exports;
		delete mapping[id];
		return cache[id];
	};
	Object.addForin(globals, exp, false, false);
	function Module(id, rely){
		this.id = id;
		this.rely = rely || '';
		if(config.complete) this.uri = alias[id] || '';
	}
	function getID(){
		for(var i = 0,id='ID'; i < 6; i++) id += Math.floor(Math.random() * 10);
		return id;
	}
	function create(id, rely){ return new Module(id, rely); }
	function parseRely(urls, fn, id){
		if(!config.complete) return configEvent(urls, fn, id);
		urls = sta(urls);
//		fn = fn.toString().replace(/\/\/.+|\s|"|'/g,'').replace(/\/\*.+?\*\//g,'')
		fn = fn.toString().replace(/(\/\*[\s\S]+?\*\/)|(\/\/.+)|['"`\s]/g, '')
		.replace(/{(\w+)}/g, function(o, v){return config.vars[v]||o});
		var reg = (fn.indexOf('function')==0) ? (/.+?\((.+?)[,)]/).exec(fn) : (/.+?(.+?)\){0,1}=>/).exec(fn);
		if(!reg||reg[1].indexOf(')')==0) return urls;
		fn.replace(new RegExp(reg[1]+'\\((.+?)\\)','g'), function(a, w){urls.push(w)});
		preload(urls);
		return urls;
	}
	//配置
	Object.addProto(exp.initModule, 'config', function (obj){
		config = typeof(obj)=="object" ? obj : {};
		var path = config.paths, p, a, vars = config.vars;
		alias = config.alias || {};
		config.alias = {};
		if(vars){
			for(a in alias){ config.alias[toVars(a)] = alias[a];}
			alias = config.alias;
		} else config.vars = {};
		if(path){
			for(p in path){
				var reg = new RegExp('^'+p);
				for(a in alias) alias[a] = alias[a].replace(reg, path[p]);
			}
		} else config.paths = {};
		config.complete = true;
		forWait();
	}, false, false);
	Object.addProto(exp.initModule, 'addConfig', function (obj){
		obj = typeof(obj)=="object" ? obj : {};
		var kit = exp.kitRequire('main/kit');
		obj = kit.extend(obj,config);
		exp.initModule.config(obj);
	}, false, false);
	function configEvent(urls, fn, id){ wait[id] = {r:urls, fn:fn}; }
	function forWait(){
		var i , len = initFn.length, o, id, r;
		for (i = 0; i < len; i++) {
			id = initFn[i].mod.id;
			if(o = wait[id]){
				r = parseRely(o.r, o.fn);
				initFn[i].mod = create(id, r);
				delete wait[id];
			}
		}
		for (i in wait){
			o = wait[i];
			r = parseRely(o.r, o.fn);
			if(len = mapping[i]){
				delete mapping[i];
				id = toVars(i);
				mapping[id] = {mod: create(id, r), fn: len.fn};
			}
		}
		wait = {};
		if( isReady() ) globals.setTimeout( execute );
	}
	function toVars(str){
		if(typeof(str)!="string") return str;
		return str.replace(/{(\w+)}/g, function(o, v){return config.vars[v]||o});
	}
	//预加载
	var preloadObj = {}, head = doc.querySelector('head');
	function preload(use, isLink, fn, erFn){
		use = sta(use);
		for (var i = 0; i < use.length; i++) {
			if(!regCSS.test(use[i])) {
				if(preloadObj[use[i]]) continue;
				if(isLink){
					preloadObj[use[i]] = use[i];
					plugins.push(use[i]);
					errorFn[use[i]] = erFn;
				} else if(alias[use[i]]) {
					preloadObj[use[i]] = alias[use[i]];
					plugins.push(alias[use[i]]);
				}
			} else {
				var rel = doc.getElementsByTagName('link');
				for (var s = 0; s < rel.length; s++) if(rel[s].href.indexOf(use[i]) != -1) break;
				if(s != rel.length) continue;
				var es = doc.createElement('link');
				es.rel = 'stylesheet';
				es.type = 'text/css';
				es.href = use[i];
				head.appendChild(es);
			}
		}
		if( isFn(fn) ) initFn.push({mod: create(getID()), fn: fn});
		if(curReq==null && plugins.length==0 && isLink) execute();
		if(curReq != null || plugins.length == 0) return;
		request();
	}
	function request() {
		var es = doc.createElement('script');
		curReq = plugins.shift();
		es.id = curReq;
		if(!regJS.test(curReq)) curReq += '.js';
		es.type = 'text/javascript';
		es.src = curReq;
		if(isIE8) es.onreadystatechange = onload;
		else es.onload = onload;
		es.onerror = errors;
		head.appendChild(es);
	}
	function onload(e) {
		if(isIE8){
			var r = this.readyState;
			if(r === 'loaded' || r === 'complete') {
			} else return
		}
		this.onreadystatechange = this.onerror = this.onload = null;
		head.removeChild(this);
		loading();
	}
	function loading() {
		if(plugins.length > 0){
			request();
		} else {
			curReq = null;
			if( isReady() ) globals.setTimeout( execute );
		}
	}
	function errors(e) {var f = errorFn[this.id]; if(isFn(f)) {f();} loading();}
	
	function isReady(){
		if ( doc.readyState === "complete" || (doc.readyState !== "loading" && !doc.documentElement.doScroll) ) {
			return curReq == null ? true : false;
		} else {
			doc.addEventListener( "DOMContentLoaded", completed );
			globals.addEventListener( "load", completed );
			return false;
		}
	}
	function execute() {
		if(!config.complete) return;
		while(initFn.length > 0){
			if(curReq != null) return;
			var M = initFn.shift(), entry, c = M.mod.exports = {};
			if(!isFn(M.fn)) entry =  M.fn;
			else entry = M.fn.call(c, exp.kitRequire, c, M.mod) || M.mod.exports;
			if(isFn(entry.init)) entry.init();
			if(isFn(entry.events)) entry.events();
		}
		if(firstInit){
			firstInit = false;
			console.log('initTime: ', Date.now() - initTime);
		}
		errorFn = {};
	}
	function completed() {
		doc.removeEventListener( "DOMContentLoaded", completed );
		globals.removeEventListener( "load", completed );
		if( isReady() ) globals.setTimeout( execute );
	}
	Object.addProto(Module.prototype, 'loader', function (src, fn, erFn){
		preload(src, true, fn, erFn);
	}, false, false);
	define('loader', function(){ return Module.prototype.loader; });
}(window, document));
/******************************************************************************/

define('main/kit', function(require, exports, module)
{
	'use strict';
	var doc = document, win = window, kit = ToolKit, //TODO
		_div = doc.createElement('div'), _utilArr = [];
	
	var _os = function ()
	{
		if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
			return 'ios';
		} else if (/(Android)/i.test(navigator.userAgent)) {
			return 'android';
		} else return 'pc';
	}();
	var _browser = {};
	_browser.name = (function(){
		var n = navigator.userAgent; //取得浏览器的userAgent字符串
		if(n.indexOf("QQBrowser") > -1) return 'QQ';
		if(n.indexOf("UBrowser") > -1) return 'UC';
		if(n.indexOf("QIHU 360") > -1) return '360';
		if(n.indexOf("Opera") > -1) return 'opera';
		if(n.indexOf("Firefox") > -1) return 'firefox';
		if(n.indexOf("Chrome") > -1) return 'chrome';
		if(n.indexOf("Safari") > -1) return 'safari';
		if(/(MicroMessenger)/i.test(n)) return 'weixin';
	    if(n.indexOf("compatible") > -1 && n.indexOf("MSIE") > -1 && n.indexOf("Trident") > -1){
	        return "IE"; //判断是否IE浏览器
	    };
	}());
	_browser.IEVersion = (function(){
		var v = 0;
		navigator.userAgent.replace(/MSIE (.+?);/, function(a, b){v = b;});
		return parseFloat(v);
	}());
	function _isArrayLike(obj) {
		//obj.propertyIsEnumerable(proName);//是否可枚举的
		if(kit.type(obj)=='string'||kit.type(obj)=='function'||kit.type(obj)=='window')
			return false;
		return (obj && kit.type(obj.length)=='number') ? true : false;
	}
	function _addEvent(el, type, fn, bubble) {
		if(el.addEventListener){ //EventTarget
			el.addEventListener(type, fn, bubble);
		} else if(_isArrayLike(el)){
			for (var i = 0, l = el.length; i < l; i++)
				_addEvent(el[i], type, fn, bubble);
		}
	}
	function _clearEvent(el, type, fn, bubble) {
		if(el.removeEventListener){
			if(fn) el.removeEventListener(type, fn, bubble);
			else el.clearEventListeners(type);
		} else if(_isArrayLike(el)){
			for (var i = 0, l = el.length; i < l; i++)
				_clearEvent(el[i], type, fn, bubble);
		}
	}
	//['children'],['childNodes']
	function _getIndex(el, child) {
		if(!el||!el.parentNode) return -1;
		var list = el.parentNode[child];
		var i = 0, len = list.length;
		for (; i < len; i++) if(list[i] === el) return i;
		return -1;
	}
	function _isNode(el) { return el instanceof (win.Node || win.Element); }
	/*root是否包涵el*/
	function _contains(root, el) {
		if(!_isNode(root) || !_isNode(el))
			return false;
		return root.contains ? root != el && root.contains(el) : 
			!!(root.compareDocumentPosition(el) & 16);
	}
	function _isFn(fn) { return (fn instanceof Function); }
	function _isObject(obj) { return kit.type(obj) == 'object'; }
	
	var _GE = doc.createElement('event'),
	_dispa = (function (){
		if(doc.createEvent){ //W3C使用dispatchEvent方法
			return function(type, params){
				var evt = doc.createEvent('HTMLEvents');
				// initEvent接受3个参数：事件类型，是否冒泡，是否阻止浏览器的默认行为
				evt.initEvent(type, true, true);
				evt.params = params;
				_GE.dispatchEvent(evt);
			}
		} else if (doc.createEventObject) { //IE浏览器支持fireEvent方法
			return function(type, params){
				var evt = doc.createEventObject();
				evt.params = params;
				_GE.fireEvent('on' + type, evt);
			}
		}
	}());
	/**
	 * 全局事件中心
	 * add:注册事件
	 * clear:清除事件
	 * dispatch:派发事件
	 */
	var _globalEvent = {
		constructor : 'GlobalEvent',
		add : function(type, fn) {//监听
			_addEvent(_GE, type, fn);
		},
		clear : function (type, fn) {//删除
			_clearEvent(_GE, type, fn);
		},
		dispatch : function (type, params) {//派发
			setTimeout(_dispa, 0, type, params);
		}
	};
/******************************************************************************/
	/**
	 * @description 工具主类
	 * @author kasumi
	 */
	function ToolKit(selector, el){return new _qs(selector, el);}
	ToolKit.isArrayLike = _isArrayLike;
	ToolKit.os = _os;
	ToolKit.browser = _browser;
	ToolKit.globalEvent = _globalEvent;
	ToolKit.contains=_contains;
	ToolKit.isObject=_isObject;
	ToolKit.isFn=_isFn;
	ToolKit.childIndex = function(el) { return _getIndex(el, 'children'); };
	ToolKit.nodeIndex = function(el) { return _getIndex(el, 'childNodes'); };
	ToolKit.stage = function() { return doc.compatMode === 'CSS1Compat' ? doc.documentElement: doc.body; };
	ToolKit.body = function() { return doc.body; }; //CSS1Compat, BackCompat
	ToolKit.html = function() { return doc.documentElement; };
	//TODO
	ToolKit.toArray = function() {
		if(Array.from) return Array.from;
		return function(obj, fn, callee){
			var result, i, len;
			try{
				result = Array.prototype.slice.call(obj);
			}catch(e){//IE8
				result = [], len = obj.length;
				for (i = 0; i < len; i++) result.push(obj[i]);
			}
			if(_isFn(fn)){
				i = 0, len = result.length;
				for (;i < len; i++) result[i] = fn.call(callee, result[i]);
			}
			return result;
		};
	}();
	var _classType = {};  //用于记录[object class]样式
	(function(fns){
		var typeStr = 'Boolean Number String Function Array Date RegExp Null Undefined '+
				'HTMLDocument Window NodeList HTMLCollection StaticNodeList',
			typeArr = typeStr.split(' '),
			i, len = typeArr.length;
		for (i = 0; i < len; i++)
		    _classType[ "[object " + typeArr[i] + "]" ] = typeArr[i].toLowerCase();
	}());
	ToolKit.type = function (value) {
	    if (value === null) return 'null';//ie6
	    if (value === undefined) return 'undefined';//ie6
		var toString = Object.prototype.toString;
	    var typeString = _classType[value.constructor]||_classType[toString.call(value)]||'object';
//	    console.log(_classType[value.constructor],' - ',value.constructor);

	    if(typeString == 'object'){
	    	if (value.nodeType !== undefined) {
	            if (value.nodeType == 3) {
	                return (/\S/).test(value.nodeValue) ? 'textnode': 'whitespace';
	            } else return 'element';
	        } else return 'object';
	    }
		return typeString;
	};
	ToolKit.each = function (obj, fn) {
		if(!_isFn(fn) || !this.isArrayLike(obj)) return;
		var flag, i = 0, len = obj.length;
		for (; i < len; i++) {
			if(_isArrayLike(obj[i])){
				flag = this.each(obj[i], fn);
			} else {
				flag = fn.call(obj[i], i, obj[i]);
			}
			if(flag === true) return true;
			else if(flag === false) break;
		}
		return this;
	};
	/**
	 * @description 继承函数
	 * @param  {Class} subClass   [子类]
	 * @param  {Class} superClass [超类]
	 * @example
	 *  function Father(name){
	 *    this.name;
	 * 	  Father.prototype.say=function(){alert(this.name)};
	 *  }
	 *  function Son(name){
	 *	  var _super = Son._super;
	 *    _super.constructor.call(this,name);
	 *  }
	 *  extendFn(Son,Father);
	 */
	ToolKit.extendFn = function(subClass, superClass) {
		var F = function(){};
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass._super = F.prototype;
		Object.addProto(subClass.prototype,'constructor',subClass, false);
		//手动还原超类的构造器,防止超类忘记写。
		Object.addProto(superClass.prototype,'constructor',superClass, false);
		F = null;
	};
	/**扩展工具:*/
	ToolKit.extend = function() {
		var length, target, i, options, 
			keys, attr, val, copy, isArr;
		length = arguments.length;
		if(length == 1){
			target = this;
			i = 0;
		} else {
			target =arguments[0] || {};
			i = 1;
		}
		for (; i < length; i++) {
			if(options = arguments[i]){
				for(keys in options){
					attr = target[keys];
					val = options[keys];
					if ( target === val ) continue;
					if(val&&(_isObject(val)||(isArr=(val instanceof Array)))){
						if ( !isArr ) {
							copy = _isObject( attr ) ? attr : {};
						} else copy = (attr instanceof Array) ? attr : [];
						target[keys] = kit.extend(copy, val);
					} else if(val != null) target[keys] = val;
				}
			}
		}
		return target;
	};
	ToolKit.info = function(obj, val) {
		for(var k in obj){
			if(obj[k] instanceof Function && val){
				console.log(k+'--',obj[k]());
			} else  console.log(k+'--',obj[k]);
		}
	};
	/*
	 * 阻止默认行为，并防止当前事件冒泡。
	 * @param e 事件
	 * @param def 默认true阻止默认行为，false不阻止
	 * @param stopEvent 是否阻止剩余的事件处理价值的执行，默认0，
	 * 					1.防止冒泡，2.防止冒泡加剩余函数。
	 */
	ToolKit.defaultEvent = function(e,def,stopEvent) {
		if(e.preventDefault){
			if(def !== false) e.preventDefault();
			if(stopEvent == 2) e.stopImmediatePropagation();
			else if(stopEvent == 1) e.stopPropagation();
		} else {
			if(def !== false) e.returnValue = false;
			if(stopEvent == 1) win.event.cancelBubble = true;
		}
	};
	var _regTemplate = /{{(\w+)}}/g;//匹配{***}；/{((\w+)|(\W+))}/可匹配中文
	var _regSpace = /^\s+|\s+$/g;//去空格
	/**
	 * dom的动态拼接与赋值
	 * @param {Object} data 替换的数据,数组或{{}};
	 * @param {String} dom <template>标签的dom结构
	 * @param {Boolean} origin 是否保留dom结构的{{rep}}，默认false替换为''；
	 * @param {Boolean} reArr 为true时可返回数组，默认false返回str。
	 * @example <template id='tl'><p>{{rep}}</p></template>
	 * template({{rep:'我被替换了'}},tl.innerHTML);
	 */
	ToolKit.template = function(data, dom, origin,reArr){
		if(!(jsons instanceof Array)) jsons = [jsons];
		var temp = [], i, len = jsons.length, obj;
		dom = dom.replace(_regSpace, '');
		for (i = 0; i < len; i++) {
			obj = jsons[i];
			if(obj instanceof Array){
				temp.push(kit.template(obj, dom, origin, getArr));
			} else temp.push(dom.replace(_regTemplate, replace));
		}
		function replace(rep, val){
			if(obj[val] === 0) obj[val] += '';
			return obj[val]||(origin===true ? rep : '');
		}
		return !!getArr ? temp : temp.join('');
	};
	ToolKit.randomNum = function (min, max) {
		var num = (max > min) ? Math.floor(Math.random() * (max - min + 1)) + min :
			Math.floor(Math.random() * (min - max + 1)) + max;
		return num;
	};
	//滚轮，true向下，false向上。
	ToolKit.wheel = function(e) {
		var num;
		if(e.wheelDelta)
			num = e.wheelDelta<0 ? true : false;
		else
			num = e.detail<0 ? false : true;
		return num;
	};
	ToolKit.mouseX = function(e) {
		return e.touches ? e.touches[0] ? e.touches[0].clientX :
			e.changedTouches[0].clientX : e.clientX;
	};
	ToolKit.mouseY = function(e) {
		return e.touches ? e.touches[0] ? e.touches[0].clientY :
		e.changedTouches[0].clientY : e.clientY;
	};
	ToolKit.mouse = function(e) {
		var point = {};
		point.x = this.mouseX(e);
		point.y = this.mouseY(e);
		return point;
	};
	ToolKit.wheel = function(e){
		if(e.type == 'DOMMouseScroll') return e.detail<0 ? false : true;
		return e.wheelDelta<0 ? true : false;
	};
	function _rem(e){
//		var w = _os=='pc'?win.innerWidth:Math.min(win.innerWidth, win.innerHeight),
		var html = kit.html(), 
			w = win.innerWidth || html.clientWidth,
    		fix = w * 50 / 375;
    	if(_os == 'pc'){
    		if(w >= 750) html.style.fontSize = '100px';
    		else html.style.fontSize = fix + 'px';
    	} else {
    		if(w > 1025) html.style.fontSize = '100px';
    		else if(w >= 768) html.style.fontSize = '102.4px';
    		else if(w >= 576) html.style.fontSize = '76.8px';
    		else html.style.fontSize = fix + 'px';
    	}
	}
	//自适应字体
	ToolKit.screenFix = function (){
    	_rem();
    	_addEvent(window,'resize', _rem);
    	return this;
    }
	ToolKit.offFix = function(size) {
		_clearEvent(window,'resize', _rem);
		if(size){
			if(typeof(size)!="number") kit.html().style.fontSize = '16px';
			else kit.html().style.fontSize = size + 'px';
		}
		return this;
	};
	/**
	 * str转obj
	 * @param {String} param
	 * @param {Boolean} isJson 默认为true,param为json格式,为false时
	 * 		param为url参数格式：'a=ABC&b=[1,2,3]&c={a:99,b:66}'
	 */
	function _toJson(param, isJson){
		if(isJson === false){
			var obj = {}, str, arr, i, len;
			str = unescape(param).replace(/\?+|&+$/g,'');
			str = str.replace(/^&+/g,'').replace(/&+/g,'&');
			arr = str.split('&');
			len = arr.length;
			for (i = 0; i < len; i++) {
				var tem = arr[i].split('=', 2), val = tem[1];
				try{
					val = JSON.parse(val);
				}catch(e){
					var isA = /\[.+\]/.test(val), isO = /\{.+\}/.test(val);
					if(isA && isO){
						isA = val.indexOf('['); isO = val.indexOf('{');
						if(isA < isO){
							isA = true; isO = false;
						} else {
							isO = true; isA = false;
						}
					}
					if(isA){
						val = /\[(.+)\]/g.exec(val)[1].split(',');
					} else if(isO){
						var l = val.match(/:/g).length;
						var str = /\{(.+)\}/g.exec(val)[1];
						var d, s, er;
						val = {};
						for (d = 0; d < l; d++) {
							er = str.lastIndexOf(':');
							s = str.substring(0, er);
							er = s.lastIndexOf(',');
							s = str.substring(e+1).split(':');
							val[s[0]] = s[1];
							str = str.substring(0, er);
						}
					}
				}
				obj[tem[i]] = val;
			}
			return obj;
		} else try{ return JSON.parse(param); }catch(e){console.warn('josn error')};
	}
	/**
	 * obj转str
	 * @param {Object} param 
	 * @param {Boolean} isJson 默认为true,返回json格式,为false时
	 * 		返回为url参数格式：'a=ABC&b=[1,2,3]&c={a:99,b:66}'
	 * @param {String} sign isJson为false时有效,在参数前加上？或&;
	 */
	function _toStr(param, isJson, sign){
		if(isJson === false){
			if(sign){
				sign = sign == '&' ? '&' : '?';
			} else sign = '';
			for (var k in param) sign += k + '=' + param[k] + '&';
			return sign.replace(/&$/,'');
		} else try{ return JSON.stringify(param); }catch(e){};
	}
	/**param为Str时反回Obj，为Obj时反回Str*/
	ToolKit.getparms = function (param, isJson, sign){
		if(param && typeof(param)=="string"){
			return _toJson(param, isJson);
		}else if(_isObject(param)) return _toStr(param, isJson, sign);
	};
	//对像是否为空
	ToolKit.isEmpty = function (obj) {
		for(var key in obj) return false;
		return true;
	};
	//查找最近的元素
	ToolKit.closest = function(element, selector) {
	    while (element && element.nodeType !== 9) {//9为document
	        if (typeof element.matches === 'function' &&
	            element.matches(selector)) {
	          return element;
	        }
	        element = element.parentNode;
	    }
	};
	var easing = {
		linear: function( p ) {return p;},
		swing: function( p ) { return 0.5 - Math.cos( p * Math.PI ) / 2; }
	};
	function Timer (ease, delay){
		var that = this, inter, runFN, completeFN, param,
			speed = delay&&delay>17 ? delay : 17,
			eased = 'swing';
		if(easing[ease]) eased = ease;
		
		function percent(startTime, duration){
			var remaining = Math.max(0, startTime + duration - Date.now()),
	            temp = remaining / duration || 0,
	            percent = 1 - temp;
			percent = easing[eased](percent);
	        return parseFloat( percent.toFixed(4) );
//	        var leftPos  = (endLeft- startLeft) * percent +startLeft;
		}
		function run(startTime, duration){
			var per = percent(startTime, duration);
			if(_isFn(runFN)) runFN(per, param);
	        if(per >= 1) that.stop(true);
		}
		this.start = function(duration, fn){
//			duration = parseFloat(duration) * 1000;
			runFN = fn;
			clearInterval(inter);
			inter = setInterval(run, speed, Date.now(), duration);
		};
		this.stop = function(done){
			clearInterval(inter);
			if(done===true&&_isFn(completeFN)) completeFN();
		};
		this.complete = function(fn){ completeFN = fn };
		this.setParam = function(obj){ param = obj };
	}
	ToolKit.timer = function(ease, delay){ return new Timer(ease, delay); };
	
/******************************************************************************/

	var _regHtml = /<[\S].+>/;//<html>
	var _regon = /^on/;//on事件
	var cssNumber = 'animationIterationCount,columnCount,fillOpacity,flexGrow,flexShrink,fontWeight,'+
		'lineHeight,opacity,order,orphans,widows,zIndex,zoom,columnSpan,perspective,animation-iteration-count,'+
		'column-count,fill-opacity,flex-grow,flex-shrink,font-weight,line-height,column-span';
	var hasUnit = 'bottom,height,left,right,top,width,backgroundPositionX,backgroundPositionY,'+
		'margin-bottom,margin-left,margin-right,margin-top,marginBottom,marginLeft,marginRight,marginTop,'+
		'padding-bottom,padding-left,padding-right,padding-top,paddingBottom,paddingLeft,paddingRight,paddingTop,'+
		'max-height,max-width,min-height,min-width,maxHeight,maxWidth,minHeight,minWidth,textIndent,text-indent,'+
		'font-size,fontSize,letter-spacing,letterSpacing,line-height,lineHeight,outline-offset,outlineOffset,'+
		'outline-width,outlineWidth,word-spacing,wordSpacing,column-gap,columnGap,column-rule-width,'+
		'columnRuleWwidth,column-width,columnWidth,shape-margin,shapeMargin,borderImageOutset,columnRuleWidth';
//	var _fx = [];
	
/***************************************************************************/
	function _varObj(str){
		str = str.split(',');
		var obj = {}, l=str.length;
		for (var i = 0; i < l; i++) obj[str[i]] = true;
		return obj;
	}
	cssNumber = _varObj(cssNumber);
	hasUnit = _varObj(hasUnit);
	function _getElms(selector, el) {
		var list = [];
		if(typeof(selector) != 'string') return list;
		if(typeof(el)=="string")
			el = doc.querySelectorAll(el);
		else if(el&&el instanceof Element)
			el = [el];
		if (el&&el.length){
			var nid = '_sizzle_', old, arr, i, len;
			for (i = 0, len = el.length; i < len; i++) {
				old = el[i].getAttribute("id");
				el[i].setAttribute("id", nid);
				arr = el[i].querySelectorAll(selector);
				for (var k = 0; k < arr.length; k++) {
					if(list.indexOf(arr[k])<0) list.push(arr[k]);
				}
				old?el[i].setAttribute("id", old):el[i].removeAttribute("id");
			}
		} else {
			try{
				list = doc.querySelectorAll(selector);
				list = kit.toArray(list);
			}catch(e){}
		}
		return list;
	}
	function _qsInit(obj, el)
	{
		var tmp = [];
		if(obj==win||obj==doc||_isNode(obj)){
			tmp.push(obj);
		}else if(typeof(obj)=="string"){
			if(_regHtml.test(obj)){
				_div.innerHTML = obj;
				tmp = kit.toArray(_div.children);
			} else tmp = _getElms(obj, el);
		}else if(_isArrayLike(obj)){
			for (var k = 0; k < obj.length; k++) {
				if(_isNode(obj[k]))
					tmp.push(obj[k]);
			}
		}
		for (var i = 0; i < tmp.length; i++) this.push(tmp[i]);
		return tmp;
	};
	/**
	 * @description 轻量的,类似JQ的库
	 * @param {String} selector: css选择器
	 * @param {Element} el: 元素
	 */
	function _qs(selector, el) // TODO
	{
		Object.addProto(this, 'length', 0, false, true, false);
		this.init(selector, el);

/******************************** 原型链 **********************************/
		if(_isFn(_qs.prototype.on)) return;
		var pro = _qs.prototype;
		pro.kit = ToolKit;
//		var _internal = {};
		
		pro.on = function(type, fn, bubble) {
			_addEvent.call(this,this,type,fn, bubble);
			return this;
		};
		pro.off = function(type, fn, bubble, deep) {
			_clearEvent.call(this,this,type,fn, bubble);
			var i, el, on;
			for (i = 0; i < this.length; i++) {
				el = this[i];
				if(type) el['on'+type] = null;
				else if(deep === true) {
					for(on in el) if(_regon.test(on) && el[on]) el[on] = null;
				}
			}
			return this;
		};
		pro.css = function (styles,value) {
			if(this.isNull()) return this;
			if(typeof(styles) == 'string'){
				var att = styles;
				styles = {};
				styles[att] = value;
			}
			for (var key in styles) {
				value = styles[key];
				if(typeof(value)=="number") value += cssNumber[key] ? '' : 'px';
				for (var i = 0; i < this.length; i++) {
					this[i].style[key] = value;
				}
			}
			return this;
		};
		function _style(els, css, isNum, pseudo){
			var val = win.getComputedStyle(els, pseudo)[css];
			if(isNum !== false&&hasUnit[css]){
				val = parseFloat(val);
				if(isNaN(val)) val = 0;
			}
			return val;
		}
		function _getStyle(els, styles, isNum, pseudo) {
			var valCss;
			if(typeof(styles)=="string"){
				valCss = _style(els, styles, isNum, pseudo);
			}else if(_isObject(styles)){
				valCss = {};
				for (var key in styles)
					valCss[key] = _style(els, styles[key], isNum, pseudo);
			}
			return valCss;
		};
		/**
		 * getStyle('width');
		 * getStyle({w:'width',h:'height'});
		 */
		pro.getStyle = function(styles, isNum, isAll, pseudo) {
			var val;
			if(isAll === true){ //getPropertyValue
				val = [];
				_each.call(this, function(el){ val.push(_getStyle(el, styles, isNum, pseudo)); });
			} else val = _getStyle(this[0], styles, isNum, pseudo)
			return val;
		};
		pro.setAttr = function (prop, val) {
			if(this.isNull()) return this;
			if(typeof prop == 'string'){
				var k = prop; prop = {};
				prop[k] = val;
			}
			for (var keys in prop) {
				_each.call(this, function(el){
					val = prop[keys];
					if(val == null) el.removeAttribute(keys, val);
					else el.setAttribute(keys, val);
				});
			}
			return this;
		};
		pro.getAttr = function(prop, isAll) {
			var obj, keys;
			if(isAll === true){
				var tmp = [], i;
				if(typeof(prop)=="string"){
					_each.call(this, function(el){ tmp.push(el.getAttribute(prop)); });
				}else if(_isObject(prop)){
					_each.call(this, function(el){
						obj = {};
						for (keys in prop) obj[keys] = el.getAttribute(prop[keys]);
						tmp.push(obj);
					});
				}
				return tmp;
			} else {
				if(typeof(prop)=="string"){
					obj = this[0].getAttribute(prop);
				}else if(_isObject(prop)){
					obj = {};
					for (keys in prop) obj[keys] = this[0].getAttribute(prop[keys]);
				}
			}
			return obj;
		};
		pro.extend = function () { return kit.extend.apply(_qs.prototype,arguments); };
		pro.show = function(str) {
			str = typeof(str)=="string" ? str : 'block';
			return this.css('display', str);
		};
		pro.hide = function() { return this.css('display','none'); };
		pro.find = function(selector) { return new _qs(selector,this); };
		pro.add = function(selector, el) {
			var els = _getElms.call(this,selector, el);
			var i = 0, len = els.length;
			for (; i < len; i++) this.push(els[i]);
			return this;
		};
		/**
		 * @example setObj('keys', {'value':'789',name:'ABC'});
		 */
		pro.setData = function(keys, value) {
			return _each.call(this, function(el){ el[keys] = value; });
		};
		/**
		 * @param {Object} keys
		 * @param {Boolean} isAll
		 * @example getData('value', true);
		 */
		pro.getData = function(keys, isAll){
			if(this.isNull()) return null;
			if(isAll === true){
				var tem = [];
				_each.call(this, function(el){ tem.push(el[keys]); });
				return tem;
			} else return this[0][keys];
		};
		//@param {String} txt，为true时返回全部
		pro.val = function(txt) {
			if(txt == null) return this.getData('value');
			else if(txt === true) return this.getData('value', txt);
			else return this.setData('value', txt);
		};
		pro.html = function(txt) {
			if(txt == null) return this.getData('innerHTML');
			else if(txt === true) return this.getData('innerHTML', txt);
			else return this.setData('innerHTML',txt);
		};
		pro.text = function(txt) {
			if(txt == null) return this.getData('innerText');
			else if(txt === true) return this.getData('innerText',txt);
			else return this.setData('innerText',txt);
		};
		pro.addClass = function(c){
			_each.call(this, function(el){
				if(el.className.indexOf(c) < 0) el.className += ' ' + c;
			});
			return this;
		};
		pro.delClass = function(c){
			_each.call(this, function(el){
				el.className = el.className.replace(c, '');
			});
			return this;
		};
		pro.hasClass = function(c){
			return (this[0]&&this[0].className.indexOf(c) < 0) ? false : true; 
		};
		function _getOffset(elms){
			var point = {};
			point.x = elms.offsetLeft;
			point.y = elms.offsetTop;
			while(elms.offsetParent){
				elms = elms.offsetParent;
				point.x += elms.offsetLeft;
				point.y += elms.offsetTop;
			}
			return point;
		}
		pro.offset = function(isAll) {
			var tmp;
			if(isAll === true){
				tmp = [];
				_each.call(this, function(el){ tmp.push(_getOffset(el)); });
			} else tmp = _getOffset(this[0]);
			return tmp;
		};
		pro.offsetTop = function (isAll) {
			var tmp;
			if(isAll === true){
				tmp = [];
				_each.call(this, function(el){ tmp.push(_getOffset(el).y); });
			} else tmp = _getOffset(this[0]).y;
			return tmp;
		};
		pro.offsetLeft = function (isAll) {
			var tmp;
			if(isAll === true){
				tmp = [];
				_each.call(this, function(el){ tmp.push(_getOffset(el).x); });
			} else tmp = _getOffset(this[0]).x;
			return tmp;
		};
		pro.imgComplete = function(finish, progress){
			var num = this.length, l = this.length;
			_each.call(this, function(el){
				if(!(el instanceof HTMLImageElement)) --num;
				else if(el.complete == true) --num;
				else  el.onerror = el.onload = complete;
				if(num == 0) finish();
			});
			function complete(e){
				this.onerror = this.onload = null;
				var p = ((l-(--num))/l).toFixed(4);
				if(_isFn(progress)) progress(parseFloat(p));
				if(num == 0) finish();
			}
			return this;
		};
		
	/**********************************************/
		/**
		 * dom分类操作//doc.createDocumentFragment
		 * @param {Element} self 本身
		 * @param {Number} i 索引
		 * @param {Element} el 目标
		 * @param {String} cmd 命令分类
		 */
		function _domClassify(self, i, el, cmd)
		{
			if(typeof(el)=="string"){
				if(_regHtml.test(el)){
					_div.innerHTML = el;
					var tmp = kit.toArray(_div.children);
					_domManip(cmd,self,tmp,true);
				} else {
					var txt = doc.createTextNode(el);
					_domManip(cmd,self,txt);
				}
			} else if(_isNode(el)){
				var isIn = (cmd == 'append' || cmd == 'prepend') ?
					!_contains.call(this,self,el) : //不包涵
					_contains.call(this,self.parentNode,el);//包涵
				if(isIn && i == 0){
					_domManip(cmd,self,el);
				} else {
					var clone = el.cloneNode(true);
					_copyEvent.call(this, clone, el);
					_domManip(cmd,self,clone);
				}
			} else if (el && el.length > 0){
				var k, len = el.length;
				if(cmd == 'append' || cmd == 'before'){
					for (k = 0; k < len; k++)
						_domClassify.call(this,self,i,el[k],cmd);
				}else if(cmd == 'prepend' || cmd == 'after'){
					for (k = len-1; k >= 0 ; --k)
						_domClassify.call(this,self,i,el[k],cmd);
				}
			}
		}
		function _copyEvent(target, el)
		{
			var eObj = el.getEventListeners();
			var eArr, i, l, o;
			for (var type in eObj) {
				eArr = eObj[type];
				for (i = 0, l = eArr.length; i < l; i++) {
					o = eArr[i];
					_addEvent(target, type, o.listener, o.useCapture);
				}
			}
			for(var on in el)
				if(_regon.test(on) && el[on]) target[on] = el[on];
		}
		/**
		 * dom操作
		 * @param {String} cmd: 命令类型
		 * @param {Element} self 本身
		 * @param {Element} target 目标
		 */
		function _domManip(cmd,self,target,isfor)
		{
			var i, len = target.length, parent;
			var frag = doc.createDocumentFragment();
			if(isfor === true){
				for (i = 0; i < len; i++)
					frag.appendChild(target[i]);
			}
			switch(cmd)
			{
				case 'append':
					self.appendChild(isfor === true ? frag : target);
					break;
				case 'prepend':
//						for (i = target.length-1; i >=0; i--)
					self.insertBefore(isfor === true ? frag : target,self.firstChild);
					break;
				case 'before':
					parent = self.parentNode;
					parent.insertBefore(isfor === true ? frag : target, self);
					break;
				case 'after':
					parent = self.parentNode;
					var index = _getIndex.call(parent,self,'children');
//						for (i = target.length-1; i >=0; i--)
					parent.insertBefore(isfor === true ? frag : target,parent.children[index+1]);
					break;
			}
		}
		/**简单的加入元素*/
		/*function _simpleAppend(el)
		{
			if(typeof(el)=="string"){
				if(_regHtml.test(el)){
					_div.innerHTML = el;
					var tmp = kit.toArray(_div.children);
					for (var i = 0; i < tmp.length; i++)
						this[0].appendChild(tmp[i]);
				} else {
					var txt = doc.createTextNode(el);
					this[0].appendChild(txt);
				}
			} else if(el && el.length>0){
				for (var i = 0; i < el.length; i++)
					if(_isNode(el[i])) this[0].appendChild(el[i]);
			} else if(_isNode(el)) this[0].appendChild(el);
			return this;
		};
		pro.simpleAppend = _simpleAppend;*/
		function _each(fn, params) {
			for (var i=0, l=this.length; i < l; i++) fn.call(this,this[i],i,params);
			return this;
		}
		pro.append = function(els) {
			return _each.call(this, function(el, i){
				_domClassify.call(this,el,i,els,'append');
			});
		};
		/*把自已加到外部dom中*/
		function _domTo(els, cmd) {
			var to = new _qs(els);
			if(to.isNull()) return this;
			to[cmd](this);
			return this;
		}
		pro.appendTo = function(els) { return _domTo.call(this, els, 'append'); };
		pro.prepend = function(els) {
			return _each.call(this, function(el, i){
				_domClassify.call(this,el,i,els,'prepend');
			});
		};
		pro.prependTo = function (els) { return _domTo.call(this, els, 'prepend'); };
		pro.before = function(els) {
			return _each.call(this, function(el, i){
				_domClassify.call(this,el,i,els,'before');
			});
		};
		pro.beforeTo = function(els) { return _domTo.call(this, els, 'before'); };
		pro.after = function(els) {
			return _each.call(this, function(el, i){
				_domClassify.call(this,el,i,els,'after');
			});
		};
		pro.afterTo = function (els) { return _domTo.call(this, els, 'after'); };
		pro.removeChild = function (selector) {
			var child = new _qs(selector, this);
			return child.remove();
		};
	/**********************************************/
		/*只删除元素*/
		pro.detach = function() {
			return _each.call(this, function(el){ _div.appendChild(el); });
		};
		/*删除元素与事件*/
		pro.remove = function(deep) {
			this.detach();
			this.off(null, '', '', deep);
			return this;
		};
		//在外部的elem里面
		pro.contains = function(elem) {
			if(typeof(elem)=="string")
				elem = doc.querySelector(elem);
			for (var i = 0; i < this.length; i++) {
				if(_contains.call(this,elem,this[i]) == false)
					return false;
			}
			return true;
		}
		//在自己里面
		pro.inMine = function(elem) {
			if(typeof(elem)=="string")
				elem = doc.querySelector(elem);
			for (var i = 0; i < this.length; i++) {
				if(_contains.call(this,this[i],elem) == true)
					return true;
			}
			return false;
		};
		pro.index = function(elm) {
			if(typeof(elm)=="string")
				elm = doc.querySelector(elm);
			if(!_isNode(elm)) return -1;
			for (var i = 0; i < this.length; i++)
				if(this[i] == elm) return i;
			return -1;
		};
		pro.eq = function(index) {
			index = parseInt(index);
			if(isNaN(index)) return null;
			if(index >= this.length||index<0) return null;
			return new _qs(this[index]);
		};
		pro.eqOf = function(elm) {
			for (var i = 0; i < this.length; i++) {
				if(this[i] == elm) return new _qs(elm);
			}
			return null;
		};
		pro.each = function(fn) {
			for (var i = 0; i < this.length; i++)
				if(fn.call(this, this[i], i) === false) break;
			return this;
		};
		function _scroll(e){
			var a = this.clientHeight, b = this.scrollTop, c = this.scrollHeight,
				f = this.clientWidth, g = this.scrollLeft, h = this.scrollWidth;
			this._sFN_( a+b==c, f+g==h, e );
		}
		//滚动时回调fn，fn会传入两个Boolean参数，第一个是Y方向，第二个是X方向
		pro.isScrollEnd = function(fn){
			if(this.isNull()) return this;
			if(_isFn(fn)){
				_each.call(this, function(el){
					el._sFN_ = fn;
					el.addEventListener('scroll', _scroll);
				});
			} else {
				_each.call(this, function(el){
					el.removeEventListener('scroll', _scroll);
					delete el._sFN_;
				});
			}
			return this;
		};
		function _index(isAll, cmd) {
			if(this.isNull()) return -1;
			if(isAll === true){
				var arr = [];
				_each.call(this, function(el){ arr.push(_getIndex(el, cmd)); });
				return arr;
			} else return _getIndex(this[0], cmd);
		}
		pro.childIndex = function(isAll) { return _index.call(this, isAll,'children'); };
		pro.nodeIndex = function(isAll) { return _index.call(this, isAll,'childNodes'); };
		//通用事件
		/**
		 * 
		 * @param {Function} fn 为null时删除全部事件,fn为函数时添加事件
		 * @param {Boolean} clear 为true时删除fn事件
		 */
		function _simpleEvent(type, fn, clear, bubble)
		{
			if(_isFn(fn)) {
				clear !== true ? this.on(type,fn,bubble) : this.off(type,fn,bubble);
			} else this.off(type);
		}
		(function(){
			var eventType = ( "blur focus focusin focusout load resize scroll unload click dblclick " +
			"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave "+
			"change select submit input touchcancel mousewheel DOMMouseScroll " +
			"keydown keypress keyup error contextmenu cancel touchstart touchend touchmove" ).split( " " );
			for (var i = 0; i < eventType.length; i++) {
				pro[eventType[i]] = function(j){
					return function (fn, clear, bubble){
						var type = this[eventType[j]].type;
						_simpleEvent.call(this,type,fn,clear,bubble);
						return this;
					};
				}(i);
				pro[eventType[i]].type = eventType[i];
			}
			var pc = ('mousedown mouseup mousemove').split(' ');
			var mobile = ('touchstart touchend touchmove').split(' ');
			var cmd = ('down up move').split(' ');
			for (i = 0; i < cmd.length; i++) {
				pro[cmd[i]] = function(j){
					return function (fn, clear, bubble){
						var type = this[cmd[j]].type;
						_pcMobileEvent.call(this,type.pc,type.m,fn,clear,bubble);
						return this;
					};
				}(i);
				pro[cmd[i]].type = {pc:pc[i], m:mobile[i]};
			}
		}());
		/**
		 * 
		 * @param {Function} fn 为null时删除全部事件,fn为函数时添加事件
		 * @param {Boolean} clear 为true时删除fn事件
		 */
		function _pcMobileEvent(pc, mobile, fn, clear, bubble)
		{
			var type = _os == 'pc' ? pc : mobile;
			if(_isFn(fn)){
				if(clear !== true) this.on(type, fn, bubble);
				else this.off(type, fn, bubble);
			} else  this.off(type);
		}
		var _dispatch = function () 
		{
			if(doc.createEvent){ //W3C
				return function(type, params){
					var evt = doc.createEvent('HTMLEvents');
					evt.initEvent(type, true, true);
					evt.params = params;
					this.dispatchEvent(evt);
				}
			} else if (doc.createEventObject) { //IE
				return function(type, params){
					var evt = doc.createEventObject();
					evt.params = params;
					this.fireEvent('on' + type, evt);
				}
			}
		}();
		//主动触发事件
		pro.trigger = function(type, params) {
			return _each.call(this, function(el){ _dispatch.call(el, type, params); });
		};
		//TODO 动画
		var regRBGA = /\((\w.+)\)/;
		function colorToNum(color, sign){
			var i, len, num;
			if(sign == '#'){
				var co = color.substring(1), str = '';
				len = co.length; num = [];
				if(len == 3){
					for (i = 0; i < len; i++) str += co[i] + co[i];
					co = str;
				}
				for (i = 0; i < 6; i+=2) num.push(parseInt(co[i] + co[i+1], 16));
			} else if (sign == 'rgba'){
				num = color.match(regRBGA)[1].split(',');
				len = num.length;
				for (i = 0; i < len; i++) num[i] = parseFloat(num[i]);
			}
			return num;
		}
		var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;
		var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );
		var regC6 = /^#([0-9a-f]{6})/i, regC3 = /^#([0-9a-f]{3})/i;
		var regColor = /rgba{0,1}\(\d.+?\)/i;
		function adjustCSS(prop, value, original){
			var ret = rcssNum.exec(value), adjust;
			if(!ret) {
				var color;
				adjust = { unit: '', num: 0, end: '0' };
				if(regC6.test(value) || regC3.test(value)){
					adjust.sign = '#';
					adjust.end = value;
					adjust.num = colorToNum(value, '#');
				} else if (regColor.test(value)){
					adjust.sign = 'rgb';
					adjust.end = value;
					adjust.num = colorToNum(value, 'rgba');
				}
				if(!adjust.sign && original) return null;
				return adjust;
			}
			adjust = {
				unit: ( ret[3] || (cssNumber[prop] ? '' : 'px') ).toLowerCase(),
				sign: ret[1],
				num: parseFloat(ret[2])
			};
			adjust.end = ret[2] + adjust.unit;
			return adjust;
		}
		function valueParts(options, list){
			var cssKey, obj, clip = {}, item,
				i, len = list.length, c, size;
			for(cssKey in options){
				obj = adjustCSS(cssKey, options[cssKey], true);
				if(obj == null) continue;
				clip[cssKey] = [];
				for (i = 0; i < len; i++) {
					item = kit.extend({}, obj);
					c = adjustCSS(cssKey, _getStyle(list[i], cssKey, false));
//					if(c == null) c = { unit: '', num: 0 };
					item.el = list[i];
					if(obj.unit != c.unit){  //1in = 2.54cm = 25.4 mm = 72pt = 6pc
						switch (obj.unit){  //单位
							case '%':
								c.num =  _getStyle(item.el, cssKey)/_getStyle(item.el.parentNode, cssKey)*100;
								break;
							case 'rem':
								size = _getStyle(kit.html(), 'fontSize');
								c.num = c.num / size; break;
							case 'em':
								size = _getStyle(item.el.parentNode, 'fontSize');
								c.num = c.num / size; break;
							case 'pt':  //'pt' 1px*3/4=1pt
								c.num = c.num * 4/3; break;
							case 'cm':  //83cm = 3137
								c.num = c.num * 2.54 / 96; break;
							case 'mm':  //68mm = 257
								c.num = c.num * 25.4 / 96; break;
							case 'pc':  //1pc=16px
								c.num = c.num / 16; break;
							default:  //1in=96px
								c.num = c.num / 96; break;
						}
					}
					item.start = c.num;
					if(item.sign == 'rgb'||item.sign == '#'){
						item.longs = colorLongs(item);
					} else item.longs = obj.num - c.num;
					clip[cssKey].push(item);
				}
			}
			return clip;
		}
		function colorLongs(obj){
			var start = obj.start, end = obj.num, arr = [],
				len = Math.max(start.length, end.length);
			for (var i = 0; i < len; i++) {
				arr[i] = end[i] - start[i];
				if(isNaN(arr[i])) arr[i] = 0;
			}
			return arr;
		}
		function numToColor(obj, p){
			var longs = obj.longs, len = longs.length,
				arr = [], str;
			for (var i = 0; i < len; i++) {
				str = parseInt( longs[i] * p + obj.start[i] );
				if(len == 3){
					str = str.toString(16);
					if(str.length < 2) str = '0' + str;
				} else if(i == 3){
					str = parseFloat( longs[i] * p + obj.start[i] );
					if(isNaN(str)) str = obj.num[i];
				}
				arr[i] = str;
			}
			if(len == 3){
				str = '#' + arr.join('');
			} else str = 'rgba(' + arr.join(',') + ')';
			return str;
		}
		function _mcRun(p, options){
//			var leftPos  = (endLeft- startLeft) * percent +startLeft;
			var prop, i, len, arr, obj, val
				clip = options.clip;
			for(prop in clip){
				arr = clip[prop];
				len = arr.length;
				for (i = 0; i < len; i++) {
					obj = arr[i];
					switch (obj.sign){
						case '-':
							obj.start -= obj.num;
							val = obj.end = obj.start + obj.unit; break;
						case '+':
							obj.start += obj.num;
							val = obj.end = obj.start + obj.unit; break;
						case '#': case 'rgb':
							val = numToColor(obj, p);
							break;
						default:
							val = obj.longs * p + obj.start + obj.unit; break;
					}
					obj.el.style[prop] = val;
					if(p == 1){ obj.el.style[prop] = obj.end };
				}
			}
		}
		pro.movieClip  = function(options, speed, fn){
			var timer = this.timer;
			if(!timer){
				timer = kit.timer();
				Object.addProto(this, 'timer', timer, false);
			}
			options.clip = valueParts(options, this);
			timer.setParam( options );
			timer.complete( fn );
			timer.start(speed, _mcRun);
			return this;
		};
		pro.stop = function(done){
			if(!this.timer) return this;
			this.timer.stop(done);
			return this;
		};
		pro.dispose = function(deep){
			if(deep===true) this.remove(deep);
			else this.off(null, '', '', deep);
			this.splice(0, this.length);
		};
		pro = null;
	}
	
	// TODO
	var _qsObj = {}, pro = _qs.prototype;
	_qsObj.push = _utilArr.push;
	_qsObj.splice = _utilArr.splice;
	_qsObj.init = _qsInit;
	_qsObj.isNull = function() { return this.length <= 0 ? true : false; };
	Object.addForin(pro, _qsObj, false, false, false);
	_qsObj = pro = null;
	return ToolKit;
});
define('main/location', function(require, exports, module){
	var path = window.location.pathname, origin = window.location.protocol+'//',
		fileName, root, isApp = (origin == 'file://' ? true : false),
		pageName, pagePath, appFiles = '/appH5/'; //app里的H5根目录
//	path = '/data/data/com.android.fcsc.broker/files/www/appH5/dycydiscovery/myRecom_01.html';
	origin += window.location.host;
	pagePath = path.substring(0, path.lastIndexOf('/') + 1);
	pageName = path.substring(path.lastIndexOf('/') + 1);
	exports.path = function(){ return  pagePath};
	exports.pageName = function(format){ return format ? pageName.split('.', 1)[0] : pageName; };
	//webH5项目的根路径
	exports.projectName = function(project){
		if(project == void 0){
			return isApp ? appFiles : fileName;
		} else {
			appFiles = project ? '/'+project+'/' : '';
			if(isApp){
				var last = path.indexOf(appFiles);
				if(last < 0) console.warn('projectName is error!');
				fileName = path.substring(0, last) + appFiles;
			} else  fileName = appFiles || '/';
			root = origin + fileName;//根路径
		}
	};
	exports.origin = function(){ return origin + '/'; };
	exports.root = function(){ return root; };
	exports.isApp = function(){ return isApp; };
});
(function(win){
	var lt = kitRequire('main/location'), r;
	lt.projectName('toolkit'); //必须,H5根目录
	r = lt.projectName()=='/' ? lt.origin() : lt.root();
	kitRequire('loader')(r + 'globalConfig.js', '', function(){initModule.config({});});
	lt = kitRequire('main/kit').screenFix();
	r = false;
	if(lt.os != 'pc'){
		if(win.innerWidth >=576) r = 56;
	} else r = 50;
	lt.offFix(r);
	lt('#IDkit').detach().dispose(false);
}(window));
