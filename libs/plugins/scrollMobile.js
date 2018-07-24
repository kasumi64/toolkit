;define('dragCtrl', function (require, exports)
{
	var kit = require('main/kit');
	/**
	 * @description 'transform'拖动。
	 * public，default，protected，private,internal
	 * @param  {String} selector	拖动层ID;
	 * @date: 20170405-2018030;
	 */
	function DragCtrl(selector, unlimit)
	{
		var _this = this, doc = kit(document), _drag = kit(selector);
		var reg = /{(\w+)}/g,	//匹配{***}
			translate = 'translate({x}px,{y}px)',
			end = trans = {x:0, y:0},
			regMat = /\((\d.+)\)/;//数字
		var dwFn, upFn, moFn, ckFn, offset, first,
			dist = {}, max, min, Xaxis, Yaxis;
		var tf = 'transform';
	
		function resize(e){
			var mask = _drag[0].parentNode==kit.body() ? kit.html() : kit(_drag[0].parentNode)[0];
			offset = {x: _drag[0].offsetLeft, y: _drag[0].offsetTop};
			var dwh = _drag.getStyle({w: 'width', h: 'height'}, true);
			max = {x: mask.scrollWidth - dwh.w - offset.x, y: mask.scrollHeight - dwh.h - offset.y};
			min = {x: -offset.x, y: -offset.y};
		}
		this.resize = resize;
		(function()
		{
			resize();
			_drag.down(onStart).click(onClick);
			window.addEventListener('resize', resize, false);
			if(_drag.getStyle(tf) == 'none') _drag.css(tf, shifting(trans));
		}());
		function shifting(obj){
			return translate.replace(reg, function(rep, val) { return obj[val]; });
		}
		//转换内部坐标
		function transform(obj){
			if(!obj){
				var matrix = _drag.getStyle(tf);
				var arr = regMat.exec(matrix)[1].split(',');
				return {x: parseInt(arr[4]), y: parseInt(arr[5])};
			} else _drag.css(tf, shifting(obj));
		}
		function compat(obj){
			if(obj) _drag.css({left: obj.x, top: obj.y});
			else return _drag.getStyle({x:'left', y:'top'}, true);
		}
		this.transform = transform;
		this.useIE = function(bl){
			if(_drag.getStyle('left') == 'auto') _drag.css({left: 0, top: 0});
			this.transform = bl === false ? transform : compat;
		}
		function onStart(e){
			e.param = first = kit.mouse(e);
			trans = _this.transform();
			dist.x = first.x - offset.x;
			dist.y = first.y - offset.y;
			doc.move(onMoving).up(onEnd);
			if(isFn(dwFn)) dwFn.call(e.currentTarget, e);
		}
		function onMoving(e){
			kit.defaultEvent(e, false, 1);
			e.param = end = kit.mouse(e);
			end.x = end.x - offset.x - dist.x + trans.x;
			end.y = end.y - offset.y - dist.y + trans.y;
			if(_rebound){
				if(Yaxis) end.x = 0;
				if(Xaxis) end.y = 0;
				_this.transform(end);
			} else rebound();
			if(isFn(moFn)) moFn.call(_drag, e);
		}
		function onEnd(e){
			doc.move(onMoving, true).up(onEnd, true);
			if(unlimit !== true) rebound();
			e.param = kit.mouse(e);
			if(isFn(upFn)) upFn.call(_drag, e);
		}
		function onClick(e){
			if(isFn(ckFn)) ckFn.call(e.currentTarget, e);
		}
		var _rebound = true;
		//反弹
		function rebound(){
			var point = {};
			point.x = end.x < min.x ? min.x : (end.x > max.x ? max.x : end.x);
			point.y = end.y < min.y ? min.y : (end.y > max.y ? max.y : end.y);
			_this.transform(point);
			return point;
		}
		//false不能拖出屏幕,true可以,默认true。
		this.enabledRebound = function(bool){
			if(typeof(bool)=="boolean") _rebound = bool;
			return _rebound;
		};
		function isFn(fn){ return fn instanceof Function; }
		this.down = function(fn) { dwFn = fn; };
		this.move = function(fn) { moFn = fn; };
		this.up = function(fn) { upFn = fn; };
		this.click = function(fn) { ckFn = fn; };
		this.setLimit = function(isY_axis){
			if(isY_axis === true) Xaxis = !(Yaxis = true);
			else  Xaxis = !(Yaxis = false);
		};
		this.dispose = function(){
			if(_drag == null) return;
			_drag.down(onStart, true).click(onClick, true);
			window.removeEventListener('resize', resize, false);
			_this = dwFn = upFn = ckFn = moFn = null;
			doc = _drag = first = max = min = offset = null;
		};
	}
	return function(selector, unlimit){ return new DragCtrl(selector, unlimit); };
});

/*****************************************************************/
define('dragPage', function (require, exports)
{
	var kit = require('main/kit'),
		dragCtrl = require('dragCtrl');
	function DragPage (selector, speed)
	{
		var _this = this, _super = dragCtrl(selector, true),
			_drag = kit(selector), parent = kit(_drag[0].parentNode),
			timer = kit.timer(), count = 0, child, currt,
			_maxPage = _drag[0].children.length - 1,
			_speed = typeof(speed)=="number" ? speed : 500;
		var dwFn, upFn, moFn, ckFn, wh, first, start,
			isNext, Xaxis, _fxOff = false, clone = {};
		var navDot, _cyclic;//循环
		
		this.setYaxis = function(isY_axis){
			_super.setLimit(isY_axis);
			if(isY_axis === true){
				Xaxis = false;
				parent.css({overflowY: 'hidden'});
				_drag.css({whiteSpace: 'normal'});
			} else {
				Xaxis = true;
				parent.css({overflowX: 'hidden'});
				_drag.css({whiteSpace: 'nowrap'});
			}
		};
		window.removeEventListener('resize', _super.resize, false);
		_super.resize = resize;
		(function()
		{
			clone.frist = kit(_drag[0].children[0].cloneNode(true));
			clone.end = kit(_drag[0].children[_maxPage].cloneNode(true));
			timer.complete(callback);
			_super.down(onStart);
			_super.up(onEnd);
			_super.click(onClick);
			_this.setYaxis();
			resize();
			_super.move(onMove);
			window.addEventListener('resize', resize, false);
		}());
		function resize(e) {
//			var mask = kit(_drag[0].parentNode);
//			wh = {w: -mask[0].clientWidth, h: -mask[0].clientHeight};
			var el = kit(_drag[0].children[0]);
			wh = {w: -(el.getStyle('width', true)), h: -(el.getStyle('height', true))};
			_drag.append(clone.frist);
			_drag.append(clone.end);
			if(Xaxis){
				clone.end.css({position: 'absolute',top:'0',left: wh.w+'px'});
			} else {
				clone.end.css({position: 'absolute',top: wh.h+'px',left:'0'});
			}
		}
		function onStart(e){
			first = e.param;
			if(isFn(dwFn)) dwFn.call(e.currentTarget, e);
		}
		function onMove(e){
			if(_cyclic) cyclicMove(-wh.w, 1);
			else cyclicMove(0, 0);
		}
		function cyclicMove(to, n){
			var max, tf = _super.transform();
			if(Xaxis){
				if(tf.x > to) tf.x = to;
				max = wh.w * (_maxPage+n);
				if(tf.x < max) tf.x = max;
			} else {
				if(tf.y > to) tf.y = to;
				max = wh.h * (_maxPage+n);
				if(tf.y < max) tf.y = max;
			}
			_super.transform(tf);
		}
		function onEnd(e){
			var end = e.param;
			if(Xaxis){
				if(Math.abs(end.x - first.x) < 10){
					_super.transform({x: count*wh.w, y: 0});
					if(isFn(upFn)) upFn.call(_drag, e);
					return;
				}
				isNext = end.x < first.x ? (++count, true) : (--count, false);
			} else {
				if(Math.abs(end.y - first.y) < 10){
					_super.transform({x: 0, y: count*wh.h});
					if(isFn(upFn)) upFn.call(_drag, e);
					return;
				}
				isNext = end.y < first.y ? (++count, true) : (--count, false);
			}
			setPage();
			timer.start(_speed, moveTo);
		}
		function onClick(e){
			var end = kit.mouse(e);
			if(Xaxis){
				if(Math.abs(end.x - first.x) < 10)
					if(isFn(ckFn)) ckFn.call(e.currentTarget, e);
			} else {
				if(Math.abs(end.y - first.y) < 10)
					if(isFn(ckFn)) ckFn.call(e.currentTarget, e);
			}
		}
		function setPage(){
			start = _super.transform();
			if(!_cyclic) count =  _maxPage > count ? (count < 0 ? 0 : count) : _maxPage;
			if(Xaxis){
				toX = count * wh.w - start.x;
			} else toX = count * wh.h - start.y;
			if(_cyclic) count =  _maxPage > count ? (count < 0 ? 0 : count) : _maxPage;
			currt = _super.transform();
			navDot.active(count);
		}
		function moveTo(p){
			if(_fxOff) return timer.stop(true);
		
			if(Xaxis){
				currt.x = p * toX + start.x;
				_super.transform(currt);
			} else {
				currt.y = p * toX + start.y;
				_super.transform(currt);
			}
		}
		function callback(){
			if(_cyclic){ //循环
				if(Xaxis){
					currt.x = toX + start.x;
					if(count==_maxPage && currt.x<wh.w * _maxPage){
						currt.x = 0;
						count = 0;
					} else if(count==0 && currt.x>1){
						currt.x = wh.w * _maxPage;
						count = _maxPage;
					}
				} else {
					currt.y = toX + start.y;
					if(count==_maxPage && currt.y<wh.h * _maxPage){
						currt.y = 0;
						count = 0;
					} else if(count==0 && currt.y>1){
						currt.y = wh.h * _maxPage;
						count = _maxPage;
					}
				}
			} else {
				if(Xaxis) currt.x = toX + start.x;
				else currt.y = toX + start.y;
			}
			_super.transform(currt);
			navDot.active(count);
			if(_complete) _complete.call(_drag, count);
		}
		//上一页;
		this.prevPage = function (){
			--count;
			setPage();
			timer.start(_speed, moveTo);
		};
		//下一页;
		this.nextPage = function (){
			++count;
			setPage();
			timer.start(_speed, moveTo);
		};
		//完成后回调;
		var _complete;
		this.complete = function (fn) { if(isFn(fn)) _complete = fn; };
		/*当前页;*/
		this.currentPage = function (val){
			if(val != null){
				val = parseInt(val);
				if(isNaN(val)) return console.warn('当前页数不对!');
				if(count == val) return;
				isNext = val > count ? true : false;
				count = val;
				setPage();
				timer.start(_speed, moveTo);
			} else return count;
		};
		this.cyclic = function(c){ _cyclic = c === true ? true : false; }
		this.maxPage = function(){ return _maxPage; };
		this.fxOff = function(val){ _fxOff = val === true ? true : false; };
		function isFn(fn){ return fn instanceof Function; }
		this.down = function(fn) { dwFn = fn; };
	//	this.move = function(fn) { moFn = fn; };
		this.up = function(fn) { upFn = fn; };
		this.click = function(fn) { ckFn = fn; };
		this.useIE = function(bl){_super.useIE(bl)};
		this.dispose = function(){
			if(!timer) return;
			timer.stop();
			_super.dispose();
			navDot.dispose();
			window.removeEventListener('resize', resize, false);
			dwFn = upFn = ckFn = moFn = _complete = start = null;
			first = currt = timer = _super = _this = _drag = null;
			parent = navDot = null;
		};
		
		navDot = new NavDot(_this, parent, _maxPage);
		this.hasNavDot = function(nav){
			navDot[nav !== false ? 'show' : 'hide']();
		};
		//setNavColor({background:'#FFF',dot:'red',active:'#00F'});
		this.setNavColor = navDot.setColor;
	}
	
	function NavDot(dragObj, parent, maxPage){
		var color = {dot: 'rgba(0,0,0,0.5)', background:'rgba(0,0,0,0.2)', active: '#FFF'};
		var ul, li;
		(function(){
			ul = document.createElement('ul');
			for (var i = 0; i <= maxPage; i++) {
				ul.appendChild(document.createElement('li'));
			}
			ul = kit(ul);
			if(parent.css('position')=='static') parent.css('position','relative');
			ul.css({
				background: color.background, position: 'absolute',
				left: 0, bottom: 0, textAlign: 'center', width: '100%',
				padding: '5px 0'
			});
			li = ul.find('li').css({
				background:color.dot, width: '10px', height: '10px',
				margin: '0 3px', display: 'inline-block', borderRadius: '50%'
			}).click(function(e){
				dragObj.currentPage(li.index(this));
			});
			li[dragObj.currentPage()].style.background = color.active;
		}());
		this.show = function(){
			parent.append(ul);
		};
		this.hide = function(){
			ul.detach();
		};
		this.active = function(index){
			li.css('background', color.dot);
			li[index].style.background = color.active;
		};
		//setColor({background:'#FFF',dot:'red',active:'#00F'});
		this.setColor = function(options){
			for(var co in color){
				if(typeof(options[co])=="string") color[co] = options[co];
			}
			ul.css({background: color.background});
			li.css({background: color.dot});
			li[dragObj.currentPage()].style.background = color.active;
		};
		this.dispose = function(){
			if(!li) return;
			ul = li = color = dragObj = parent = null;
		};
	}
	return function(selector, speed){ return new DragPage(selector, speed); };
});
/***********************************************************************/
define('autoScroll', function (require, exports)
{
	var kit = require('main/kit'),
		dragPage = require('dragPage');
	/**
	 * 
	 * @param {String} selector 选择器
	 * @param {Number} delay 自动播放速度
	 * @param {Number} speed 滚动速度
	 */
	function AutoScroll (selector, delay, speed)
	{
		var _super = dragPage(selector, speed), doc = kit(document),
			_maxPage = _super.maxPage(), autoTime = 0,
			delay = (delay < 1 ? 3 : delay)*1000;
		
		(function()
		{
			_super.setYaxis();
			_super.down(onDown);
			_super.complete(complete);
			start();
		}());
		function onDown(e){
			stop();
			doc.up(onEnd);
		}
		function onEnd(e){
			doc.up(onEnd, true);
			start();
		}
		function start(){
			clearInterval(autoTime);
			autoTime = setInterval(moving, delay);
		}
		function stop(){ clearInterval(autoTime); }
		function moving(){
			var count = _super.currentPage();
			if(count == _maxPage) _super.currentPage(0);
			else _super.nextPage();
		}
		function complete(){ start(); }
		this.start = start;
		this.stop = stop;
		this.setYaxis = _super.setYaxis;
		this.click = _super.click;
		this.hasNavDot = _super.hasNavDot;
		this.useIE = function(bl){_super.useIE(bl)};
		this.dispose = function()
		{
			if(_super == null) return;
			doc.up(onEnd, true);
			_super.dispose();
			doc = _super = null;
			
		};
	}
	return function(selector, delay, speed){ return new AutoScroll(selector, delay, speed); };
});
