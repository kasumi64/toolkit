/**
 * @description 获取格式化日期。
 * public，default，protected，private,internal
 * @date: 20170206-20170227;
 */
;define('getDate', function (require, exports)
{
	function GetDate()
	{
		var dayTime = 86400000, hourTime = 3600000, minuteTime = 60000, secondTime = 1000,
			today, year, month, week, day, hour, minute, second, time,
			regYMD = /y|m|d/i, _formatDate = ['y','m','d'], sign = '-',
			regHMS = /h|m|s/i, _formatTime = ['h','m','s'], ts = ':';
		var dateObj = {
			/**
			 * 格式化日期，
			 * @param {Object} format 年-月-日，y-m-d
			 */
			formatDate: function (format){
				if(typeof(format)!="string") return this;
				format = format.toLowerCase();
				var i, str, len = format.length;
				_formatDate = [];
				for (i = 0; i < len; i++) {
					str = format.charAt(i);
					if(regYMD.test(str) && _formatDate.indexOf(str) < 0){
						_formatDate.push(str);
						if(_formatDate.length == 3) break;
					}
				}
				if(_formatDate.length == 0) _formatDate = ['y','m','d'];
				str = format.replace(/y|m|d/ig,'');
				sign = str.charAt(0);
				return this;
			},
			/**
			 * 格式化时间
			 * @param {String} format 时-分-秒，h:m:s
			 */
			formatTime: function (format){
				if(typeof(format)!="string") return;
				format = format.toLowerCase();
				var i, str, len = format.length;
				_formatTime = [];
				for (i = 0; i < len; i++) {
					str = format.charAt(i);
					if(regHMS.test(str) && _formatTime.indexOf(str) < 0){
						_formatTime.push(str);
						if(_formatTime.length == 3) break;
					}
				}
				if(_formatTime.length == 0) _formatTime = ['h','m','s'];
				str = format.replace(/h|m|s/ig,'');
				ts = str.charAt(0);
				return this;
			},
			/**
			 * 获取日期
			 * @param {String} ymd 当日的时间偏移，‘-’为减少。
			 */
			getDate: function(ymd){
				currentDate();
				if(typeof(ymd)!="string") return getFormatDate();
		
				var i, str, len = ymd.length, obj={}, att='', t=0;
				ymd = ymd.toLowerCase();
				for (i = 0; i < len; i++) {
					str = ymd.charAt(i);
					if(regYMD.test(str)){
						if(!obj[str]) obj[str] = att;
						att = '';
					} else att += str;
				}
				for (att in obj){
					var add = parseInt(obj[att]);
					if(att == 'd'){ //日
						t += add * dayTime;
					}else if(att == 'm'){ //月
						var step = month + add > month ? 1 : -1;
						len = Math.abs(add);
						for (i = 0; i < len; i++) {
							month += step;
							month = month > 12 ? 1 : (month < 1 ? 12 : month);
							switch (month){
								case 1:case 3:case 5:case 7:case 8:case 10:case 12:
									t += dayTime * 31 * step; break;
								case 4:case 6:case 9:case 11:
									t += dayTime * 30 * step; break;
								default:
									t += dayTime * 28 * step; break;
							}
						}
					} else { //年
						t += (add>=0 ? 1:-1) * 365 * dayTime;
					}
				}
				currentDate(time + t);
				return getFormatDate();
			},
			/**
			 * 获取时间
			 * @param {String} hms 当日的时间偏移，‘-’为减少。
			 */
			getTime: function(hms){
				currentDate();
				if(typeof(hms)!="string"){
					doubleDigit();
					return ''+hour+ts+minute+ts+second;
				}
				var i, str, len = hms.length, obj={}, att='', t=0;
				hms = hms.toLowerCase();
				for (i = 0; i < len; i++) {
					str = hms.charAt(i);
					if(regHMS.test(str)){
						if(!obj[str]) obj[str] = att;
						att = '';
					} else att += str;
				}
				for (att in obj){
					var add = parseInt(obj[att]);
					if(att == 'h'){ //小时
						t += add * hourTime;
					}else if(att == 'm'){ //分钟
						t += add * minuteTime;
					} else{ //秒
						t += add * secondTime;
					}
				}
				currentDate(time + t);
				doubleDigit();
				return ''+hour+ts+minute+ts+second;
				
			},
			//新日期的毫秒数
			getMsec: function(millisecond){
				return time;
			},
		};
		function getFormatDate()
		{
			doubleDigit();
			var str='', i, len = _formatDate.length;
			for (i = 0; i < len; i++) {
				if(i > 0) str += sign;
				switch (_formatDate[i]){
					case 'y':
						str += year; break;
					case 'm':
						str += month; break;
					default:
						str += day; break;
				}
			}
			return str;
		}
		function getFormatTime()
		{
			doubleDigit();
			var str='', i, len = _formatTime.length;
			for (i = 0; i < len; i++) {
				if(i > 0) str += ts;
				switch (_formatTime[i]){
					case 'y':
						str += hour ;break;
					case 'm':
						str += minute ;break;
					default:
						str += second ;break;
				}
			}
			return str;
		}
		function currentDate(millisecond)
		{
			today = millisecond?new Date(millisecond):new Date();
			year = today.getFullYear();
			month =  today.getMonth()+1;
			week = today.getDay();
			day = today.getDate();
			hour = today.getHours();
			minute = today.getMinutes();
			second = today.getSeconds();
			time = today.getTime();
		}
		function doubleDigit()
		{
			var zero = '0';
			month = month < 10 ? zero + month : month;
			day = day < 10 ? zero + day : day;
			hour = hour < 10 ? hour + hour : hour;
			minute = minute < 10 ? zero + minute : minute;
			second = second < 10 ? zero + second : second;
		}
		return dateObj; 
	};
	return GetDate;
});