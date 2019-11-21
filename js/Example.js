// jquery上传文件进度条
$(function() {
	$("input[name=file1]").change(function() {
		var formData = new FormData();
		formData.append("file", $("input[name=file1]")[0].files[0]);
		$.ajax({
			type: "post",
			url: "file.php",
			data: formData,
			processData: false,
			xhr: function() {
				//获取xmlhttprequest对象或者ActiveXObject 对象，jquery中封装好的。
				var xhr = $.ajaxSettings.xhr();
				if (xhr.upload) {
					xhr.upload.addEventListener("progress", progressBar, false);
				}
				return xhr;

			},
			success: function() {},
			error: function() {
				console.log(arguments);
			}

		});
	});

	function progressBar(evt) {
		var loaded = evt.loaded; //已经上传大小情况
		var tot = evt.total; //附件总大小
		var per = Math.floor(100 * loaded / tot); //已经上传的百分比
		$(".sonValue").html(per + "%");
		$(".sonProcess").width(per + "%");
	}
});


!function(){
	var btn=document.querySelector("#btn");
	btn.onclick=function(){
	    var formdata=new FormData(document.getElementById("advForm"));
	    var xhr=new XMLHttpRequest();
	    xhr.open("post","http://127.0.0.1/adv");
		xhr.upload.onprogress=function(e){
			let percent=(e.loaded/e.total)*100+'%';
			console.log(percent)
		}
	    xhr.send(formdata);
	    xhr.onload=function(){
	        if(xhr.status==200){
	            //...
	        }
	    }
	}
}();










