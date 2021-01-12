// 简易的AMD模块化加载
// 2021-1-8, v1.1.20210112
;(function(win, doc){
	const initFn = [], map = {}, cache = {};
	var curReq, relyArr = [];

	function Module(id, fn){
		this.id = id;
		this.fn = fn;
		this.module = { exports:{} };
	}
	function isFn(fn){
		return typeof(fn) == 'function';
	}
	function isArray(arr){
		return Object.prototype.toString.call(arr) == '[object Array]';
	}
	/**
	 * id: string、[str]、function
	 * rely: string、[str]、function
	 * plugin: function
	 */
	function define(id, rely, plugin){
		var fn, length = arguments.length;
		if(length == 1){
			if( isFn(id) ) return nextTick(null, id);
			rely = id; id = null;
		} else if(length == 2){
			fn = rely;
			rely = null;
		} else {
			fn = plugin;
		}
		if( !isFn(fn) ) return;
		if( isArray(id) ) rely = id;
		else cache[id] = new Module(id, fn);
		
		if(rely) live(rely);
		nextTick(id, fn);
	}
	define.amd = define.cmd = 'CMD + AMD';
	win.define = define;
	
	function live(rely){
		let arr = isArray(rely) ? rely : [rely];
		let i, len = arr.length, path;
		for (i = 0; i < len; i++) {
			path = arr[i];
			if(!path || loaded[path]) continue;
			relyArr.push(path);
		}
	}
	
	function nextTick(id, fn){
		if(typeof(id) != 'string') initFn.push(new Module('auto', fn));
		if(!curReq) preload();
	}
	
	var loaded = {}, head = doc.querySelector('head');
	function preload(){
		let src = relyArr.shift();
		if(!src) return execute();
		loaded[src] = src;
		
		let es;
		if(isCss(src)) {
			es = doc.createElement('link');
			es.rel = 'stylesheet';
			es.type = 'text/css';
			es.href = src;
			head.appendChild(es);
			return onload();
		}
		curReq = src;
		es = doc.createElement('script');
		es.type = 'text/javascript';
		es.src = tojs(src);
		es.onload = onload;
		es.onerror = onload;
		head.appendChild(es);
	}
	function isCss(href){
		return /\.css$/i.test(href);
	}
	function tojs(src){
		if(/\.js$|\.css$/i.test(src)) return src;
		return src + '.js';
	}
	function onload(e) {
		if(e){
			this.onreadystatechange = this.onerror = this.onload = null;
			head.removeChild(this);
		}
		if(relyArr.length) {
			preload();
		} else {
			curReq = null;
			execute();
		}
	}
	
	function isReady(){
		if (  /complete|loaded/.test(doc.readyState) || (doc.readyState !== "loading" && !doc.documentElement.doScroll) ) {
			return curReq == null ? true : false;
		} else {
			doc.addEventListener( "DOMContentLoaded", DOMLoaded );
			win.addEventListener( "load", DOMLoaded );
			return false;
		}
	}
	function DOMLoaded() {
		doc.removeEventListener( "DOMContentLoaded", DOMLoaded );
		win.removeEventListener( "load", DOMLoaded );
		execute();
	}
	function execute() {
		if( !isReady() || curReq != null) return;
		var M
		while(M = initFn.shift()){
			let {fn, module} = M;
			let entry = fn(require, module) || module.exports;
			if( isFn(entry.init) ) entry.init();
			if( isFn(entry.events) ) entry.events();
		}
	}

	function require(id){
		var js = map[id];
		if(!js) {
			let c = cache[id];
			if(c) js = map[id] = c.fn(require, c.module) || c.module.exports;
			delete cache[id]; 
		}
		return js;
	};

})(window, document);
