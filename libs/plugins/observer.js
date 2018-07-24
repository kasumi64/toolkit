/*
 * 观察者模式
 * @author: leiguangyao;
 * @date: 20170706;
 */
;define('observer', function (require, exports)
{
	function Observer()
	{
		if(arguments[0] !== '6KeC5a+f6ICF'){
			throw new Error('Observer is a single, Please use "getInstance()" method.');
			return;
		}
		var dictionary = {};
		//绑定
		this.addBinding = function(master, fn)
		{
			if(!(typeof master == 'string'&&fn instanceof Function)) return console.warn('Binding is fail!');
			var dict = dictionary;
			if(!dict[master]) dict[master] = [];
			if(dict[master].inArray(fn)) return console.warn('Binding has existed!');
			dict[master].push(fn);
			return this;
		};
		//解绑
		this.delBinding = function(master, fn)
		{
			var dict = dictionary, keyCode = dict[master];
			if(!(keyCode != null&&fn instanceof Function)) return console.warn('DelBinding is fail!');
			var index = keyCode.indexOf(fn);
			if(index == -1) return this;
			keyCode.splice(index, 1);
			console.log('delBinding is succeed.');
			return this;
		};
		//执行回调，第一个入参为主码(必须的)，其它的为子码。
		this.execute = function(/*[...args]*/)
		{
			var args = arguments, master = args[0],
				dict = dictionary;
			if(!dict[master]) return console.warn('execute "'+ master+'" is no Binding!');
			dict[master].forEach(function(fn){
				fn.apply(fn, args);
			});
			return this
		};
		//清除master主码
		this.clearMasterKey = function(master) { delete dictionary[master]; return this; };
//		this.getDictionary = function(){return dictionary};
	}
	var instance; //单例
	function getInstance(){
		if(instance == void 0) instance = new Observer('6KeC5a+f6ICF');
		return instance;
	}
	return getInstance;
});
