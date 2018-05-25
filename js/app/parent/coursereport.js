/**
 * 课程报告
 *
 **/
var CourseReport = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.page_Index = 1;
        this.page_Number = 5;
       
        this.initQuery();
        this.bindEvent();
        this.initAvalon();
        this.initPage();
       

    },
    initChart:function(list){
       var arrayX = [];
       var arrayY = [];
       for(var i=0;i<list.length;i++){
           arrayX.push(list[i].name);
           arrayY.push(list[i].acquireScoreCount);
       }
       myechart("myechart",{x:arrayX,y:arrayY});
    },
    bindEvent: function() {
        var self = this;
        $("#courseselect").on("change", function() {
            var val = $(this).val();
            self.getCourseChapter(val);
        });
        $("#chapter").on("change", function() {
            var val = $(this).val();
            self.vm.courseQuery.chapterId = val;
            var list = self.vm.chapterList.$model;
            for (var i = 0; i < list.length; i++) {
                if (list[i].courseChapterId === parseInt(val)) {
                    self.vm.children = list[i].childList;
                    break;
                }
            }
        });
        $("#gradeId").on("change", function() {
            var val = $(this).val();
            self.vm.courseQuery.gradeId = val;         
            self.httpGetCourseList();
        });
        $("#subjectId").on("change", function() {
            var val = $(this).val();
            self.vm.courseQuery.subjectId = val;         
            self.httpGetCourseList();
        });
        $("#segmentTypeS").on("change", function() {
            self.httpGetSegmentList();
        });
        $("#courseChapterS").on("change", function() {
            self.httpGetSegmentList();
        });
        
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
            studentList: [],
            taskList:[],
            courseQuery: {
                studentUserId: "",
                testPaperTypeId: "",
                gradeId: "",
                subjectId: "",
                courseId: "",
                chapterId: "",
                courseChapterId: "",
                segmentType: "",
                segmentId:""
            },
            courseChapterSegmentList: [],
            coursefunc: function() {
                self.httpLearn();
            }


        })
        avalon.scan();
    },
    initQuery: function() {

        this.httpsysData();
        setTimeout(function() {
            $('body').show();
        }, 500);
        
        this.httpMyChildList();
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
        var obj = self.vm.courseQuery.$model;
        var param = {
            gradeId:"",
            subjectId:"",
        }
        if (obj.gradeId) {
            param['gradeId'] = obj.gradeId;
        }else{
            return;
        }
        if (obj.subjectId) {
            param['subjectId'] = obj.subjectId;
        }else{
            return;
        }
       
        J.ajax({ url: "/course/getCourseListBySubjectAndGrade", type: 'GET' }, param, function(data) {
            self.vm.courseList = data.courseList;
            
        });
    },
    getCourseChapter: function(courseId) {
        var self = this;
        var params = { courseId: courseId };
        J.getCourseChapter(params, function(data) {
            self.vm.chapterList = data.courseChapterList;
        });
    },
    httpLearn: function() {
        var self = this;
        var obj = self.vm.courseQuery.$model;
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
        }else{
            return;
        }
        if (obj.subjectId) {
            param['subjectId'] = obj.subjectId;
        }else{
            return;
        }
        if (obj.courseChapterId) {
            param['courseChapterId'] = obj.courseChapterId;
        }
        if (obj.segmentType) {
            param['segmentType'] = obj.segmentType;
        }
        if (obj.segmentId) {
            param['segmentId'] = obj.segmentId;
        }

        J.ajax({ url: "/report/learn", type: "GET" }, param, function(data) {
            $("body").show();
            self.vm.courseChapterSegmentList = data.courseChapterSegmentList;
            self.initChart(data.courseChapterSegmentList);
            self.page.refresh(0);

        });
    },
    httpMyChildList: function() {
        var self = this;

        J.ajax({ url: "/parents/myChildList", type: "GET" }, {}, function(data) {
            $("body").show();
            self.vm.studentList = data.childList;
            if(data.childList.length > 0){
                self.vm.courseQuery.studentUserId = data.childList[0].studentUserId;
            }
        });
    },
    httpGetSegmentList:function(){
         var self = this;
         var params = {
            courseChapterId:self.vm.courseQuery.courseChapterId,
            segmentType:self.vm.courseQuery.segmentType
         };
         if(params.courseChapterId =="" || params.segmentType==""){
            return;
         }
         J.ajax({ url: "/course/getSegmentList", type: 'GET' }, params, function(data) {
           
            self.vm.taskList = data.segmentList;
            if(data.segmentList.length>0 && !self.vm.courseQuery.segmentId){
                self.vm.courseQuery.segmentId = data.segmentList[0].segmentId;
            }
            
        });
    }

});
var f = new CourseReport();
