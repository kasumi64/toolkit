/*
 * 消息通知
 * @author: leiguangyao;
 * @date: 20180823-20180910;
 */
;define('broadcast', function (require, exports)
{
	var kit = require('main/kit');
	
	function Broadcast(delay, speed){
		var wrap, timer = kit.timer('linear'), isReverse = false, data = [],
			count = 0, max, distance, direction, item, list, wait,
			complete, click;
		delay = Math.abs(delay) || 3000;
		speed = Math.abs(speed) || 1000;
		
		
		function updata(arr){
			data = arr;
			max = data.length;
			if(max == 1){
				wrap.html(kit.template(data[0], item));
			}
			data.push(data[0]);
		};
		
		function moveTo(per, args){
			if(max < 2) return;
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
			if(complete instanceof Function) complete(list, count, data.slice(0, max));
		}
		timer.complete(finish);
		//第二步
		this.updata = function(arr){
			if(!(arr instanceof Array)||arr.length==0) {
				max = 0;
				data = [];
				wrap.html('');
			} else updata(arr);
		};
		//第一步
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
			if(click instanceof Function) list.click(click);
		}
		//第三步
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
		};
		this.stop = function(){
			clearTimeout(wait);
			timer.stop();
		};
		this.click = function(fn){ click = fn; }
		this.complete = function(fn){ complete = fn; };
	}
	return Broadcast;
});
