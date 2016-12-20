/*TMODJS:{"version":"1.0.0"}*/
!function () {

    function template (filename, content) {
        return (
            /string|function/.test(typeof content)
            ? compile : renderFile
        )(filename, content);
    };


    var cache = template.cache = {};
    var String = this.String;

    function toString (value, type) {

        if (typeof value !== 'string') {

            type = typeof value;
            if (type === 'number') {
                value += '';
            } else if (type === 'function') {
                value = toString(value.call(value));
            } else {
                value = '';
            }
        }

        return value;

    };


    var escapeMap = {
        "<": "&#60;",
        ">": "&#62;",
        '"': "&#34;",
        "'": "&#39;",
        "&": "&#38;"
    };


    function escapeFn (s) {
        return escapeMap[s];
    }


    function escapeHTML (content) {
        return toString(content)
        .replace(/&(?![\w#]+;)|[<>"']/g, escapeFn);
    };


    var isArray = Array.isArray || function(obj) {
        return ({}).toString.call(obj) === '[object Array]';
    };


    function each (data, callback) {
        if (isArray(data)) {
            for (var i = 0, len = data.length; i < len; i++) {
                callback.call(data, data[i], i, data);
            }
        } else {
            for (i in data) {
                callback.call(data, data[i], i);
            }
        }
    };


    function resolve (from, to) {
        var DOUBLE_DOT_RE = /(\/)[^/]+\1\.\.\1/;
        var dirname = ('./' + from).replace(/[^/]+$/, "");
        var filename = dirname + to;
        filename = filename.replace(/\/\.\//g, "/");
        while (filename.match(DOUBLE_DOT_RE)) {
            filename = filename.replace(DOUBLE_DOT_RE, "/");
        }
        return filename;
    };


    var utils = template.utils = {

        $helpers: {},

        $include: function (filename, data, from) {
            filename = resolve(from, filename);
            return renderFile(filename, data);
        },

        $string: toString,

        $escape: escapeHTML,

        $each: each
        
    };


    var helpers = template.helpers = utils.$helpers;


    function renderFile (filename, data) {
        var fn = template.get(filename) || showDebugInfo({
            filename: filename,
            name: 'Render Error',
            message: 'Template not found'
        });
        return data ? fn(data) : fn; 
    };


    function compile (filename, fn) {

        if (typeof fn === 'string') {
            var string = fn;
            fn = function () {
                return new String(string);
            };
        }

        var render = cache[filename] = function (data) {
            try {
                return new fn(data, filename) + '';
            } catch (e) {
                return showDebugInfo(e)();
            }
        };

        render.prototype = fn.prototype = utils;
        render.toString = function () {
            return fn + '';
        };

        return render;
    };


    function showDebugInfo (e) {

        var type = "{Template Error}";
        var message = e.stack || '';

        if (message) {
            // 利用报错堆栈信息
            message = message.split('\n').slice(0,2).join('\n');
        } else {
            // 调试版本，直接给出模板语句行
            for (var name in e) {
                message += "<" + name + ">\n" + e[name] + "\n\n";
            }  
        }

        return function () {
            if (typeof console === "object") {
                console.error(type + "\n\n" + message);
            }
            return type;
        };
    };


    template.get = function (filename) {
        return cache[filename.replace(/^\.\//, '')];
    };


    template.helper = function (name, helper) {
        helpers[name] = helper;
    };


    if (typeof define === 'function') {define(function() {return template;});} else if (typeof exports !== 'undefined') {module.exports = template;} else {this.template = template;}
    
    /*v:1*/
template('homepage/tpl/joblist',function($data,$filename
/**/) {
'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,entry=$data.entry,item=$data.item,i=$data.i,$escape=$utils.$escape,$out='';$out+='<table class="table table-hover"> <thead> <th class="center_th">兼职名称</th> <th class="center_th">人数情况</th> <th class="center_th">地点</th> <th class="center_th">日期</th> <th class="center_th">薪酬</th> <th class="center_th">操作</th> </thead> <tbody> ';
$each(entry,function(item,i){
$out+=' <tr> <td>';
$out+=$escape(item.title);
$out+='</td> <td>';
$out+=$escape(item.num_situation);
$out+='</td> <td>';
$out+=$escape(item.location);
$out+='</td> <td>';
$out+=$escape(item.date);
$out+='</td> <td>';
$out+=$escape(item.salary);
$out+='</td> <td> <div class="btn-group"> <button type="button" class="btn btn-group-xs jobListBtn">详情</button> <button type="button" class="btn btn-group-xs jobListBtn">过期</button> <button type="button" class="btn btn-group-xs jobListBtn">新增</button> </div> </td> </tr> ';
});
$out+=' </tbody> </table>';
return new String($out);
});/*v:1*/
template('homepage/tpl/pagelist',function($data,$filename
/**/) {
'use strict';var $utils=this,$helpers=$utils.$helpers,$escape=$utils.$escape,curPage=$data.curPage,allPage=$data.allPage,$out='';$out+='<div> <span class="pageinfo">第';
$out+=$escape(curPage);
$out+='页</span> <span class="pageinfo">共';
$out+=$escape(allPage);
$out+='页</span> <button type="button" class="btn btn-default "id="last">上一页</button> <button type="button" class="btn btn-default"id="next">下一页</button> <span class="pageinfo">跳转到</span> <input type="text" class="input_page" id="input_to_pageNO" placeholder="页码"> <span class="pageinfo">页</span> <button type="button" class="btn btn-default turn_button" id="turn_page">跳转</button> </div>';
return new String($out);
});/*v:1*/
template('homepage/tpl/table',function($data,$filename
/**/) {
'use strict';var $utils=this,$helpers=$utils.$helpers,$each=$utils.$each,entry=$data.entry,item=$data.item,i=$data.i,$escape=$utils.$escape,$out='';$out+='<table class="table table-hover"> <thead> <th class="center_th">工作号</th> <th class="center_th">姓名</th> <th class="center_th">开始时间</th> <th class="center_th">结束时间</th> <th class="center_th">参加次数</th> <th class="center_th">操作</th> </thead> <tbody> ';
$each(entry,function(item,i){
$out+=' <tr> <td>';
$out+=$escape(item.work_number);
$out+='</td> <td>';
$out+=$escape(item.nickname);
$out+='</td> <td>';
$out+=$escape(item.s_time);
$out+='</td> <td>';
$out+=$escape(item.e_time);
$out+='</td> <td>';
$out+=$escape(item.join_times);
$out+='</td> <td> <div class="btn-group btn_noborder"> <button type="button" class="btn btn-default btn_noborder"><span class="glyphicon glyphicon-edit"></span></button> <button type="button" class="btn btn-default btn_noborder"><span class="glyphicon glyphicon-remove del_color"></span></button> </div> </td> </tr> ';
});
$out+=' </tbody> </table> ';
return new String($out);
});

}()