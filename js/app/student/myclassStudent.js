var Myclass = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.httpClassList();
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "class-body",
            list: [],
            newclass: {
                className: "",
                gradeId: "",
                schoolId: "",
                subjectId: "",
                beginTime: ""
            },
            classID:"",
            addClass:function(){
                //console.log(self.vm.classID);
                if(self.vm.classID){
                    self.httpJoinClass(self.vm.classID);
                }
                
            }
        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $(".class-body").on("click", ".user-icon", function() {
            var id = $(this).attr("classid");
            //班级信息存储本地，创建课程是用
            var classObj = self.getClass(id);
            store.set("myclass", classObj);
            J.goPage("lessoncenterStudent.html", { classid: id });
        });
        $(".lesson_step_tab").on("click", "li", function() {
            var href = $(this).attr("data-href");
            J.goPage(href);
        });
       
    },
    getClass: function(id) {
        var list = this.vm.list.$model;
        var obj = null;
        for (var i = 0; i < list.length; i++) {
            if (id === list[i].classId + "") {
                obj = list[i];
                break;
            }
        }
        return obj;
    },
    httpClassList: function() {
        var self = this;
        J.ajax({ url: "/class/myClassList", type: 'GET' }, null, function(data) {
            self.vm.list = data.classList;
            $("body").show();
        });
    },
    httpJoinClass: function(uuid) {
        var self = this;
        var params = {
            classId:uuid
        }
        J.ajax({ url: "/class/joinClass", type: 'POST' }, params, function(data) {
            //1成功、2已加入过、3班级标识不存在
            if(data.status+"" ==="1"){
                 $("#myModal").modal("hide");
                 self.httpClassList();
            }else if(data.status+"" ==="2"){
                J.alert("已加入过");
            }else if(data.status+"" ==="3"){
                J.alert("班级不存在");
            }
          
           
        });
    },
    
});
var f = new Myclass();
