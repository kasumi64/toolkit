/**
 * 依赖配置
 */
;(!function(require, exports, module) {
	var cfg = {
		// Sea.js 的基础路径
		// base: 'http://',
		// 路径配置
		paths: {
			P: 		'./libs/plugins',
			JQ: 	'./libs/JQ',
			vue:	'./libs/vue',
			i18n:	'./language'
		},
		// 别名配置
		alias: {
			kit: 		'frame/toolkit.js',
			bingo:		'P/observe_es6.js',
			observer:	'p/observer_es5.js',
			forbid: 	'P/forbid.js', //检测控制台。
			getDate:	'P/getDate.js',
			ajax:		'P/ajax.js',
			http:		'P/httpRequest.js',
			promise:	'P/promise.js',
			broadcast:	'P/broadcast.js',
			renderData:	'vue/renderData.js',
			jquery: 	'JQ/jquery-3.3.1.js',
			banner:		'banner.js',
			
			
			initTag: 	'./css/initTag.min.css',
			i18n: 		'i18n/i18n.js',
			zh: 		'i18n/zh.js',
			en: 		'i18n/en.js',
			'{zhcn}': 	'被vars.locale替换',
			react: 		'frame/react.development.js',
			'react-dom':'frame/react-dom.development.js',
			babel:		'frame/babel.min.js'
		},
		// 变量配置
		vars: {
			'zhcn': 'locale'
		},
		// 预加载项
		preload: ['initTag', 'ajax'],
		// 映射配置
		// map: [
		// 	[ /(.*?)(\.js)$/i , '$1-debug.js'],
		// 	[ /(.*?)(\.js)$/i , '$1.mini.js']
		// ],
		// 调试模式
		debug: false
	};
	$module.config(cfg);
	
	return 'config';
}());

!function(){
	var mobile = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i;
	if (navigator.userAgent.match(mobile)) {
		console.log('移动端');
	}else{
		console.log('PC端');
	}
	// var html = document.documentElement;
	
}();
