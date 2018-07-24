kit.plugins(function(tool, pro)
{
	var	body = kit.body();
		
	//各种提示框
	(function ()
	{
		var tips = {};
/****************** 按钮提示框 *********************/
		var tipDom = '<div id="tip">'+
			'<div class="hint">'+
				'<p class="ti">标题</p>'+
				'<p class="txt"></p>'+
				'<div class="btnBox">'+
					'<a id="ok">确认</a><a id="no">取消</a>'+
				'</div>'+
			'</div></div>';
		tips.alert = kit(tipDom);
		tips.alertHint = tips.alert.find('.hint');
		tips.alertTi = tips.alert.find('.ti');
		tips.alertTxt = tips.alert.find('.txt');
		tips.alertOK = tips.alert.find('#ok').click(function(e){
			alertHide();
			if(tips.alertOKFn)
				tips.alertOKFn.call(tips.alertOKFn,e);
		});
		tips.alertNO = tips.alert.find('#no').click(function(e){
			alertHide();
			if(tips.alertNOFn)
				tips.alertNOFn.call(tips.alertNOFn,e);
		});
		function alertShow(txt,okFn,onFn)
		{
			tips.alertTxt.html(txt);
			tips.alertOKFn = okFn;
			tips.alertNOFn = onFn;
			body.appendChild(tips.alert[0]);
			var h = kit.stage.height - tips.alertHint.getStyle('height',true);
			tips.alertHint.css('top',h/2 + 'px');
		}
		function alertHide()
		{
			tips.alert.detach();
		}
		tool.tipShow = alertShow;
/****************** 弱提示 **********************/
		var weakDom = '<div id="weak"><p id="content"></p></div>';
		tips.weak = kit(weakDom);
		tips.weakTxt = tips.weak.find('#content');
		tips.weakDelay = 0;
		tips.weakShowed = false;
		function weakTips(str,delay)
		{
			if(tips.weakShowed) return;
			tips.weakShowed = true;
			delay = (typeof(delay)=="number" && delay > 1) ?
				delay * 1000 : 3000 ;
			clearTimeout(tips.weakDelay);
			tips.weakTxt.html(str);
			body.appendChild(tips.weak[0]);
			tips.weakDelay = setTimeout(function(){
				tips.weak.detach();
				tips.weakShowed = false;
			},delay);
		}
		tool.weakTips = weakTips;
		
		
		var divInput = $(".verifyBox .input");
    	$("#verify").on('input', function(e){
    		var txt = this.value;
    		divInput.each(function(i){
    			var str = txt[i];
    			if(str){
    				this.innerText = str;
    			} else {
    				this.innerText = '';
    			}
    			if(i==5 && txt.length == 6){
    				random = txt;
    				page.id == 'setPass'? reset() : regist();
    				return false;
    			}
    		});
    	})
	}());
});