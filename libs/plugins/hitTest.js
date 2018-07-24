/**
 * @description 碰撞测试。
 * public，default，protected，private,internal
 * @date: 20171031;
 */
;define('hitTest', function (require, exports)
{
	/*矩形碰撞*/
	function impactRect (elf1, elf2)
	{
		var rect = {x:0, y:0 ,w:0 ,h:0, dx:0, dy:0, isHit:false},
			x1, y1, w1, h1, x2, y2 ,w2 ,h2;
		x1 = elf1.x; y1 = elf1.y;
		x2 = elf2.x; y2 = elf2.y;
		// 转为对角线坐标
		w1 = x1 + elf1.width;
		h1 = y1 + elf1.height;
		w2 = x2 + elf2.width;
		h2 = y2 + elf2.height;
		
		// 没有相交
		if(w1 <= x2 || w2 <= x1 || h1 <= x2 || h2 <= y1) return rect;
		
		var tmpX, tmpY;
		
		if(x2 > x1){
			tmpX = w2 < w1 ? [x2, w2] : [x2, w1];
		} else {
			tmpX = w1 < w2 ? [x1, w1] : [x1, w2];
		}

		if(x2 > x1){
			tmpY = h2 < h1 ? [y2, h2] : [y2, h1];
		} else {
			tmpY = h1 < h2 ? [y1, h1] : [y1, h2];
		}
		rect.isHit = true;
		rect.x = tmpX[0]; rect.w = tmpX[1]-tmpX[0];
		rect.y = tmpY[0]; rect.h = tmpY[1]-tmpY[0];
		rect.dx = tmpX[1]; rect.dy = tmpY[1];
		//[tmpX[0], tmpY[0], tmpX[1], tmpY[1]];
		return rect;
	}
	/*像素碰撞*/
	function impactPixel (elf1, elf2)
	{
		var rect = impactRect(elf1, elf2);
		if(rect.isHit == false) return false;
		
		var x, y, w, h, _ctx, imageData;
		
		_ctx = impactPixel.ctx;
		x = Math.min(elf1.x, elf2.x);
		y = Math.min(elf1.y, elf2.y);
		w = Math.max(elf1.x + elf1.width, elf2.x + elf2.width);
		h = Math.max(elf1.y + elf1.height, elf2.y + elf2.height) - y;
//		log(x, y, w, h);

		_ctx.globalCompositeOperation = 'source-over';
		_ctx.clearRect(x, y, w, h);
		_ctx.drawImage(elf1, elf1.x, elf1.y, elf1.width,elf1.height);
		_ctx.globalCompositeOperation = 'source-in';
		_ctx.drawImage(elf2, elf2.x, elf2.y, elf2.width,elf2.height);

//		[tmpX[0], tmpY[0], tmpX[1], tmpY[1]];
		imageData = _ctx.getImageData(rect.x, rect.y, rect.w, rect.h).data;
		for(var i = 3, len = imageData.length; i < len; i += 4) {
		    if(imageData[i] > 0) return true; // 碰撞
		}
		return false;
	}
	impactPixel.ctx = document.createElement('canvas').getContext('2d');
	
	exports.hitObject = function(elf1, elf2){ return impactRect(elf1, elf2).isHit; };
	exports.hitPixel = function(pic1, pic1){ return impactPixel(pic1, pic1); };
	return exports;
});