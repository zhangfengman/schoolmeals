var ExamReport = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.page_Index = 1;
        this.page_Number = 5;

        this.initQuery();
        this.initAvalon();
        this.initPage();
       
    },
    initChart:function(list){
       var arrayX = [];
       var arrayY = [];
       for(var i=0;i<list.length;i++){
           arrayX.push(list[i].subjectName);
           arrayY.push(list[i].acquireScoreCount);
       }
       myechart("myechart",{x:arrayX,y:arrayY});
    },
    
    initPage: function() {
        var self = this;
        var page = new J.Page({
            cid: "paging",
            total: 0,
            change: function(pageData) {
                self.page_Index = pageData.curPage;
                self.page_Number = pageData.pageSize;
                self.httpExamination();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;





    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "learningsituation",
            types: [],
            courseList: [],
            chapterList: [],
            subjects: [],
            grades: [],
            courseChapterList: [],
            children: [],
            examQuery: {
                studentUserId: "",
                testPaperTypeId: "",
                gradeId: "",
                subjectId: ""
            },
            classTestPaperList: [],
            studentList: [],
            examfunc: function() {
                self.httpExamination();
            }
        })
        avalon.scan();
    },
    initQuery: function() {
        this.httpMyChildList();
        this.httpGetTypes();
        this.httpsysData();
        setTimeout(function() {
            $('body').show();
        }, 500);
        //this.httpGetCourseList();
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
    httpGetCourseList: function() {
        var self = this;
        var param = {
            classId: this.classId,
            pageIndex: 0,
            pageNumber: 10
        }
        J.ajax({ url: "/course/getClassCourseList", type: 'GET' }, param, function(data) {
            self.vm.courseList = data.courseList;
            //获取第一个课程数据
            if (data.courseList.length > 0) {
                self.courseId = data.courseList[0].courseId;
                self.getCourseChapter(self.courseId);
            }
        });
    },
    getCourseChapter: function(courseId) {
        var self = this;
        var params = { courseId: courseId };
        J.getCourseChapter(params, function(data) {
            self.vm.chapterList = data.courseChapterList;
        });
    },
    httpExamination: function() {
        var self = this;
        var obj = self.vm.examQuery.$model;
        var param = {
            pageIndex: self.page_Index,
            pageNumber: self.page_Number
        }
        if (obj.studentUserId) {
            param['studentUserId'] = obj.studentUserId;
        }
        if (obj.testPaperTypeId) {
            param['testPaperTypeId'] = obj.testPaperTypeId;
        }
        if (obj.gradeId) {
            param['gradeId'] = obj.gradeId;
        }
        if (obj.subjectId) {
            param['subjectId'] = obj.subjectId;
        }

        J.ajax({ url: "/report/examination", type: "GET" }, param, function(data) {
            $("body").show();
            self.vm.classTestPaperList = data.classTestPaperList;
            self.initChart(data.classTestPaperList);
            self.page1.refresh(0);
        });
    },
    httpMyChildList: function() {
        var self = this;

        J.ajax({ url: "/parents/myChildList", type: "GET" }, {}, function(data) {
            $("body").show();
            self.vm.studentList = data.childList;
             if(data.childList.length > 0){
                self.vm.examQuery.studentUserId = data.childList[0].studentUserId;
            }
        });
    }

});
var f = new ExamReport();
