////////////
//创建动画缓动对象 //
////////////
function Tween(value, prop, animation) {
    this.elem    = animation.elem;
    this.prop    = prop;
    this.easing  = "swing"; //动画缓动算法
    this.options = animation.options;
    //获取初始值
    this.start   = this.now = this.get();
    //动画最终值
    this.end     = value;
    //单位
    this.unit    = "px"
}

function getStyles(elem) {
    return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
};

function swing(p) {
    return 0.5 - Math.cos(p * Math.PI) / 2;
}

Tween.prototype = {
    //获取元素的当前属性
    get: function() {
        var computed = getStyles(this.elem);
        var ret = computed.getPropertyValue(this.prop) || computed[this.prop];
        return parseFloat(ret);
    },
    //运行动画
    run:function(percent){
        var eased
        //根据缓动算法改变percent
        this.pos = eased = swing(percent);
        //获取具体的改变坐标值
        this.now = (this.end - this.start) * eased + this.start;
        //最终改变坐标
        this.elem.style[this.prop] = this.now + "px";
        return this;
    }
}


////////
//动画类 //
////////
function Animation(elem, properties, options){
    //动画对象
    var animation = {
        elem            : elem,
        props           : properties,
        originalOptions : options,
        options         : options,
        startTime       : Animation.fxNow || createFxNow(),//动画开始时间
        tweens          : [] //存放每个属性的缓动对象，用于动画
    }

    //生成属性对应的动画算法对象
    for (var k in properties) {
        // tweens保存每一个属性对应的缓动控制对象
        animation.tweens.push( new Tween(properties[k], k, animation) )
    }

    //动画状态
    var stopped;
    //动画的定时器调用包装器
    var tick = function() {
        if (stopped) {
            return false;
        }
        //动画时间算法
        var currentTime = Animation.fxNow || createFxNow
            //运动时间递减
            remaining = Math.max(0, animation.startTime + animation.options.duration - currentTime),
            temp = remaining / animation.options.duration || 0,
            percent = 1 - temp;

        var index = 0,
            length = animation.tweens.length;

        //执行动画改变
        for (; index < length; index++) {
            //percent改变值
            animation.tweens[index].run(percent);
        }

        //是否继续，还是停止
        if (percent <= 1 && length) {
            return remaining;
        } else {
            //停止
            return false;
        }

    }
    tick.elem = elem;
    tick.anim = animation

    Animation.fx.timer(tick)
}    

//创建开始时间
function createFxNow() {
    setTimeout(function() {
        Animation.fxNow = undefined;
    });
    return (Animation.fxNow = Date.now());
}


//用于定时器调用
Animation.timers =[]

Animation.fx = {
    //开始动画队列
    timer: function(timer) {
        Animation.timers.push(timer);
        if (timer()) {
            //开始执行动画
            Animation.fx.start();
        } else {
            Animation.timers.pop();
        }
    },
    //开始循环
    start: function() {
        if (!Animation.timerId) {
            Animation.timerId = setInterval(Animation.fx.tick, 13);
        }
    },
    //停止循环
    stop:function(){
        clearInterval(Animation.timerId);
        Animation.timerId = null;
    },
    //循环的的检测
    tick: function() {
        var timer,
            i = 0,
            timers = Animation.timers;

        Animation.fxNow = Date.now();

        for (; i < timers.length; i++) {
            timer = timers[i];
            if (!timer() && timers[i] === timer) {
                //如果完成了就删除这个动画
                timers.splice(i--, 1);
            }
        }

        if (!timers.length) {
            Animation.fx.stop();
        }
        Animation.fxNow = undefined;
    }
}











/************************************************************************/
/*

<!doctype html>
<img id="book" style="background:red;opacity:1;position: relative; left: 500px;" alt="" width="100" height="123" data-mce-style="background: red; opacity: 1; position: relative; left: 500px;" />
<script type="text/javascript">

var book = document.getElementById('book')

animate(book, {
	left: 50,
	duration: 2000
})

function animate(elem, options){
	//动画初始值
	var start = 500
	//动画结束值
	var end = options.left
	//动画id
	var timerId;
	var createTime = function(){
		return  (+new Date)
	}
	//动画开始时间
	var startTime = createTime();

	function tick(){	
		//每次变化的时间
		var remaining = Math.max(0, startTime + options.duration - createTime())
		var temp = remaining / options.duration || 0;
		var percent = 1 - temp;
		var stop = function(){
			//停止动画
			clearInterval(timerId);
			timerId = null;			
		}
		var setStyle = function(value){
			elem.style['left'] = value + 'px'
		}
		//移动的距离
		var now = (end - start) * percent + start;
		if(percent === 1){
			setStyle(now)
			stop();
		}else{
			setStyle(now)
		}
	}

	//开始执行动画
	var timerId = setInterval(tick, 13);
}
</script> 
 */
