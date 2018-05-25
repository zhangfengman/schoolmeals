var CourseScore = new J.Class({
    init: function(arg) {
        this.classId = J.getQueryString("classid");
        this.courseId = J.getQueryString("courseid");
        this.sourceType = J.getQueryString("sourcetype");
        this.testPaperId = J.getQueryString("testpaperid");
        //节id
        this.chapterId = J.getQueryString("chapterid");
        //章id
        this.pId = J.getQueryString("pid");
        this.segmentId = J.getQueryString("segmentid");
        this.segmentType = J.getQueryString("segmenttype");
        this.rowSize = 10; //每行显示学生数量
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.canvas = null;
        this.PathArray = [];
        if (this.sourceType === "1") {
            this.httpGetCourseList();
            this.getCourseChapter(this.courseId);

        } else {
            this.httpTestPaperList();
            this.httpProgre();
            this.httpAnswer();
        }
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "coursescore",
            courseList: [],
            chapterList: [],
            children: [],
            rows: [],
            progreList: [],
            taskList:[],
            query: {
                courseId: "",
                chapterId: "",
                sourceId: "",
                segmentType: self.segmentType?self.segmentType:"1",
                testPaperId: self.testPaperId,
                segmentId:self.segmentId
            },
            answerList: [],
            studentUserId: "",
            studentUserName: "",
            sourceType: self.sourceType,
            examinationList: [],
            enlarge: function(path) {
                J.loadImg(path, function(img) {
                    self.showImg(path, img);
                })

            },
            queryCourse: function() {
                self.httpProgre();
                self.httpAnswer();
            },
            queryExam: function() {
                self.httpProgre();
                self.httpAnswer();
            }

        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $("#releaseBtn").on("click", function() {
            self.httpReleaseCourse();
        });
        $("#courseselect").on("change", function() {
            var val = $(this).val();
            self.getCourseChapter(val);
        });
        $("#chapter").on("change", function() {
            var val = $(this).val();
            var list = self.vm.chapterList.$model;
            for (var i = 0; i < list.length; i++) {
                if (list[i].courseChapterId === parseInt(val)) {
                    self.vm.children = list[i].childList;
                    break;
                }
            }
        });

         $("#segmentTypeS").on("change", function() {
            self.vm.query.segmentType = $(this).val();
            self.httpGetSegmentList();
        });
        $("#courseChapterS").on("change", function() {
            self.vm.query.sourceId = $(this).val();
            self.httpGetSegmentList();
        });
       
        $(".score_table").on("click", ".query_stu", function() {
            var sid = $(this).attr("sid");
            self.httpAnswer(sid);
        });
        $(".pre-btn").on("click", function() {
            self.httpMarkScore();
            
        });

        $(".next-btn").on("click", function() {
            self.httpMarkScore();
            
        });
        $(".score_content").on("click", ".score ul li", function() {
            var sid = $(this).parents(".score").attr("aid");
            $(this).addClass("current").siblings().removeClass("current");
            var score = $(this).attr("score");
            for (var i = 0; i < self.vm.answerList.length; i++) {
                if (parseInt(sid) === self.vm.answerList[i].studentQuestionAnswerId) {
                    self.vm.answerList[i].answerScore = score;
                }
            }

        });

        $("body").keydown(function(event) {
            if (event.keyCode == 38) {
                self.httpMarkScore();
                console.log("上");
            }
            if (event.keyCode == 40) {
                self.httpMarkScore();
                console.log("下");
            }
        });


    },
    showImg: function(path, img) {
        var self = this;

        var wsize = J.getWindowSize();
        var w = img.width > wsize[1] ? wsize[1] : img.width;
        var h = img.height * w / img.width;
        var h = h > wsize[0] ? wsize[0] : h;
        var ch = h - 120;
        layer.open({
            type: 1,
            title: '打分',
            area: [w + 'px', h + 'px'],
            content: '<canvas id="enlargeCanvas" width="' + w + '" height="' + ch + '"></canvas>',
            //btn: ['清除', '保存'],
            btn: ['确定'],
            yes: function() {
                /*var objs = self.canvas.getObjects();
                if (objs.length > 0) {
                    objs[objs.length - 1].remove();
                }*/
                layer.closeAll();
            },
            btn2: function() {

                //var image = canvas.toDataURL("image/png");

                /*  html2canvas(document.body).then(function(canvasn) {
                     
                     var image = canvasn.toDataURL("image/png");
                     $("#tttt").attr("src",image);

                     //document.body.appendChild(canvas);
                 });*/

            },
            success: function(layero) {

            }
        });
        canvas = new fabric.Canvas('enlargeCanvas', {
            isDrawingMode: true
        });
        fabric.Image.fromURL(path, function(img) {
            img.left = 0;

            img.setScaleX(w / img.width);
            img.setScaleY(ch / img.height);
            img.crossOrigin = 'anonymous';
            canvas.add(img);
        });
        canvas.freeDrawingBrush.color = "#f20007";
        canvas.freeDrawingBrush.width = 4;
        var PathArray = [];
        canvas.on('path:created', function(path) {
            PathArray.push(path);
        });
        this.canvas = canvas;
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
            if(self.vm.courseList.length>0){
                self.vm.query.courseId = self.vm.courseList[0].courseId;
            }


        });
    },
    getCourseChapter: function(courseId) {
        var self = this;
        var params = { courseId: courseId };
        J.getCourseChapter(params, function(data) {
            self.vm.chapterList = data.courseChapterList;
            self.vm.query.chapterId = self.pId;
            var list = self.vm.chapterList.$model;
            for (var i = 0; i < list.length; i++) {
                if (list[i].courseChapterId == self.pId) {
                    self.vm.children = list[i].childList;
                    break;
                }
            }

            self.vm.query.sourceId = self.chapterId;
            self.httpGetSegmentList();
            self.httpProgre();
            self.httpAnswer();

        });
    },
    //
    httpProgre: function() {
        var self = this;
        var query = self.vm.query.$model;

        var param = {
            classId: self.classId,
            courseChapterId: query.sourceId,
            segmentType: query.segmentType,
            sourceType: 1,
        }
        if (self.sourceType === "2") {
            param = {
                sourceId: query.testPaperId,
                sourceType: 2,
            }
        }
        J.ajax({ url: "/markScore/progre", type: 'GET' }, param, function(data) {
            $("body").show();
            var list = data.markScoreProgreList;
            var count = list.length;
            var row = Math.ceil(count / self.rowSize);
            self.vm.rows = [];
            //console.log(count +"_" + row )
            for (var i = 0; i < row; i++) {
                var start = i * self.rowSize;
                var end = start + self.rowSize;
                if (end > count) {
                    end = count;
                }
                var rowData = list.slice(start, end);
                self.vm.rows.push({ data: rowData });
                //console.log(start +"_" + end +":"+JSON.stringify(rowData));
            }

        });
    },
    httpAnswer: function(sid) {
        var self = this;
        var query = self.vm.query.$model;
        var param = {
                classId: self.classId,
                courseChapterId: query.sourceId,
                segmentType: query.segmentType,
                sourceType: 1,
            }
            //测试
        if (self.sourceType === "2") {
            param = {
                sourceId: query.testPaperId,
                sourceType: 2,
            }
        }
        if (sid) {
            param["studentUserId"] = sid;
        }
       

        J.ajax({ url: "/markScore/studentAnswer", type: 'GET' }, param, function(data) {
            var list = data.studentQuestionAnswerList;
            if(!list){
                return;
            }
            //处理打分列表
            for (var i = 0; i < list.length; i++) {
                var scores = [];
                for (var k = 0; k <= list[i].questionTotalScore; k++) {
                    scores.push(k);
                }
                list[i].scores = scores;

                if (list[i].questionAnswerScore == 0 && list[i].isMarkScore != 1) {
                    list[i].answerScore = "";
                } else {
                    list[i].answerScore = list[i].questionAnswerScore;
                }

            }
            self.vm.answerList = [];
            self.vm.answerList = list;
            self.vm.studentUserName = data.studentUserName;
            self.vm.studentUserId = data.studentUserId;
        });
    },
    httpMarkScore: function() {
        var self = this;
        var list = self.vm.answerList;

        var scoreList = [];
        var flag = true;
        for (var i = 0; i < list.length; i++) {
            var isUnion = -1;
            if (list[i].questionType === "4") {
                isUnion = 1;
            }
            if (list[i].isMarkScore === "-1") {
                scoreList.push({
                    isUnion: isUnion,
                    questionAnswerScore: list[i].answerScore,
                    studentQuestionAnswerId: list[i].studentQuestionAnswerId
                });
            }

        }

        J.ajax({ url: "/markScore/save", type: 'POST', bodyType: "raw" }, scoreList, function(data) {
            self.httpAnswer();
            self.httpProgre();
        });


    },
    httpTestPaperList: function() {
        var self = this;
        var params = {
            classId: self.classId
        };
        J.ajax({ url: "/examination/getClassTestPaperList", type: 'POST' }, null, function(data) {

            self.vm.examinationList = [];

            self.vm.examinationList = data.examinationList;

        });
    },
    httpGetSegmentList:function(){
         var self = this;
         var params = {
            courseChapterId:self.vm.query.sourceId,
            segmentType:self.vm.query.segmentType
         };
         if(params.courseChapterId =="" || params.segmentType==""){
            return;
         }
         J.ajax({ url: "/course/getSegmentList", type: 'GET' }, params, function(data) {
           
            self.vm.taskList = data.segmentList;
            if(data.segmentList.length>0 && !self.vm.query.segmentId){
                self.vm.query.segmentId = data.segmentList[0].segmentId;
            }
            
        });
    }

});
var f = new CourseScore();
