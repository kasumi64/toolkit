/*
 * 消息通知
 * @author: leiguangyao;
 * @date: 20180823-20180904;
 */
;define('broadcast', function (require, exports)
{
	var kit = require('main/kit'), pro = Broadcast.prototype;
	
	function Broadcast(data, delay, speed){
		var wrap, timer = kit.timer('linear'), isReverse = false,
		count, max, distance, direction, complete, item, list, wait;
		delay = Math.abs(delay) || 5000;
		speed = Math.abs(speed) || 1000;
		
		(function(){
			updata(data);
		}());
		
		function updata(data){
			if(!(data instanceof Array)||data.length==0) {
				throw new Error('Broadcast: data is not Array or null');
			}
			max = data.length;
			count = 0;
			data.push(data[0]);
		};
		
		function moveTo(per, args){
			var dist = distance * per;
			if(isReverse){
				dist -= distance;
			}
			list.css(direction, dist);
		}
		function finish(){
			count = ++count < max ? count : 0;
			list.dispose();
			round();
			wait = setTimeout(function(){ timer.start(speed, moveTo); }, delay);
		}
		timer.complete(finish);
		
		this.updata = function(data){
			updata(data);
		};
		this.setItem = function(id, dom){
			wrap = kit(id).css('overflow', 'hidden');
			item = dom;
		};
		function round(){
			var dire = 'right bottom', jsons = data.slice(count, count + 2);
			if(dire.indexOf(direction) > -1) {
				isReverse = true;
				jsons = jsons.reverse();
			}
			wrap.html(kit.template(jsons, item));
			list = kit(wrap[0].children);
			switch (direction){
				case 'top': case 'bottom':
					list.css({display:'block', position: 'relative'}); break;
				default:
					list.css({display:'inline-block', position: 'relative'}); break;
			}
			if(isReverse){
				list.css(direction, Math.abs(distance));
			}
		}
		this.start = function(dire){
			this.stop();
			switch (dire){
				case 'top': case 'left': case 'right':
					direction = dire; break;
				default:
					direction = 'bottom'; break;
			}
			switch (direction){
				case 'top': case 'bottom':
					distance = wrap.getStyle('height'); break;
				default:
					wrap.css({'white-space':'nowrap'});
					distance = wrap.getStyle('width'); break;
			}
			distance *= -1;
			round();
			timer.start(speed, moveTo);
//			timer.stop();
		};
		this.stop = function(){
			clearTimeout(wait);
			timer.stop();
		};
		this.complete = function(fn){
			complete = fn;
		};
	}
	return Broadcast;
});
