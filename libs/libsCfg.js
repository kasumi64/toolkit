;(!function(require, exports, module) {
	var cfg = {
		// Sea.js 的基础路径
		base: './',
		// 路径配置
		paths: {
			P: './libs/plugins/',
			'JQ': './libs/JQ/'
		},
		// 别名配置
		alias: {
			kit: './frame/toolkit.js',
			bingo: 'P/observe_es6.js',
			jquery: 'JQ/jquery-3.3.1.js',
			initTag: './css/initTag.min.css',
			'{zhcn}': '被vars.locale替换'
		},
		// 变量配置
		vars: {
			'zhcn': 'locale'
		},
		// 映射配置
		map: [
			['http://example.com/js/app/', 'http://localhost/js/app/']
		],
		// 预加载项
		preload: ['initTag', 'kit'],
		// 调试模式
		debug: false,
		// 文件编码
		charset: 'utf-8'
	};
	$module.config(cfg);
	return 'config';
}());
