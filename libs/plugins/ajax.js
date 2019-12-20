/**
 * XMLHttpRequest, ajax请求，上传，下载
 * @author: leiguangyao;
 * @date: 20191213-20191219;
 * @version: 1.0.2;
 */
;( function( global, factory ) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = factory();
	} else if ( typeof define === "function" ) {
		define('ajax', factory);
	} else if ( typeof global === 'object' ) {
		global.$ajax = factory();
	} else {
		throw new Error( "plugin requires a Object." );
	}
}) ( window || this, function(require, exports, module){
	"use strict";
	var Promise = require('promise');
	var initHttp = function()
	{
		if(typeof(XMLHttpRequest)!="undefined"){
			return function(){return new XMLHttpRequest();}
		}else if(typeof(ActiveXObject)!='undefined'){//IE8.0以下
			return function(){
				var version=['MSXML2.XMLHttp.6.0',
				'MSXML2.XMLHttp.3.0',
				'MSXML2.XMLHttp'];
				for (var i = 0; i < 3; i++) {
					try{
						return new ActiveXObject(version[i]);
					}catch(e){};
				}
			}
		} else throw new Error('浏览器版本过低，或系统不支持XHR！');
	}();
	
	var ajax = {},  baseUrl = '';
	function getOption(opt){
		var arr = ('timeout,abort,loadstart,progress').split(',');
		var defaults = {
			responseType: 'text',
			timeout: 120 * 1000,
			method: 'GET', url: ''
		};
		var listener = {};
		for (var i = 0; i < arr.length; i++) {
			var key = arr[i];
			var fn = opt[key];
			if(fn) listener[key] = fn;
		}
		var option = {};
		option.responseType = getType(opt.dataType||'text');
		option.timeout = opt.timeout || 120 * 1000;
		option.method = getMethod(opt.method || 'GET');
		option.url = domain(opt.url);
		option.user = opt.user || '';
		option.password = opt.password || '';
		option.param = opt.param;
		option.upload = opt.upload;
		return {option: option, listener: listener};
	}
	function getType(type){
		var str = 'json,text,arraybuffer,blob,document'; // multipart/form-data
		type = type.toLocaleLowerCase();
		return str.indexOf(type)>-1 ? type : 'text';
	}
	function getMethod(type){
		var str = 'GET,POST,PUT,DELETE,OPTIONS,HEAD,PATCH,CONNECT'; // multipart/form-data
		type = type.toLocaleUpperCase();
		return str.indexOf(type)>-1 ? type : 'GET';
	}
	function domain(url){
		if(/^http|^file/.test(url)) return url;
		return baseUrl + (url||'');
	}
	
	ajax.baseUrl = function(base){
		baseUrl = base;
	}
	/**
	 * 
	 * */
	ajax.http = function(option, param, complete){
		var opt = getOption(urlToObj(option));
		param = param || opt.param;
		if(typeof(param)!="object") param = {};
		if(/^GET$/i.test(opt.option.method)){
			var url = opt.option.url;
			opt.option.url = getParam(url, param);
		}
		return new Promise(function(success, fail){
			request(opt, param, success, fail, complete);
			opt = param = null;
		});
		
	};
	
	function urlToObj(obj){
		if(typeof(obj)!="object"){
			var str = obj;
			obj = {url: str}
		}
		return obj;
	}
	
	function getParam(url, param){
		if(url.indexOf('?') == -1) url += '?';
		for (var k in param) {
			url += '&' + k + '=' + param[k];
		}
		url = url.replace(/&+/g, '&').replace(/\?&/, '?');
		return encodeURI(url);
	}
	
	ajax.post = function(option, param, complete){
		var opt = urlToObj(option);
		opt.method = opt.method || 'POST';
		return ajax.http(opt, param, complete);
	};
	
	ajax.get = function(option, param, complete){
		var opt = urlToObj(option);
		opt.method = 'GET';
		return ajax.http(opt, param, complete);
	};
	
	function request(option, param, success, fail, complete){
		var xhr = initHttp();
		// console.log(xhr);
		var opt = option.option, listener = option.listener;
		var method = opt.method;
		xhr.open(method, opt.url, true, opt.user, opt.password);
		xhr.responseType = opt.responseType;
		if(param instanceof FormData){
			// xhr.setRequestHeader('Content-Type', 'multipart/form-data;');
		} else if (method == 'GET'){
			xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
		} else xhr.setRequestHeader('Content-Type','application/json;charset=utf-8');
		xhr.setRequestHeader('Accept', 'application/json,text/plain;charset=utf-8');
		xhr.onreadystatechange = readystatechange;
		for(var k in listener) xhr['on'+k] = listener[k];
		// xhr.withCredentials = true;
		if(opt.upload) {
			var upload = xhr.upload;
			for(var k in opt.upload) upload['on'+k] = opt.upload[k];
			upload._field_ = opt.upload;
			if(opt.upload.progress instanceof Function){
				upload.onloadstart = uploadStart;
				upload.onprogress = uploadProgress;
			}
		}
		if(param instanceof FormData) xhr.send(param);
		else xhr.send(JSON.stringify(param));
		xhr._success_ = success;
		xhr._fail_ = fail;
		xhr._complete_ = complete;
		xhr = null;
	}
	function readystatechange(e){
		// console.log('readystatechange',e.target.readyState);
		var xhr = e.currentTarget, data;
		if( xhr.readyState != 4 ) return;
		if ( xhr.status == 200 ) {
			var type = xhr.getResponseHeader('Content-Type');
			data = xhr.response;
			if(/application\/json/i.test(type)) {
				try{
					data = JSON.parse(xhr.response)
				}catch(e){}
			}
			xhr._success_(data);
		} else if(xhr.status != 0){
			console.warn( 'error:', xhr.status, xhr.statusText );
			if(xhr._fail_ instanceof Function) xhr._fail_(e);
		}
		if(xhr._complete_ instanceof Function) xhr._complete_(data||e);
		delete xhr._success_;
		delete xhr._fail_;
		delete xhr._complete_;
		xhr = data = null;
	}
	ajax.download = function(option, param){
		var opt = urlToObj(option);
		opt.dataType = 'blob';
		return ajax.http(opt, param).then(function(response){
			var blob = new Blob([response]);
			var href = URL.createObjectURL(blob);
			var aTag = document.createElement('a');
			aTag.setAttribute('target', '_blank');
			aTag.href = href;
			// document.body.appendChild(aTag);
			// aTag.download = 'name.jpg'
			// aTag.click();
			// document.body.removeChild(aTag);
			return aTag;
		});
	};
	function uploadStart(e){
		this._field_.oldTime = Date.now();   //设置上传开始时间
		this._field_.oldLoad = 0; //设置上传开始时，以上传的文件大小为0
	};
	function uploadProgress(e){
		var field = e.target._field_, percent = 1, nowTime = Date.now();
		// console.log(field);
		if(e.lengthComputable){ //e.lengthComputable不为真，则e.total等于0
			percent = e.loaded / e.total;
		}
		var pertime = (nowTime - field.oldTime)/1000; //到现在的时间差,单位为秒
		field.oldTime = nowTime; //重新赋值时间，用于下次计算
		var perload = e.loaded - field.oldLoad; //计算该分段上传的文件大小，单位 b
		field.oldLoad = e.loaded; //重新赋值已上传文件大小，用以下次计算
		//上传速度计算
		var speed = perload/pertime; //单位b/s
		//剩余时间
		var restTime = ((e.total-e.loaded)/speed).toFixed(1);
		var units = 'b/s'; //单位名称
		if(speed > 1024){
			speed = speed/1024;
			units = 'k/s';
		}
		if(speed > 1024){
			speed = speed/1024;
			units = 'M/s';
		}
		speed = speed.toFixed(1);
		if(field.progress instanceof Function) field.progress(percent, speed+units, restTime, e);
	}
	ajax.upload = function(option, param){
		var opt = urlToObj(option);
		opt.method = opt.method || 'POST';
		if(!(param instanceof FormData)){
			var form = new FormData();
			form.append('file', param);
			param = form;
		}
		if(typeof(opt.upload)!="object")  opt.upload = {};
		return ajax.http(opt, param);
	};
	return ajax;
});

define('ttt', function(){
	return {ffdf:'7777'}
});