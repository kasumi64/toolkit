

;define('fetch', function (require, exports, module)
{
	function HttpFetch(){
		//一个配置项对象，包括所有对请求的设置。可选的参数有：
		//method: 请求使用的方法，如 GET、POST。
		//headers: 请求的头信息，形式为 Headers 的对象或包含 ByteString 值的对象字面量。
		//body: 请求的 body 信息：可能是一个 Blob、BufferSource、FormData、URLSearchParams 或者 USVString 对象。注意 GET 或 HEAD 方法的请求不能包含 body 信息。
		//mode: 请求的模式，如 cors、 no-cors 或者 same-origin。
		//credentials: 请求的 credentials，如 omit、same-origin 或者 include。为了在当前域名内自动发送 cookie ， 必须提供这个选项， 从 Chrome 50 开始， 这个属性也可以接受 FederatedCredential 实例或是一个 PasswordCredential 实例。
		//cache:  请求的 cache 模式: default 、 no-store 、 reload 、 no-cache 、 force-cache 或者 only-if-cached 。
		//redirect: 可用的 redirect 模式: follow (自动重定向), error (如果产生重定向将自动终止并且抛出一个错误), 或者 manual (手动处理重定向). 在Chrome中，Chrome 47之前的默认值是 follow，从 Chrome 47开始是 manual。
		//referrer: 一个 USVString 可以是 no-referrer、client或一个 URL。默认是 client。
		//referrerPolicy: Specifies the value of the referer HTTP header. May be one of no-referrer、 no-referrer-when-downgrade、 origin、 origin-when-cross-origin、 unsafe-url 。
		//integrity: 包括请求的  subresource integrity 值 （ 例如： sha256-BpfBw7ivV8q2jLiT13fxDYAe2tJllusRSZ273h2nFSE=）。
		//返回值
		//一个 Promise，resolve 时回传 Response 对象。
		if(typeof(this.request)=="function") return;
		var P = HttpFetch.prototype;
		P.request = function(url, options){
			options = {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"// GET
				},
				body: "firstName=Nikhil&favColor=blue&password=easytoguess"
			}
		};
		P.get = function(url, options){
			
		};
		var myHeaders = new Headers();
		myHeaders.set('Content-Type', 'application/json;charset=utf-8');//服务器 multipart/form-data
		myHeaders.set('Accept', 'application/json, text/plain, */*');//web端
		P.json = function(url, param, fn){
			options = {
				method: "POST",
				mode: 'cors',
				credentials: 'omit',
				headers: {
					"Content-Type": "application/json;charset=utf-8",
					"Accept": "application/json, text/plain, */*",
				},
				body: JSON.stringify(param)
			}
			fetch(url, options).then(function(response){
				if(response.status==200) return response.json();
			}).then(function(data){
				fn(data.lists||data);
			}).catch(function(e){
				console.warn('response is not JSON!');
			});
		};
	}
	return function(){ return new HttpFetch(); };
});

define('XHR', function (require, exports, module)
{
	function HttpRequest()
	{
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
		/**
		 * 可多线并发http请求。
		 * @param  {String} url：  请求地址。
		 * @param  {Function} func：  回调函数。
		 * @param {Object} valObj：{
		 * 					url:'',
		 * 					args:成功回调函数的入参，为数组[],
		 * 					success:成功回调,
		 * 					method:请求类型'为'或'post'，默认'get',
		 * 					param:'post'传参,Object{key:value},
		 * 					progress:获取请求过程中的信息,
		 * 					error:当请求发生错误时调用该方法，
		 * 					loadstart:当一个HTTP请求开始加载数据时调用,
		 * 					load:当一个HTTP请求正确加载出内容后返回时调用。,
		 * 					loadend:当内容加载完成，不管失败与否，都会调用该方法,
		 * 					abort:当请求失败时调用该方法,
		 * 					timeout:当时间超时时调用,
		 * 					time:设超时时间,
		 * 					requestHeader:,
		 * 				};
		 * 				如果为数组,侧为回调函数的入参。
		 * @example
		 * var obj = {args:['回调函数','函数入参'],method:'get',param:{key:'value'},
		 * 			progress:fn,
		 * 			};
		 * newRequest('http://127.0.0.1:8020/test/confing/load.txt',obj,fn);
		 */
		function newRequest(url,valObj,func)
		{
			var fn, params;
			if(_isObject(url)){
				params = url, url = params.url;
				fn = (valObj instanceof Function) ? valObj : params.success;
			}else if(valObj instanceof Function){
				fn = valObj, params = {};
			} else {
				if(_isObject(valObj)){
					params = valObj;
					fn = (func instanceof Function) ? func : params.success;
				}else if(valObj instanceof Array){
					params = {args:valObj};
					fn = func;
				} else return console.warn('valObj入参不正确!');
			}

			var httpXml = initHttp();
			var method = params.method == 'post' ? 'post' : 'get';
			var args = params.args ? params.args : [];
			httpXml.onreadystatechange = result(fn,args);
			httpXml.onprogress = progress(params.progress);
//			httpXml.responseType = 'json';
			
			httpXml.onerror = callback(params.error,args);
			httpXml.onloadstart = callback(params.loadstart,args);
			httpXml.onload = callback(params.load,args);
			httpXml.onloadend = callback(params.loadend,args);
			httpXml.ontimeout = callback(params.timeout,args);
			httpXml.onabort = callback(params.abort,args);
			
			var val = setEncode('',params.param);
			var index = url.indexOf('?'),
				oldUrl = url, sub;
			if(index > 0){
				url = oldUrl.substring(0, index);
				if(method=='get'){ //有?
					sub = oldUrl.substring(index);
					url += sub;
					if(val != '') url += '&' + val;
					url += '&rand=' + parseInt(Math.random() * 1000);
				} else { //无？
					sub = oldUrl.substring(index + 1);
					val = (val!='') ? sub +'&'+ val : sub;
				}
			} else if(val != ''){
				url += '?'+ val +'&rand='+parseInt(Math.random() * 1000);
			} else url += '?rand=' + parseInt(Math.random() * 1000);
			
			//httpXml.open(method,url,true,username,password);
			httpXml.open(method,url,true);
			if(method == 'get'){
				httpXml.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
				httpXml.send(null);
			} else {
				httpXml.setRequestHeader('Content-Type','application/json;charset=utf-8');
				httpXml.setRequestHeader('Accept', 'application/json, text/plain, */*');
				httpXml.send(JSON.stringify(params.param));
			}
			httpXml.timeout = params.time||15000;
		}
		/**
		 * 编码请求的入参。
		 * @param {String} url    地址，为''时只编码参数。
		 * @param {Object} object {name：'名字'}
		 * @param {Boolean} pass   默认false为不加密，true为加密。
		 */
		function setEncode(url,object,pass)
		{
			url += (url!=''&&url.indexOf('?') == -1) ? '?' : '';
			for (var str in object){
				url += pass !== true ? str+'='+object[str]+'&' :
					encodeURIComponent(str)+'='+encodeURIComponent(object[str])+'&';
			}
			return url.substr(0, url.length-1);
		}
		function callback(fn,args)
		{
			if(!(fn instanceof Function)) return;
			return function(e){
				fn.apply(fn, [e].concat(args));
			};
		}
		function result(fnt,args)
		{
			return function(e)
			{
				if(this.readyState != 4) return;
				if(this.status == 200||this.status==0){
					if(fnt instanceof Function)
						fnt.apply(fnt, [this.responseText,e].concat(args));
				} else {
					console.error('请求错误:',this.status,this.statusText);
					this.abort();
				}
			};
		}
		function progress(fn)
		{
			if(!(fn instanceof Function)) return;
			return function(e)
			{
				if(!e.lengthComputable) return;
				var permillage = (e.loaded/e.total).toFixNum(3);
				fn.call(fn,permillage,e);
			};
		}
		/**
		 * 上传，未完成！！！！！！！！！
		 * @param {String} url
		 * @param {Object} valObj
		 */
		function upload(url,valObj)
		{
			if(!valObj||valObj.constructor.name!='Object')
				return console.error('valObj入参不正确!');
			var xhr = initHttp().upload;
			var args = valObj.args ? valObj.args : [];
			xhr.onerror = callback(valObj.error,args);
			xhr.onloadstart = callback(valObj.loadstart,args);
			xhr.onprogress = callback(valObj.progress,args);
			xhr.onload = callback(valObj.load,args);
			xhr.onloadend = callback(valObj.loadend,args);
//			var bitArr = Uint8Array
		}
		
		this.request = newRequest;
		this.upload = upload;
	}
	function _isObject(obj){
		return typeof(obj)=="object";
	}
/***********************************************************************/
	var exp = {};
	var _http = new HttpRequest();
	exp.ajax = _http.request;
	exp.ajaxJson = function(url,valObj,func)
	{
		var fn, param = [];
		if(_isFn(valObj)) fn = valObj;
		else if(valObj&&!(valObj instanceof Array))
			param = [valObj];
		this.ajax(url,function(result)
		{
			try{//JSON.stringify();
				fn.apply(fn, [JSON.parse(result)].concat(param));
			}catch(e){
				console.error('JSON解析出错:',result+'\n',e);
			}
		});
	};
	var _regbody = /<body[\S\s]+body>/i;//body里的内容
	/**
	 * 加载外部html/<body[^>]+>|<\/body>/ig
	 * @param {String} url 加载路径
	 * @param {String} selector 页面容器
	 * @param {Function} func
	 */
	exp.ajaxHtml = function(url,selector,func)
	{
		var wrap = _getElms(selector)[0];
		if(!wrap) wrap = kit.body();
		this.ajax(url,function(result)
		{
//			var args = _utilArr.slice.call(arguments);
			wrap.innerHTML = '';
			var dom = _regbody.exec(result);
			if(dom) dom = dom[0];
			_div.innerHTML = dom;
			dom = _utilArr.slice.call(_div.children);
			for (var i = 0; i < dom.length; i++)
				wrap.appendChild(dom[i]);

			_div.innerHTML = result;
			var tags = _getElms('link',_div);
			tags = tags.concat(_getElms('style',_div));
			for (i = 0; i < tags.length; i++)
				wrap.appendChild(tags[i]);

			tags = _getElms('script',_div);
			for (i = 0; i < tags.length; i++){
				if(tags[i].src){
					kit.loadScript(tags[i].src,wrap);
				} else {
					if(tags[i].type != 'text/template'){
						win.eval(tags[i].innerHTML);
					} else wrap.appendChild(tags[i]);
				}
			}
//			args.splice(0,1);
			kit.ready(func);
		});
	};
	return exp;
});
