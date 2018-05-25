var ExamRelease = new J.Class({
    init: function(arg) {
        this.paperId = J.getQueryString("paperid");
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        if (!this.paperId) {
            this.httpMyClassList();
        } else {
            this.httpGetClassTestpaper();
        }
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "examrelease",
            classList: [],
            exampager: {
                className: "",
                title: "",
                startTime: "",
                endTime: "",
                requireUseTime: 0
            },
            release: {
                classTestPaperId: self.paperId,
                startTime: "",
                endTime: "",
                testPaperId: 0,
                classIds: ""

            },
            allchecked: false,
            checkAll: function(e) {
                var checked = e.target.checked
                self.vm.classList.forEach(function(el) {
                    el.checked = checked
                })
            },
            checkOne: function(e) {

                var checked = e.target.checked
                if (checked === false) {
                    self.vm.allchecked = false
                } else { //avalon已经为数组添加了ecma262v5的一些新方法
                    self.vm.allchecked = self.vm.classList.every(function(el) {
                        return el.checked
                    })
                }
            },
            del: function() {
                self.vm.exampager.title = "";
                self.vm.release.testPaperId = 0;
            }
        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $("#releaseBtn").on("click", function() {
            if (self.paperId) {
                self.httpUpdateRelease();
            } else {
                self.httpExamRelease();
            }
        });
        $(".examchoose").on("click", function() {
            store.remove("exampager");
            var ll = layer.open({
                type: 2,
                title: "测试选择",
                shade: 0.8,
                area: ['800px', '600px'],
                content: 'exampager.html?ischoose= 1', //iframe的url,
                end: function() {
                    var exampager = store.get("exampager");
                   
                    if (exampager) {
                        exampager = JSON.parse(exampager);

                        self.vm.exampager.title = exampager.title;
                        self.vm.exampager.testPaperId = exampager.testPaperId;
                        self.vm.exampager.className = exampager.gradeName;

                        self.vm.exampager.startTime = self.vm.release.startTime;
                        self.vm.exampager.endTime = self.vm.release.endTime;
                        self.vm.exampager.requireUseTime = exampager.requireUseTime;
                    }



                }
            });
            layer.full(ll);
        })


    },
    //获取教师班级列表
    httpMyClassList: function() {
        var self = this;
        var param = {
            pageIndex: 0,
            pageNumber: 10
        }
        J.ajax({ url: "/class/myClassList", type: 'GET' }, param, function(data) {

            for (var i = 0; i < data.classList.length; i++) {
                data.classList[i]["checked"] = false;
            }
            self.vm.classList = data.classList;
            $("body").show();
        });
    },

    httpGetClassTestpaper: function() {
        var self = this;
        var param = {
            classTestPaperId: this.paperId
        }
        J.ajax({ url: "/examination/getClassTestPaper", type: 'GET' }, param, function(data) {
            self.vm.release.startTime = data.startTime;
            self.vm.release.endTime = data.endTime;
            self.vm.exampager.title = data.testPaperTitle;
            self.vm.exampager.className = data.className;
            self.vm.exampager.startTime = data.startTime;
            self.vm.exampager.endTime = data.endTime;
            self.vm.exampager.testPaperId = data.testPaperId;
            $("body").show();


        });
    },
    //发布
    httpExamRelease: function() {
        var self = this;
        var param = self.vm.release.$model;
        var list = [];

        var classList = self.vm.classList.$model;
        for (var i = 0; i < classList.length; i++) {
            if (classList[i].checked) {
                list.push(classList[i].classId);
            }
        }
        var vform = new J.Vform({
            id: "form",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }

        if (list.length === 0) {
            J.alert("请选择班级");
            return;
        } else {
            param.classIds = list.join("|");
        }

        //开始时间小于结束时间 控制
        if (Date.parse(param.startTime) > Date.parse(param.endTime)) {
            J.alert("开始时间应该小于结束时间");
            return;
        }

        param.testPaperId = self.vm.exampager.testPaperId;
        if(!param.testPaperId){
            J.alert("请选择测试");
            return "";
        }
        J.ajax({ url: "/examination/addClassTestPaper", type: 'POST' }, param, function(data) {
            J.alert({
                type: "success",
                msg: "发布成功",
                confirmFn: function() {
                    J.goPage("examcentermanage.html");
                }
            });
        });
    },
    //更新发布
    httpUpdateRelease: function() {
        var self = this;
        var param = self.vm.release.$model;

        var vform = new J.Vform({
            id: "form",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }
        param.testPaperId = self.vm.exampager.testPaperId;
        if(param.testPaperId ==""){
            J.alert("请选择测试");
            return "";
        }

        J.ajax({ url: "/examination/updateClassTestPaper", type: 'POST' }, param, function(data) {
            J.alert({
                type: "success",
                msg: "发布成功",
                confirmFn: function() {

                }
            });
        });
    }





});
var f = new ExamRelease();
