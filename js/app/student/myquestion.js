var MyQuestion = new J.Class({
    init: function(arg) {
        this.classId = 22; //J.getQueryString("classid");
        this.courseId = "";
        this.sourceType = "";
        this.curQskId= "";
        this.vm = null;
        this.initAvalon();
        this.bindEvent();
        this.httpClassList();
        //this.httpRequestList();
        this.createUpload();
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "myquestion",
            askList: [],
            classList: [],
            segmentList: [],
            query: {
                classId: "",
                courseChapterSegmentId: "",
                isResponse: "-1"

            },
            askquestion: "",
            answer: function(courseChapterSegmentId, askId) {
                self.httpSend(courseChapterSegmentId, askId);
            },
            search: function() {
                self.httpRequestList();
            },
            switch: function(val) {
                self.vm.query.isResponse = val;
                self.httpRequestList();
            }

        })
        avalon.scan();
    },
    bindEvent: function() {
        var self = this;
        $("#classList_select").on("change", function() {
            var val = $(this).val();
            self.httpSegmentList(val);
        });
         $(".lesson_main").on("click", ".question_answer_avatar", function() {
            var sid = $(this).attr("sid");
            var askid = $(this).attr("askid");
            self.curQskId =sid+"_"+askid;
            $("#uploadAudio").trigger("click");
        });
    },

   
    httpClassList: function() {
        var self = this;
        J.ajax({ url: "/class/myClassList", type: 'GET' }, {pageIndex:1,pageNumber:50}, function(data) {
            $("body").show();
            self.vm.classList = data.classList;
            if(data.classList.length>0){
                self.vm.query.classId = data.classList[0].classId;
                self.httpSegmentList(data.classList[0].classId);
            }

        });
    },
    httpSegmentList: function(classId) {
        var self = this;
        J.ajax({ url: "/ask/getMyAskSegmentList", type: 'GET' }, { classId: classId }, function(data) {
            self.vm.segmentList = [];

            self.vm.segmentList = data.courseChapterSegmentList;
            if(data.courseChapterSegmentList.length>0){
                self.vm.query.courseChapterSegmentId = data.courseChapterSegmentList[0].courseChapterSegmentId;
                self.httpRequestList();
            }

        });
    },
    httpRequestList: function() {
        var self = this;
        var params = self.vm.query.$model;
        if(!params.classId){
            return;
        }
         if(!params.courseChapterSegmentId){
            return;
        }
        params['pageIndex'] = 0;
        params['pageNumber'] = 10;
        J.ajax({ url: "/ask/course/getAskList", type: 'GET' }, params, function(data) {
            $("body").show();
            self.vm.askList = [];
            self.vm.askList = data.askList;
        });
    },
    createUpload: function() {
        var self = this;
        self.upload = new J.Upload({
            browseButton: "uploadAudio",
            container: "uploadAudioContainer",
            complete: function(files) {
                var val = files.pop().path;               
                $("#"+self.curQskId).val(val).attr("readonly","readonly");
            }
        });

    },
    httpSend: function(courseChapterSegmentId, askId) {
        var self = this;
        var content =   $("#"+courseChapterSegmentId+"_"+askId).val();
        var params = {
            courseChapterSegmentId: courseChapterSegmentId,
            askId: askId,
            content: content
        };
        if (!params.content) {
            return;
        }
        J.ajax({ url: "/ask/course/send", type: 'GET' }, params, function(data) {
            $("body").show();
            self.httpRequestList();
        });
    }


});
var f = new MyQuestion();
