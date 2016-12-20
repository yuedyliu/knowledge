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

!(function () {

    var Page = {
        init: function () {
            var self = this;
            self.bindEvent();

        },
        //绑定 事件
        bindEvent: function () {
            var self = this;
            //tab 选择项切换
            $(".back-header .ul-form li").click(function () {
                $(".back-header .ul-form li").removeClass("active");
                $(this).addClass("active");
                self.tabContentSwitch();
            })
            //登录按钮
            $("#submit_login_info").click(function () {
                self.login();
            })
        },
        //tab切换
        tabContentSwitch: function () {
            var self = this;
            $(".back-content li").removeClass("active");
            var chooseIndex = parseInt($(".back-header .ul-form li.active").attr("data-index"));
            $($(".back-content li")[chooseIndex]).addClass("active");
        },

        login: function () {
            var self = this;
            G_API._ajax({
                type: 'POST',
                data: {
                    func: "login",
                    work_number: $("#nick_name").val(),
                    password: md5($("#login_password").val())
                },
                success: function (data) {
                    // console.log(data);
                    if (data.status == "success") {
                        $.cookie('token', data.entry.token, {path: '/'});
                        if (parseInt(data.entry.rank) > 1000) {
                            //console.log(data.entry.token);
                            window.location.href = "../homepage";
                        }
                    }
                },
                error: function (data) {
                }
            });
        }
    }
    Page.init();

})();