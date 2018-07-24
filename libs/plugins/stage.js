/*舞台
 * date 20180115
 */
define('stage', function (require, exports)
{
	var kit = require('main/kit'), _html = kit.html(),
		win = window, _stage = {constructor: 'Stage'};
	
	Object.addProto(_stage, 'constructor', 'Stage', false ,false ,false);
	Object.getSet(_stage, 'w', function(){ return win.innerWidth || _html.clientWidth; });
	Object.getSet(_stage, 'h', function(){ return win.innerHeight || _html.clientHeight; });
	Object.getSet(_stage, 'scrollT', {
		get: function(){ return _html.scrollTop; },
		set: function(val){ _html.scrollTop = val; }
	});
	Object.getSet(_stage, 'scrollL', {
		get: function(){ return _html.scrollLeft; },
		set: function(val){ _html.scrollLeft = val; }
	});
	Object.getSet(_stage, 'scrollW', function(){ return _html.scrollWidth; });
	Object.getSet(_stage, 'scrollH', function(){ return _html.scrollHeight; });
	Object.getSet(_stage, 'isEnd', function(){
		return (this.h + this.scrollT == this.scrollH) ? true : false;
	});
	return _stage;
});
