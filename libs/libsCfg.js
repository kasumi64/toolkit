;(!function(require, exports, module) {
	var cfg = {
		// Sea.js 的基础路径
		base: './',
		// 路径配置
		paths: {
			P: './libs/plugins/',
			JQ: './libs/JQ/',
			i18n: './language/'
		},
		// 别名配置
		alias: {
			kit: './frame/toolkit.js',
			bingo: 'P/observe_es6.js',
			jquery: 'JQ/jquery-3.3.1.js',
			forbid: 'P/forbid.js',
			initTag: './css/initTag.min.css',
			i18n: 'i18n/i18n.js',
			zh: 'i18n/zh.js',
			en: 'i18n/en.js',
			'{zhcn}': '被vars.locale替换'
		},
		// 变量配置
		vars: {
			'zhcn': 'locale'
		},
		// 预加载项
		preload: ['initTag', 'kit', 'i18n'],
		// 映射配置
		map: [
			[ /(.*?)(\.js)$/i , '$1-debug.js'],
			[ /(.*?)(\.js)$/i , '$1-mini.js']
		],
		// 调试模式
		debug: false
	};
	$module.config(cfg);
	return 'config';
}());
