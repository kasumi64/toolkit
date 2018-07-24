//闰年
function isLeapyear(y){ return (y>0) && !(y%4) && ((y%100) || !(y%400)); }
//$.when().done().fail().then().always();

	var browser = {};
	browser.name = (function(){
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
	browser.IEVersion = (function(){
		var v = 0;
		navigator.userAgent.replace(/MSIE (.+?);/, function(a, b){v = b;});
		return parseFloat(v);
	}());

/* by zhangxinxu 2013-09-30 */
	(function() {
	    var lastTime = 0;
	    var vendors = ['webkit', 'moz'];
	    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
	        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // name has changed in Webkit
	                                      window[vendors[x] + 'CancelRequestAnimationFrame'];
	    }
	
	    if (!window.requestAnimationFrame) {
	        window.requestAnimationFrame = function(callback, element) {
	            var currTime = new Date().getTime();
	            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
	            var id = window.setTimeout(function() {
	                callback(currTime + timeToCall);
	            }, timeToCall);
	            lastTime = currTime + timeToCall;
	            return id;
	        };
	    }
	    if (!window.cancelAnimationFrame) {
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	        };
	    }
	}());

	/*保留几位小数*/
	nativePro.toFixNum = function(num) {
		num = parseInt(num);
		num = num >= 1 ? num : 2;
		var x = Math.pow(10, num);
		return Math.round(this * x)/x;
	};

var _screenW, _dips;
	/** 自适应字体 */
	ToolKit.screenFix = function (isI6, dips){
    	_dips = (typeof(dips)=="number"&&dips>2) ? dips : 2;
    	_screenW = (typeof(isI6)=="number") ? isI6 : (isI6 === false) ? 320 : 375;
    	_rem();
    	_addEvent(window,'resize', _rem);
    	return this;
    }
	ToolKit.offFix = function() { _clearEvent(window,'resize', _rem); return this; };
	function _rem(e){
		var w = _os=='pc'?win.innerWidth:Math.min(win.innerWidth, win.innerHeight),
    		html = doc.querySelector('html'),
    		fix = w / _screenW * 100 / _dips;
    	if(_os == 'pc'){
    		if(w > 750) html.style.fontSize = 200/_dips+'px';
    		else html.style.fontSize = fix + 'px';
    	} else {
    		if(w > 576) html.style.fontSize = 153.6/_dips+'px';
    		else html.style.fontSize = fix + 'px';
    	}
	}
	
	/*任意进制加密*/
	function _EnChTo(txt,h) {
		var monyer = '', i = 0, s = txt.length;
		for(; i < s; i++)
			monyer += "　" + txt.charCodeAt(i).toString(h);
		return monyer;
	}
	/*任意进制解密*/
	function _DeChTo(txt,h) {
		var monyer = '', s = txt.split("　");
		for(var i = 1, len = s.length; i < len; i++)
			monyer += String.fromCharCode(parseInt(s[i], h));
		return monyer;
	}
	

/***************************************************/
function trace(type)
	{
		if(_os != 'pc') {
			var popups = trace.popups, log;
			if(popups == null){
				var dom = '<div id=popups style="display: block;position: fixed;top: 0;left: 0;'+
					'background-color: rgba(0,0,0,0.4);	color: #0FF;font-size: 14px;line-height: 16px;">'+
					'<button>点击关闭</button><div id="traceLog"></div></div>';
				_div.innerHTML = dom;
				popups = trace.popups =  _div.querySelector('#popups');
				popups.querySelector('button').onclick = function(){
					popups.log.innerHTML = '';
					if(popups.parentNode) popups.parentNode.removeChild(popups);
				};
				popups.log = popups.querySelector('#traceLog');
			}
			log = popups.log;
			var con = '', len = arguments.length;
			for (var i = 0; i < len; i++){
				if(i%2==0) con += '<br/>';
				con +=arguments[i] + '　';
			}
			log.innerHTML += con;
			kit.body().appendChild(popups);
		} else {
			try{
				if(console[type])
					console[type].apply(console,arguments);
				else console.trace.apply(console,arguments);
			}catch(e){}
		}
	};
	trace.popups = null;
	win.log = trace;