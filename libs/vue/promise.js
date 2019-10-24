function Promise(executor){
    self = this
    self.state = "pendding";
    self.value  = ""
    self.reason =""
    self.onresolve = []
    self.onreject = []
    executor(resolve,reject)
    function resolve(value){
        if(self.state == "pendding"){
            self.value = value
            self.state= "resolve"
            self.onreject.forEach(item=>item(self.value))
        }
    }
    function reject(reason){
        if(self.state == "pendding"){
			self.reason = reason
            self.state= "reject"
            self.onreject.forEach(item=>item(self.reason))
        }

    }
}
Promise.prototype.then = function(resolveFull,rejectFull){
   let self = this
    if(self.state == "resolve"){
		resolveFull(self.value)
    }
    if(self.state == "reject"){
		resolveFull(self.reason)
    }
    if(self.state == "pendding"){
		self.onresolve.push(resolveFull)
		self.onreject.push(rejectFull)
    }
}
module.exports = Promise
//以上就大致实现了简单的Promise功能了,但是还没有实现链式调用
// 下面简单改一个resolve的链式调用
Promise.prototype.then = function(resolveFull,rejectFull){
   let self = this
    if(self.state == "resolve"){
        return new Promise((resolve,reject)=>{
			let  x = resolveFull(self.value)
			if( x instanceof Promise){
                x.then(resolve,reject)
			}else{
			   resolve(x)
			}
		}
	}
}