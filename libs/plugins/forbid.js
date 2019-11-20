;( function( global, factory ) {
	if ( typeof module === "object" && typeof module.exports === "object" ) {
		module.exports = factory();
	} else if ( typeof define === "function" ) {
		define(factory);
	} else if ( typeof global === 'object' ) {
		global.kit = factory();
	} else {
		throw new Error( "plugin requires a Object." );
	}
}) ( window || this, function(require, exports, module)
{
	window.onkeydown = window.onkeyup = window.onkeypress = function (event) {
		// F12键码为123
		if (event.keyCode === 123) {
			event.preventDefault(); // 阻止默认事件行为
			window.event.returnValue = false;
		}
	}
	//禁止ctrl+S保存功能
	window.addEventListener('keydown', function (e) {
		if(e.keyCode == 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)){
			e.preventDefault();
		}
	});
	//禁止ctrl+C保存功能
	window.addEventListener('keydown', function (e) {
		if(e.keyCode == 67 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)){
			e.preventDefault();
		}
	});
	// 禁用菜单右键！
	window.oncontextmenu = function() {
		event.preventDefault();
		return false;
	}
	 // 无限回写，阻碍调试
	var x = document.createElement('div');
	var isOpening = false;
	Object.defineProperty(x, 'id', {
	  get:function(){
		 console.log("你打开了控制台");
		  window.location.reload()
	  }
	});
	console.info(x);
});