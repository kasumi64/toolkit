 /**
  * CMD + AMD，js模块化。
  * @author: leiguangyao;
  * @date: 20180807~~20191213;
  * @version: 3.0.6;
  * */
(function (globals, doc) {
	'use strict';
	/**
	 * @description 把类的成员，或属性设置为是否可枚举，只读。
	 * @param  {Object} target      目标对像
	 * @param  {String} keys        属性名，或函数名
	 * @param  {[type]} methods     属性值，或函数体，无用null
	 * @param  {Boolean} enumer     能否用for-in枚举，默认true。
	 * @param  {Boolean} write      能否修改属性，默认true。
	 * @param  {Boolean} configure  是否能通过delete删除属性，默认true。
	 */
	var setProto = (function (){
		return (document.createEvent === void 0) ? function(target, keys, methods){
			target[keys] = methods;
			return target;
		} : function (target, keys, methods, enumer, write, configure){
			var obj = {value: methods}, proto = Reflect ? Reflect.defineProperty : Object.defineProperty;
			if(methods && (typeof methods.get === 'function' || typeof methods.set === 'function')){
				obj = methods;
			} else obj.writable = write == void 0 ? 1 : !!write;
			obj.enumerable = enumer == void 0 ? 1 : !!enumer;
			obj.configurable = configure == void 0 ? 1 : !!configure;
			proto(target, keys, obj);
			obj = proto = null;
			return target;
		};
	}());
	function addProto(target, methods, e, w, c){
		for(var k in methods) setProto(target, k, methods[k], e, w, c);
		return target;
	}
	function getType(obj){
		var tostr = Object.prototype.toString;
		var tp = tostr.call(obj).toLocaleLowerCase();
		return tp.replace(/\[object |\]/g, '');
	}
	function isType(type){
		return function(obj){
			return getType(obj) === type.toLocaleLowerCase();
		}
	}
	function copy(obj){
		var i = 1, len = arguments.length;
		if(len === 1){
			return JSON.parse( JSON.stringify(obj) ); 
		}
		if(getType(obj)!=='object') obj = {};
		obj = JSON.stringify(obj).replace(/^\{|\}$/g, '');
		for(; i < len; i++){
			obj += "," + JSON.stringify(arguments[i]).replace(/^\{|\}$/g, '');
		}
		obj = obj.replace(/^,+|,+$/g, '');
		return JSON.parse('{' + obj + '}');
	}
	var pro = { setProto: setProto, addProto: addProto, typeof: getType, isType: isType };
	addProto(Object, pro, 0, 0, 0);
	
	
	var initTime = Date.now(), mapping = {}, cache = {}, plugins = [],
		regJS = /\.js$/i, regCSS = /\.css$/i, curReq = null, initFn = [];
	var exp = {}, cfg = {}, wait = {}, alias = {}, isCfged = false, errorFn = {}, firstInit = true;
	
	function isArr(arr){return arr instanceof Array;}
	function sta(q){ return (typeof(q)=="string") ? [q] : (isArr(q) ? q : []); }
	function isFn(fn){return fn instanceof Function;}
	var isIE8 = (function(){ return doc.createEvent === void 0 ? true : false;}());
	
	function initAuto(main, exFn) {
		if(isFn(main)||getType(main)=="object"){
			exFn = main; main = null;
		} else if(arguments.length==1) return configEvent(main, '', getID());
		var id = getID(), rely = parseRely(main, exFn, id);
		if(isFn(exFn)||typeof(exFn)=="object"){
			initFn.push({mod: create(id, rely), fn: exFn});
		}
		if( isReady() ) globals.setTimeout( execute );
	};
	function $_define_(id/*id, rely, fn*/) {
		var fn, rely;
		if(isCfged) id = toVars(id);
		if(arguments.length > 2){
			rely = arguments[1];
			fn = arguments[2];
		} else fn = arguments[1];
		if(isFn(fn) && typeof(id)=='string'){
			mapping[id] = {mod: create(id, parseRely(rely, fn, id)), fn: fn};
		} else if(id) initAuto(id, fn);
	};
	$_define_.amd = $_define_.cmd = 'CMD + AMD';
	function $_require_(id) {
		id = toVars(id);
		if(cache[id]) return cache[id];
		var M = mapping[id], c;
		if(!M){
			if(!alias[id]) console.warn(id+'：Module is not define!');
			return;
		}
		c = M.mod.exports = {};
		cache[id] = M.fn.call(c, $_require_, c, M.mod) || M.mod.exports;
		delete mapping[id];
		return cache[id];
	};
	function Modules(id, rely){
		this.id = id || getID();
		this.rely = rely || '';
		if(isCfged) this.uri = alias[id] || '';
	}
	function getID(){
		for(var i = 0,id='ID'; i < 6; i++) id += Math.floor(Math.random() * 10);
		return id;
	}
	function create(id, rely){ return new Modules(id, rely); }
	function parseRely(urls, fn, id){
		if(!isCfged) return configEvent(urls, fn, id);
		urls = sta(urls);
		fn = fn.toString().replace(/(\/\*[\s\S]+?\*\/)|(\/\/.+)|['"`\s]/g, '')
		.replace(/{(\w+)}/g, function(o, v){return config.vars[v]||o});
		
		var reg;
		if(/^function|^asyncfunction/.test(fn)) reg = (/.+?\((.+?)[,)]/).exec(fn);
		else if(/^\(|^async\(/.test(fn)) reg = (/\((.+?)\){0,1}=>/).exec(fn);
		else if(fn.indexOf('async')==0) reg = (/^async(.+?)=>/).exec(fn);
		else reg = (/(.+?)=>/).exec(fn);
		
		if(!reg||reg[1].indexOf(')')==0) return urls;
		fn.replace(new RegExp(reg[1]+'\\((.+?)\\)','g'), function(a, w){urls.push(w)});
		preload(urls);
		return urls;
	}
	
	function configEvent(urls, fn, id){ wait[id] = {r:urls, fn:fn}; }
	function forWait(){
		var i , map, o, id, r;
		for (i = 0; i < initFn.length; i++) {
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
			if(map = mapping[i]){
				delete mapping[i];
				id = toVars(i);
				mapping[id] = {mod: create(id, r), fn: map.fn};
			}
		}
		wait = {};
		if( isReady() ) globals.setTimeout( execute );
	}
	function toVars(str){
		if(typeof(str)!="string") return str;
		return str.replace(/{(\w+)}/g, function(o, v){return cfg.vars[v]||o});
	}
	function tojs(src){
		if(/\.js$|\.css$/i.test(src)) return src;
		return src + '.js';
	}
	//预加载
	var preloadObj = {}, head = doc.querySelector('head');
	function preload(use, isLink, fn, erFn){
		use = sta(use);
		for (var i = 0; i < use.length; i++) {
			var url = use[i];
			url = alias[url] || url;
			if(preloadObj[url]) continue;
			if(mapping[url]) continue; //一个js有多个defind
			preloadObj[url] = url;
			if(!regCSS.test(url)) {
				plugins.push(url);
				if(isLink) errorFn[url] = erFn;
			} else {
				var es = doc.createElement('link');
				es.rel = 'stylesheet';
				es.type = 'text/css';
				es.href = url;
				head.appendChild(es);
			}
		}
		if( isFn(fn) ) initFn.push({mod: create(), fn: fn});
		if(curReq==null && plugins.length==0 && isLink) execute();
		if(curReq != null || plugins.length == 0) return;
		request();
	}
	function request() {
		var es = doc.createElement('script');
		curReq = plugins.shift();
		es.id = curReq;
		es.type = 'text/javascript';
		es.src = tojs(addBase(curReq));
		if(isIE8) es.onreadystatechange = onload;
		else es.onload = onload;
		es.onerror = errors;
		head.appendChild(es);
	}
	function onload(e) {
		if(isIE8){
			if(/loaded|complete/.test(this.readyState)) {
			} else return
		}
		this.onreadystatechange = this.onerror = this.onload = null;
		if(!cfg.debug) head.removeChild(this);
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
		if (  /complete|loaded/.test(doc.readyState) || (doc.readyState !== "loading" && !doc.documentElement.doScroll) ) {
			return curReq == null ? true : false;
		} else {
			doc.addEventListener( "DOMContentLoaded", DOMLoaded );
			globals.addEventListener( "load", DOMLoaded );
			return false;
		}
	}
	function execute() {
		// if(!isCfged) return;
		while(initFn.length > 0){
			if(curReq != null) return;
			var M = initFn.shift(), entry, c = M.mod.exports = {};
			if(!isFn(M.fn)) entry =  M.fn;
			else entry = M.fn.call(c, $_require_, c, M.mod) || M.mod.exports;
			if(isFn(entry.init)) entry.init();
			if(isFn(entry.events)) entry.events();
		}
		if(firstInit){
			firstInit = false;
			console.log('initScript: ', Date.now() - initTime);
		}
		errorFn = {};
	}
	function DOMLoaded() {
		doc.removeEventListener( "DOMContentLoaded", DOMLoaded );
		globals.removeEventListener( "load", DOMLoaded );
		if( isReady() ) globals.setTimeout( execute );
	}
	//配置
	var config = {
		base: location.href.match(/[^?#]*\//)[0], // 全局的基础路径
		paths: {}, // 路径配置
		alias: {}, // 别名配置
		vars: {}, // 变量配置
		preload: [], // 预加载项
		map: null, //映射配置[fn, arr[reg, str]]
		debug: false, charset: 'utf-8'
	};
	exp.define = $_define_;
	var $module = exp.$module = {
		init: function(rely, exFn){
			function keep(){
				if(!isCfged){
					$module.config({});
					isCfged = true;
				}
				var rely = sta(cfg.preload);
				if(rely.length){
					preload(rely, 'async', function(){
						forWait();
						initAuto(exFn);
					});
				} else {
					forWait();
					initAuto(exFn);
				}
			}
			if(arguments.length == 1) {
				exFn = rely; rely = null;
				keep();
			} else preload(rely, 'async', keep);
		},
		config: function(obj){
			if(getType(obj) != 'object') obj = {};
			cfg = copy({}, config, obj);
			cfg.map = isArr(obj.map) ? obj.map : null;
			var paths = cfg.paths, k, p;
			alias = {};
			for(k in cfg.alias){alias[toVars(k)] = cfg.alias[k];}
			cfg.alias = alias;
			
			if(typeof(cfg.base)=="string"){
				if( !(/\/$/.test(cfg.base)) ) cfg.base += '/';
			} else cfg.base = config.base;
			for(k in alias) {
				for(p in paths){
					var reg = new RegExp('^'+p);
					var uri = alias[k].replace(reg, paths[p]);
					if(alias[k] !== uri){
						alias[k] = uri; break;
					}
				}
				// alias[k] = addBase(parseCfgMap(alias[k]));
			}
			
			isCfged = true;
			if(cfg.debug) console.log('配置信息', cfg);
			return isCfged;
			// forWait();
		},
		// addConfig: function(obj){},
		require: $_require_
	};
	
	function parseCfgMap(uri) {
		var map = cfg.map, ret = uri;
		if (!map) return ret;
		for (var i = 0, len = map.length; i < len; i++) {
			var rule = map[i];
			ret = isFn(rule) ? (rule(uri) || uri) : uri.replace(rule[0], rule[1]);
			// Only apply the first matched rule
			if (ret !== uri) break;
		}
		return ret;
	}
	function addBase(refUri) {
		var reg = /^\.\/|^\.\.\/|^http|^file:/;
		if(reg.test(refUri)) return refUri;
		if (refUri.indexOf("//") === 0) {
			return location.protocol + refUri;
		}
		return refUri.replace(/^@\//, cfg.base);
	}

	Object.addProto(globals, exp, false);
	Object.setProto(Modules.prototype, 'loader', function (src, fn, erFn){
		preload(src, 'async', fn, erFn);
	}, false);
	$_define_('loader', function(){ return Modules.prototype.loader; });
	!function(){
		var tag = doc.scripts;
		tag = tag[tag.length-1];
		tag.parentNode.removeChild(tag);
	}();
}(window, document));
