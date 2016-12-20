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
