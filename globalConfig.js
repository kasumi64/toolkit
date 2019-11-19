/*
 * @author: kasumi;
 * @date: 20170814--20180308;
 */
define('main/globalVar', function(require, exports, module){
	return exports;
});
(function(){
	var lt = $module.require('main/location'), config = {}, root;
	root = lt.projectName() == '/' ? lt.origin() : lt.root();
	config.paths = { //路径前缀
		libs: 		root + 'libs',
		jq:			root + 'libs/JQ',
		plugins:	root + 'libs/plugins',
		vue:		root + 'libs/vue',
		js:			root + 'js'
	};
	config.alias = { //别名
		'{utils}':		'libs/utils.js',
		vue:            'vue/vue.min.js',
		renderData: 	'vue/renderData.js',
		jquery1:        'jq/jquery-1.12.4.min.js',
		jquery2:        'jq/jquery-2.2.4.min.js',
		jquery3:        'jq/jquery-3.3.1.min.js',
		'jq/qrlogo':	'jq/jquery.qrcode.logo.min.js',
		'jq/qrcode':	'jq/jquery.qrcode.js',
		qrcode:			'jq/qrcode.js',
		baiduMap:       'js/baiduMap.js',
		jweixin:        'js/jweixin-1.2.0.js',
		slip:           'js/slip.min.js',
		babel:          'plugins/babel.min.js', //转ES6
		AES:            'plugins/aes.js',    //AES加密
		scrollPage:     'plugins/scrollPage.js',
		scrollMobile:   'plugins/scrollMobile.js',
		stage:          'plugins/stage.js',
		hitTest:        'plugins/hitTest.js',
		observe:		'plugins/observe_es6.js',
		observer_es5:   'plugins/observer_es5.js',
		getDate:        'plugins/getDate.js',
		http:			'plugins/httpRequest.js',
		broadcast:		'plugins/broadcast.js',
		banner:			'banner.js'
	};
	config.vars = { //键名
		kit:	'main/kit',
		utils:	'main/utils'
	};
	$module.config(config, 'babel');
}());
(function(globals){
	var k = $module.require('main/kit')('html'), isAutoLoadJs = false, isRelativePath = true;
	switch (k.getAttr('auto')){
		case '0': case '': case 'false': isAutoLoadJs = false; break;
		case '1': case 'true': isAutoLoadJs = true; break;
		default: break;
	}
	if(isAutoLoadJs){
		var lt = $module.require('main/location'), path, root = lt.root(),
			page = lt.pageName(1) || 'index';
		path = (isRelativePath ? './js/' : root + 'js/') + page;
		$module.require('loader')(path);
		k = k.dispose(false);
	}
}(this));
