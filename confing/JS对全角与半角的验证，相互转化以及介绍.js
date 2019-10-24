/*1.什么是全角和半角?
全角：是一种电脑字符，是指一个全角字符占用两个标准字符(或两个半角字符)的位置。全角占两个字节。

汉字字符和规定了全角的英文字符及国标GB2312-80中的图形符号和特殊字符都是全角字符。在全角中，字母和数字等与汉字一样占据着等宽的位置。

半角：是指一个字符占用一个标准的字符位置。半角占一个字节。

半角就是 ASCII 方式的字符，在没有汉字输入法起作用的时候，输入的字母、数字和字符都是半角的。

每个半角字符只占用一字节的空间(一字节有8位，共256个编码空间)。汉语、日语、及朝鲜文等象形字语言的字库量远大于256个编码空间，所以改用两个字节来储存。同时，由于中日韩等象形文字的书写习惯，如果统一使用全角字符的话，排列起来也显得整齐。

为了排列整齐，英文和其它拉丁文的字符和标点也提供了全角格式。

2.全角和半角的区别
全角和半角主要是针对标点符号来说的，全角标点占两个字节，半角占一个字节。不管是半角还是全角，汉字都要占两个字节。

3.js判断输入的文字是全角还是半角？*/
str="中文;；ａ"     
alert(str.match(/[\u0000-\u00ff]/g))     //半角   
alert(str.match(/[\u4e00-\u9fa5]/g))     //中文   
alert(str.match(/[\uff00-\uffff]/g))     //全角   
/*4.js对全角与半角的相互转化
首先，先得明确以下信息：

a.全角空格为12288，半角空格为32 

b.其他字符半角(33-126)与全角(65281-65374)的对应关系是：均相差65248

半角转化为全角*/
function ToDBC(txtstring) { 
    var tmp = ""; 
    for(var i=0;i<txtstring.length;i++){ 
        if(txtstring.charCodeAt(i)==32){ 
            tmp= tmp+ String.fromCharCode(12288); 
        } 
        if(txtstring.charCodeAt(i)<127){ 
            tmp=tmp+String.fromCharCode(txtstring.charCodeAt(i)+65248); 
        } 
    } 
    return tmp; 
}
/*上面用到了js的charCodeAt() 方法与fromCharCode() 方法。

charCodeAt() 方法可返回指定位置的字符的 Unicode 编码。这个返回值是 0 - 65535 之间的整数。

fromCharCode() 可接受一个指定的 Unicode 值，然后返回一个字符串。

想详细的了解charCodeAt() 方法与fromCharCode()方法，可以点击《JavaScript charCodeAt() 方法》与《JavaScript fromCharCode() 方法》。

全角转换为半角*/
function ToCDB(str) { 
    var tmp = ""; 
    for(var i=0;i<str.length;i++){ 
        if (str.charCodeAt(i) == 12288){
            tmp += String.fromCharCode(str.charCodeAt(i)-12256);
            continue;
        }
        if(str.charCodeAt(i) > 65280 && str.charCodeAt(i) < 65375){ 
            tmp += String.fromCharCode(str.charCodeAt(i)-65248); 
        } 
        else{ 
            tmp += String.fromCharCode(str.charCodeAt(i)); 
        } 
    } 
    return tmp 
} 