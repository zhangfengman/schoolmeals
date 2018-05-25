var LearningSituation = new J.Class({
    init: function(arg) {
        this.vm = null;
        this.studentUserId = J.getQueryString("uid");
        this.page1_Index = 1;
        this.page1_Number = 5;
        this.page2_Index = 1;
        this.page2_Number = 5;
        this.page3_Index = 1;
        this.page3_Number = 5;
        
        this.initAvalon();
        this.initQuery();
        this.initPage();
        this.bindEvent();

    },
    bindEvent: function() {
        var self = this;

        $("#gradeIdChange").on("change", function() {
            var val = $(this).val();
            self.vm.courseQuery.gradeId = val;
            self.httpGetCourseList();
        });
        $("#subjectIdChange").on("change", function() {
            var val = $(this).val();
            self.vm.courseQuery.subjectId = val;
            self.httpGetCourseList();
        });
        $("#gradeIdunfinish").on("change", function() {
            var val = $(this).val();
            self.vm.unfinishQuery.gradeId = val;
            self.httpGetCourseList2();
        });
        $("#subjectIdunfinish").on("change", function() {
            var val = $(this).val();
            self.vm.unfinishQuery.subjectId = val;
            self.httpGetCourseList2();
        });
        $("#courseselect").on("change", function() {
            var val = $(this).val();
            self.getCourseChapter(val,function(data){
                self.vm.chapterList = data.courseChapterList;
            });
        });
        $("#unfinish_courseselect").on("change", function() {
            var val = $(this).val();
            self.getCourseChapter(val,function(data){
                self.vm.chapterList2 = data.courseChapterList;
            });
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
          $("#unfinishChapter").on("change", function() {
            var val = $(this).val();
            self.vm.courseQuery.chapterId = val;
            var list = self.vm.chapterList2.$model;
            for (var i = 0; i < list.length; i++) {
                if (list[i].courseChapterId === parseInt(val)) {
                    self.vm.unfinishChildren = list[i].childList;
                    break;
                }
            }
        });

        $("#segmentTypeS").on("change", function() {
            var val = $(this).val();
            self.vm.courseQuery.segmentType = val;
            self.httpGetSegmentList();
        });
        $("#courseChapterS").on("change", function() {
            var val = $(this).val();
            self.vm.courseQuery.segmentId = val;
            self.httpGetSegmentList();
        });

        $("#unfinishSegmentTypeS").on("change", function() {
            var val = $(this).val();
            self.vm.unfinishQuery.segmentType = val;
            self.httpGetSegmentList2();
        });
        $("#unfinishCourseChapterS").on("change", function() {
            var val = $(this).val();
            self.vm.unfinishQuery.segmentId = val;
            self.httpGetSegmentList2();
        });


        

    },
    initPage: function() {
        var self = this;
        var page1 = new J.Page({
            cid: "paging1",
            total: 0,
            change: function(pageData) {
                self.page1_Index = pageData.curPage;
                self.page1_Number = pageData.pageSize;
                self.httpExamination();
            }
        });
        this.pageNumber = page1.getPageSize();
        this.page1 = page1;

        var page2 = new J.Page({
            cid: "paging2",
            total: 0,
            change: function(pageData) {
                self.page2_Index = pageData.curPage;
                self.page2_Number = pageData.pageSize;
                self.httpLearn();
            }
        });
        this.pageNumber = page2.getPageSize();
        this.page2 = page2;

        var page3 = new J.Page({
            cid: "paging3",
            total: 0,
            change: function(pageData) {
                self.page3_Index = pageData.curPage;
                self.page3_Number = pageData.pageSize;
                self.httpUnlearn();
            }
        });
        this.pageNumber = page3.getPageSize();
        this.page3 = page3;

    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "learningsituation",
            types: [],
            courseList: [],
            courseList2: [],
            chapterList: [],
            chapterList2: [],
            subjects: [],
            grades: [],
            courseChapterList: [],
            children: [],
            unfinishChildren: [],
            studentList: [],
            taskList:[],
            taskList2:[],
            examQuery: {
                testPaperTypeId: "",
                gradeId: "",
                subjectId: "",
                studentUserId:""
            },
            courseQuery: {
                testPaperTypeId: "",
                gradeId: "",
                subjectId: "",
                courseId: "",
                chapterId: "",
                courseChapterId: "",
                segmentType: "",
                studentUserId:"",
                segmentId:""
            },
            unfinishQuery: {
                testPaperTypeId: "",
                gradeId: "",
                subjectId: "",
                courseId: "",
                chapterId: "",
                courseChapterId: "",
                segmentType: "",
                studentUserId:"",
                segmentId:""
            },
            classTestPaperList: [],
            courseChapterSegmentList: [],
            unfinishList: [],
            examfunc: function() {
                self.httpExamination();
            },
            coursefunc: function() {
                self.httpLearn();
            },
            unfinishfunc: function() {
                self.httpUnlearn();
            }

        })
        avalon.scan();
    },
    initQuery: function() {
        this.httpGetTypes();
        this.httpsysData();
        setTimeout(function() {
            $('body').show();
        }, 500);
        //this.httpGetCourseList();
        this.httpMyChildList();
        if(this.studentUserId){
            this.vm.courseQuery.studentUserId = this.studentUserId;
            this.vm.unfinishQuery.studentUserId = this.studentUserId;
        }
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
            gradeId: "",
            subjectId: "",
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
            self.vm.courseList = [];
            self.vm.courseList = data.courseList;

        });
    },
    httpGetCourseList2: function() {
        var self = this;
        var obj = self.vm.unfinishQuery.$model;
        var param = {
            gradeId: "",
            subjectId: "",
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
            self.vm.courseList2 = [];
            self.vm.courseList2 = data.courseList;

        });
    },
    getCourseChapter: function(courseId,func) {
        var self = this;
        var params = { courseId: courseId };
        J.getCourseChapter(params, function(data) {
            func && func(data);
        });
    },
    httpExamination: function() {
        var self = this;
        var obj = self.vm.examQuery.$model;
        var param = {
            pageIndex: self.page1_Index,
            pageNumber: self.page1_Number
        }
        if (obj.studentUserId) {
            param['studentUserId'] = obj.studentUserId;
        }else{
            return;
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
            self.page1.refresh(0);
        });
    },
    httpLearn: function() {
        var self = this;
        var obj = self.vm.courseQuery.$model;
        var param = {
            pageIndex: self.page2_Index,
            pageNumber: self.page2_Number
        }

        if (obj.studentUserId) {
            param['studentUserId'] = obj.studentUserId;
        }else{
            return;
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
            self.page2.refresh(0);

        });
    },
    httpUnlearn: function() {
        var self = this;
        var obj = self.vm.unfinishQuery.$model;
        var param = {
            pageIndex: self.page3_Index,
            pageNumber: self.page3_Number
        }
        if (obj.studentUserId) {
            param['studentUserId'] = obj.studentUserId;
        }else{
            return;
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
        if (obj.courseChapterId) {
            param['courseChapterId'] = obj.courseChapterId;
        }
        if (obj.segmentType) {
            param['segmentType'] = obj.segmentType;
        }
         if (obj.segmentId) {
            param['segmentId'] = obj.segmentId;
        }

        J.ajax({ url: "/report/unlearn", type: "GET" }, param, function(data) {
            $("body").show();
            self.vm.unfinishList = [];
            self.vm.unfinishList = data.courseChapterSegmentList;
            self.page3.refresh(0);
        });
    },
    httpMyChildList: function() {
        var self = this;

        J.ajax({ url: "/parents/myChildList", type: "GET" }, {}, function(data) {
            $("body").show();
            self.vm.studentList = data.childList;
            if(data.childList.length > 0){
                self.vm.examQuery.studentUserId = data.childList[0].studentUserId;
                self.vm.courseQuery.studentUserId = data.childList[0].studentUserId;
                self.vm.unfinishQuery.studentUserId = data.childList[0].studentUserId;
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
            
            
        });
    },
    httpGetSegmentList2:function(){
         var self = this;
         var params = {
            courseChapterId:self.vm.unfinishQuery.courseChapterId,
            segmentType:self.vm.unfinishQuery.segmentType
         };
         if(params.courseChapterId =="" || params.segmentType==""){
            return;
         }
         J.ajax({ url: "/course/getSegmentList", type: 'GET' }, params, function(data) {
           
            self.vm.taskList2 = data.segmentList;
            
            
        });
    }

});
var f = new LearningSituation();
