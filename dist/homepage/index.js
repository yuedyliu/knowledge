!(function () {
    var G_API = {
        _ajax: function (params) {
            var self = this;
            var error = params.error;
            var success = params.success;

            //如果本地有token
            if (typeof($.cookie("token")) != "undefined") {
                params.data.token = $.cookie("token");
            }
            var field = {
                crossDomain: true,
                url: 'http://pms-php.zzsun.cc/interface.php',
                timeout: 30000,
                success: function (data, textStatus, jqXHR) {
                    //console.log(data, textStatus, jqXHR);
                    var json_data = {};
                    try {
                        json_data = JSON.parse(data);
                    } catch (e) {
                    }
                    success(json_data, textStatus, jqXHR);
                },
                error: function (data) {
                    error(data);
                },
                getUser:function () {

                },

                headers: $.extend(params.headers, {
                    "Content-Type": "application/x-www-form-urlencoded"
                })
            };

            //$.support.cors = true;
            $.ajax($.extend(params, field));
        },
    };
    window.G_API = G_API;

})()

!function () {
    var manager_User = {
        cur_page: 1,
        all_page: 0,
        page_size: 20,
        curJobListPage: 1,
        dataEntry: {},
        allPage:0,
        init: function () {
            var self = this;
            self.bindEvent();
            self.user_info();
            self.showJobList;
        },

        //绑定事件
        bindEvent: function () {
            var self = this;
            $('.nav-banner li').click(function () {
                $('.nav-banner li').removeClass('active');
                $(this).addClass("active");
                self.toTabSwitch();
            });
            $('.manager_user').delegate("#last", 'click', function () {
                self.cur_page -= 1;
                console.log(self.cur_page);
                if (self.cur_page >= 1)
                    self.user_info();
                else {
                    $(this).addClass("disabled")
                }
            });

            $(".manager_user").delegate("#next", 'click', function () {
                //console.log(self.user_info().cur_page++)
                self.cur_page += 1;
                console.log(self.cur_page);
                //self.user_info();
                if (self.cur_page >= self.all_page) {
                    $(this).addClass("disabled");
                } else {
                    self.user_info();
                }
            });
            $(".manager_user").delegate("#turn_page", 'click', function () {
                self.cur_page = $('#input_to_pageNO').val()
                if ($('#input_to_pageNO').val() > 68 || $('#input_to_pageNO').val() <= 0) {
                    $(this).addClass("disabled");
                }
                self.user_info();
            })

            //兼职信息分页下一页
            $("#nextJobListPage").click(function () {
                self.curJobListPage += 1;
                self.showEvePageNumber(self.curJobListPage);
            })

            //兼职分页上一页
            $("#lastJobListPage").click(function () {
                self.curJobListPage -= 1;
                self.showEvePageNumber(self.curJobListPage);
            })
        },


        //tab切换
        toTabSwitch: function () {
            var self = this;
            $(".content li").removeClass("active");
            var chooseIndex = parseInt($(".nav-banner li.active").attr("data-index"));
            $($(".content li")[chooseIndex]).addClass("active");
            if (chooseIndex == 0)
                self.user_info();
            else if (chooseIndex == 1)
                self.showJobList();
        },

        //显示查询的用户信息
        user_info: function () {
            var self = this;
            G_API._ajax({
                type: 'POST',
                data: {
                    func: "getUserList",
                    pageNum: self.cur_page,
                    pageSize: self.page_size
                },
                success: function (data) {
                    if (data.status == "success") {
                        $("#user_info_table").html(template("homepage/tpl/table", {entry: data.entry}));
                        $("#show_page_list").html(template("homepage/tpl/pagelist", {
                            "curPage": data.curPage,
                            "allPage": data.totPage
                        }));
                        self.cur_page = parseInt(data.curPage);
                        self.all_page = data.totPage;
                        if (self.cur_page == 1) {
                            $("#last").addClass("disabled");
                        }
                        if (self.cur_page == self.all_page) {
                            $("#next").addClass("disabled");
                        }
                    }
                },
                error: function (data) {
                }

            });
        },

        //显示每页的兼职信息
        showEvePageNumber: function (curJobList) {
            var self = this;
            var endNumber = curJobList * self.page_size;
            var startNumber = (curJobList - 1) * self.page_size + 1;
            //console.log(dataEntry)
            var showJobArray = self.dataEntry.slice(startNumber, endNumber)
            for (var i = startNumber; i < endNumber + 1; i++) {
                $("#show_job_list").html(template("homepage/tpl/joblist", {entry: showJobArray}))
            }
            if(curJobList==1)
                $("#lastJobListPage").addClass("disabled")
            else{
                $("#lastJobListPage").removeClass("disabled")
            }
            if(curJobList==self.allPage)
                $("#nextJobListPage").addClass(("disabled"))
            else
                $("#nextJobListPage").removeClass("disabled")
            self.curJobListPage = curJobList;
        },

        //查询所有兼职信息
        showJobList: function () {
            var self = this;
            G_API._ajax({
                type: 'POST',
                data: {
                    func: "getJobList"
                },
                success: function (data) {
                    if (data.status == "success") {
                        var data_info = {
                            jobList: data.entry.length,//总条数,
                            curJobListPage: 1,//默认为第一页
                        }
                        self.allPage=Math.ceil(data_info.jobList/self.page_size);//计算共分多少页
                        self.dataEntry = data.entry;
                        self.showEvePageNumber(data_info.curJobListPage)

                    }
                },
                error: function (data) {
                },
            });
        }
    };
    manager_User.init();
}();
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