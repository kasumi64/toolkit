/*
 * 观察者模式
 * @author: leiguangyao;
 * @date: 20170706-20180816;
 */
;define('observer_es5', function (require, exports)
{
	function Observer()
	{
		if(arguments[0] !== '6KeC5a+f6ICF'){
			throw new Error('Observer is a single, Please use "getInstance()" method.');
			return;
		}
		var dictionary = {};
		
		function bingo(master, fn){
			if(!(typeof master == 'string'&&fn instanceof Function)) return false;
			if(!dictionary[master]) dictionary[master] = [];
			if(isHas(fn, dictionary[master])) return false;
			return true;
		}
		function isHas(fn, arr){
			var i, len = arr.length;
			for(i=0; i<len && arr[i]!==fn; i++);
			return !(i==len);
		}
		//绑定
		this.on = function(master, fn)
		{
			if(!bingo(master, fn)) return this;
			dictionary[master].push({once: false, fn: fn});
			return this;
		};
		//解绑
		this.del = function(master, fn)
		{
			var keyCode = dictionary[master];
			if(!(keyCode != null&&fn instanceof Function)) return console.warn('DelBinding is fail!');
			var index = keyCode.indexOf(fn);
			if(index == -1) return this;
			keyCode.splice(index, 1);
			return this;
		};
		//执行回调，第一个入参为主码(必须的)，其它的为子码。
		this.emint = function(master/*,[...args]*/)
		{
			var dict = dictionary[master], o;
			if( !dict ) return;
			for (var i = 0; i < dict.length; i++) {
				o = dict[i];
				o.fn.apply(o, arguments);
				if(o.once){
					dict.splice(i, 1);
					i--;
				}
			}
			return this;
		};
		this.once = function(master, fn)
		{
			if(!bingo(master, fn)) return this;
			dictionary[master].push({once: true, fn: fn});
			return this;
		};
		//清除master主码
		this.clear = function(master) { delete dictionary[master]; return this; };
	}
	var instance; //单例
	function getInstance(){
		if(instance == void 0) instance = new Observer('6KeC5a+f6ICF');
		return instance;
	}
	return getInstance();
});
