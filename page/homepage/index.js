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