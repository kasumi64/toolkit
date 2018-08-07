/*
 * @author: kasumi;
 * @date: 20170814--20180308;
 */
define('main/globalVar', function(require, exports, module){
	return exports;
});
(function(){
	var lt = kitRequire('main/location'), config = {}, root;
	root = lt.projectName() == '/' ? lt.origin() : lt.root();
	config.paths = {
		libs: 		root + 'libs',
		jq:			root + 'libs/JQ',
		plugins:	root + 'libs/plugins',
		vue:		root + 'libs/vue',
		js:			root + 'js'
	};
	config.alias = {
		'{utils}':		'libs/utils.js',
		vue:            'vue/vue.min.js',
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
		observer:       'plugins/observer.js',
		getDate:        'plugins/getDate.js',
		http:			'plugins/httpRequest.js'
	};
	config.vars = {
		kit:	'main/kit',
		utils:	'main/utils'
	};
	initModule.config(config, 'babel');
}());
(function(globals){
	var k = kitRequire('main/kit')('html'), isAutoLoadJs = false, isRelativePath = true;
	switch (k.getAttr('auto')){
		case '0': case '': case 'false': isAutoLoadJs = false; break;
		case '1': case 'true': isAutoLoadJs = true; break;
		default: break;
	}
	if(isAutoLoadJs){
		var lt = kitRequire('main/location'), path, root = lt.root(),
			page = lt.pageName(1) || 'index';
		path = (isRelativePath ? './js/' : root + 'js/') + page;
		kitRequire('loader')(path);
		k = k.dispose(false);
	}
}(this));
