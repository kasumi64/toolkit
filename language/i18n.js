;( function( global, factory ) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = factory();
	} else if ( typeof define === "function" ) {
		define('i18n', factory);
	} else if ( typeof global === 'object' ) {
		global.kit = factory();
	} else {
		throw new Error( "plugin requires a Object." );
	}
}) ( window || this, function(require, exports, module)
{
	var i18n = {}, key = 'language', local = 'zh';
	var internationalization = {
		zh: require('zh'), 
		en: require('en')
	};
	
	i18n.local = (function(val, k){
		if(window.localStorage){
			return function(val, k){
				key = k || 'language';
				localStorage.setItem(key, val);
				sessionStorage.setItem(key, val);
			}
		} else {
			return function(val, k){
				key = k || 'language';
				var cookie = document.cookie;
				if(cookie){
					if( !(/;$/.test(cookie)) ) cookie += ';';
					cookie += key+'='+val;
					document.cookie = cookie;
				} else {
					document.cookie = key+'='+val;
				}
			}
		}
	}());
	i18n.language = (function(){
		if(window.localStorage){
			return function(){
				return local = localStorage.getItem(key) || sessionStorage.getItem(key) || 'zh';
			}
		} else {
			return function(){
				var arr = document.cookie.split(';'), len = arr.length, tem;
				for (var i = 0; i < len; i++) {
					tem = arr[i].split('=');
					if(tem[0] == key){
						local = tem[1] || 'zh';
						break;
					}
				}
				return local;
			}
		}
	}());
	function getWords(){
		return internationalization[i18n.language()];
	};
	function $t(str){ // i18n.$t('tips.btn');
		var lang = getWords(), k;
		var arr = str.split('.'), len = arr.length;
		for (var i = 0; i < len; i++) {
			k = arr[i];
			lang = lang[k];
			if (lang == void 0) return '';
		}
		return lang;
	};
	i18n.$t = $t;
	i18n.translate = function(html, keys){
		var outer, lang = getWords(), name = keys || 'i18n';
		//获取需要翻译的容器及组件
		if(/<[^<>]+>/.test(html)){
			var outer = document.createElement('div');
			outer.innerHTML = html;
		} else outer = document;
		var els = outer.querySelectorAll('[' + name + ']');
		var i, el;
		for (i = 0; i < els.length; i++) {
			el = els[i];
			// var arr = /\{.+?\}/.exec(el.innerHTML);
			el.innerHTML = $t(el.getAttribute(name));;
		}
		if(!keys) {
			els = outer.querySelectorAll('[placeholder]');
			for (i = 0; i < els.length; i++) {
				el = els[i];
				el.setAttribute('placeholder', $t(el.getAttribute('placeholder')) );
			}
		}
		return outer.innerHTML;
	};
	
	return i18n;
});