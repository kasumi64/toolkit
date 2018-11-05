/*
 * @author: leiguangyao;
 * @date: 20160902--20181018;
 */
;(function(doc){ //20180712
	'use strict';
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
	nativePro.addForin(Object, nativePro, false, false, false);
	nativePro = {};
	nativePro.inArray = function(obj) {
		var len = this.length, i;
		for(i=0; i<len && this[i]!==obj; i++);
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
	};
	Object.addForin(Array.prototype, nativePro, false, false);
	nativePro = {};
	/*保留几位小数*/
	nativePro.toFixNum = function(num) { return parseFloat(this.toFixed(num)); };
	Object.addForin(Number.prototype, nativePro, false, false);
	setProto = nativePro = null;
}(document));
(function (require, exports, module)
{
	'use strict';
	var doc = document, win = window, kit = ToolKit, //TODO
		_div = doc.createElement('div');
	var _utilArr = [], _utils = {};
	
	var _os = function ()
	{
		var ua = navigator.userAgent;
		if (/(iPhone|iPad|iPod|iOS)/i.test(ua)) {
			return 'ios';
		} else if (/(Android)/i.test(ua)) {
			return 'android';
		} else return 'pc';
	}();
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
			else if(el.clearEventListeners) el.clearEventListeners(type);
		} else if(_isArrayLike(el)){
			for (var i = 0, l = el.length; i < l; i++)
				_clearEvent(el[i], type, fn, bubble);
		}
	}
	function _isNode(el) { return el instanceof (win.Node || win.Element); }
	function _isFn(fn) { return (fn instanceof Function); }
	function _isObject(obj) { return kit.type(obj) == 'object'; }
	
/******************************************************************************/
	/**
	 * @description 工具主类
	 * @author leiguangyao
	 */
	function ToolKit(selector, el){return new _qs(selector, el);}
	ToolKit.isArrayLike = _isArrayLike;
	ToolKit.os = _os;
	ToolKit.isObject=_isObject;
	ToolKit.isFn=_isFn;
	ToolKit.stage = function() { return doc.compatMode === 'CSS1Compat' ? doc.documentElement: doc.body; };
	ToolKit.body = function() { return doc.body; }; //CSS1Compat, BackCompat
	ToolKit.html = function() { return doc.documentElement; };
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
	var _regTemplate = /{{(\w+)}}/g;//匹配{{***}}
	var _regSpace = /^\s+|\s+$/g;//去空格
	/**
	 * dom的动态拼接与赋值
	 * @param {Object} data 替换的数据,数组或{{}};
	 * @param {String} dom <template>标签的dom结构
	 * @param {Boolean} origin 是否保留dom结构的{{rep}}，默认false替换为''；
	 * @param {Boolean} getArr 为true时可返回数组，默认false返回str。
	 * @example <template id='tl'><p>{{rep}}</p></template>
	 * template({{rep:'我被替换了'}},tl.innerHTML);
	 */
	ToolKit.template = function(jsons, dom, origin, getArr){
		if(!(jsons instanceof Array)) jsons = [jsons];
		var temp = [], i, len = jsons.length, obj;
		dom = dom.replace(_regSpace,'');
		for (i = 0; i < len; i++) {
			obj = jsons[i];
			if(!(obj instanceof Array)){
				obj['_i_'] = i;
				temp.push(dom.replace(_regTemplate, replace));
				delete obj['_i_'];
			} else temp.push(kit.template(obj, dom, origin, getArr));
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
    		else if(w >= 770) html.style.fontSize = '102.4px';
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
	/** 核心DOM操作*/
	function _qs(selector, el)  //TODO
	{
		Object.addProto(this, 'length', 0, false, true, false);
		this.init(selector, el);
		
/******************************** 原型链 **********************************/
		if(_isFn(_qs.prototype.on)) return;
		var pro = _qs.prototype;
		pro.kit = ToolKit;
		
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
		
		/**简单的加入元素*/
		function _simpleAppend(el)
		{
			if(this.isNull()) return this;
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
		function _each(fn, params) {
			for (var i = 0; i < this.length; i++) fn.call(this,this[i],i,params);
			return this;
		}
		pro.append = _simpleAppend;
		pro.appendTo = function(els){
			var to = new _qs(els);
			if(to.isNull()) return this;
			to.append(this);
			return this;
		};
	/**********************************************/
		/*只删除元素*/
		pro.detach = function() {
			_each.call(this, function(el){ _div.appendChild(el); });
			_div.innerHTML = '';
			return this;
		};
		/*删除元素与事件*/
		pro.remove = function(deep) {
			this.detach();
			this.off(null, '', '', deep);
			return this;
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
		pro.each = function(fn) {
			for (var i = 0; i < this.length; i++)
				if(fn.call(this, this[i], i) === false) break;
			return this;
		};
		//通用事件
		function _simpleEvent(type, fn, clear, bubble){
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
		pro.dispose = function(deep){
			if(deep===true) this.remove(deep);
			else this.off();
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
	return win.kit = ToolKit;
}());