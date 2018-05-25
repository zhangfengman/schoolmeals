var ReleaseLesson = new J.Class({
    init: function(arg) {
        this.courseId = J.getQueryString("courseid"); 
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.httpMyClassList();
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "releaselesson",
            classList: [],
            release: {
                startTime: "",
                endTime: "",
                courseId: this.courseId,
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
            }
        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;

        $("#releaseBtn").on("click", function() {
            self.httpReleaseCourse();
        });
    },
    //获取教师班级列表
    httpMyClassList: function() {
        var self = this;
        var param = {
            pageIndex: 0,
            pageNumber: 10
        }
        J.ajax({ url: "/class/myClassList", type: 'GET' }, param, function(data) {
            $("body").show();            
            for(var i=0;i<data.classList.length;i++){
                data.classList[i]["checked"] = false;
            }
            self.vm.classList = data.classList;
        });
    },
    //获取教师班级列表
    httpReleaseCourse: function() {
        var self = this;
        var param = self.vm.release.$model;
        var list = [];
           
        var classList = self.vm.classList.$model;
        for(var i=0;i<classList.length;i++){
            if(classList[i].checked){
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

        if(list.length === 0){
            J.alert("请选择班级");
            return ;
        }else{
            param.classIds = list.join("|");
        }
        J.ajax({ url: "/course/releaseCourse", type: 'POST' }, param, function(data) {
            J.alert({
                type: "success",
                msg: "发布成功",
                confirmFn: function() {
                   J.goPage("mylesson.html");
                }
            });           
        });
    }



});
var f = new ReleaseLesson();
