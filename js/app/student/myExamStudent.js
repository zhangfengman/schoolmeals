var ExamCenterList = new J.Class({
    init: function(arg) {

        this.vm = null;
        this.bindEvent();
        this.initAvalon();
        this.http();
        this.httpsysData();
        this.httpGetTypes();
    },
    initAvalon: function() {
        this.vm = avalon.define({
            $id: "examCenter",
            types: [],
            grades: [],
            subjects: [],
            data: [],
            query: {
                subjectId: "",
                gradeId: "",
                typeId: "",
            },
            goToStatistics: function(id) {
                J.goPage("examStatistics.html", { classTestPaperId: id });
            },
            startExam: function(id) {
                J.goPage("examDetailStudent.html", { testpaperid: id });
            },
            detail:function(item){
                J.goPage("../teacher/examdetail.html", { paperid: item.testPaperId });
            }
        })
        avalon.scan();
    },
    bindEvent: function () {
        var self=this;

        $(".class-body").on("click", ".user-icon", function () {
            J.goPage("lessoncenterStudent.html",{classid:id});
        });
        $(".lesson_step_tab").on("click", "li", function() {
            var href = $(this).attr("data-href", { classid: id });
            if (href) {
                J.goPage(href);
            }
        });


        $("#queryBtn").on("click", function() {
            self.http();
        });
    },
    httpGetTypes: function() {
        var self = this;
        J.ajax({ url: "/testPaper/getMyTheacherTestPaperTypeList", type: "GET" }, null, function(dataList) {

            self.vm.types = dataList.testPaperTypeList;
        })
    },
    httpsysData: function() {
        var self = this;
        J.getsysData("[subjects','grades']", function(data) {
            self.vm.subjects = data.subjects;
            self.vm.grades = data.grades;
        });
    },
    http: function() {
        var self = this;
        var queryObj = self.vm.query;
        var params = {           
           
        };
        if(queryObj.typeId){
            params['testPaperTypeId'] = queryObj.typeId;
        }
          if(queryObj.subjectId){
            params['subjectId'] = queryObj.subjectId;
        }
          if(queryObj.subjectId){
            params['gradeId'] = queryObj.gradeId;
        }
       
        J.ajax({ url: "/examination/getClassTestPaperList", type: "POST" }, params, function(data) {
            $("body").show();
            self.vm.data = [];
            //处理状态
            for (var i = 0; i < data.examinationList.length; i++) {
                var item = data.examinationList[i];
                var curTime =  moment(data.stime);
                var startTime = moment(item.startTime,"YYYY-MM-DD HH:mm:ss");
                var endTime = moment(item.endTime,"YYYY-MM-DD HH:mm:ss");
                if(curTime.isBefore(startTime)){
                    //不可修改
                    item["flag"] = 0;
                }else if(curTime.isBetween(startTime,endTime)){
                    item["flag"] = 1;
                }else if(curTime.isAfter(endTime)){
                    //完成
                    item["flag"] = 2;
                }
            }
            self.vm.data = data.examinationList;
        });
    }
});
var f = new ExamCenterList();
