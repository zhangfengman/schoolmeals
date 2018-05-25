var InfoCenterStudent = new J.Class({
    init: function(arg) {
        this.pageIndex = 1;
        this.pageNumber = 0;
        this.initPage();
        this.initAvalon();
        this.httpMyClassList();
      
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "messagecenter",
            classList: [],
            annunciateList:[],
            message:{},
            classId:"",
            msg:{
                publicTime:"",
                promulgator:"",
                content:""
            },
            change:function(){
                self.pageIndex = 1;
                self.httpMessageList( $(".class_select").val());
            },
            publish:function(type){
                J.goPage("messagerelease.html",{type:type})
            },
            read:function(item){
               
                self.httpMessageRead(item);
            }

        })
        avalon.scan();
    },
    initPage: function() {
        var self = this;
        var page = new J.Page({
            cid: "paging",
            total: 0,
            change: function(pageData) {
                self.pageIndex = pageData.curPage;
                self.pageNumber = pageData.pageSize;
                self.httpMessageList(self.vm.classId);
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },
     //获取教师班级列表
    httpMyClassList: function() {
        var self = this;
       
        J.ajax({ url: "/class/myClassList", type: 'GET' }, {}, function(data) {
            
            self.vm.classList = data.classList;
            if (data.classList.length > 0) {
                self.vm.classId = data.classList[0].classId;
                self.httpMessageList(self.vm.classId);
            }
            
        });
    },
    httpMessageList: function(classId) {
        var self =this;
        var param = {
            classSubjectId:classId,
            pageNo:self.pageIndex,
            pageSize:self.pageNumber
        };

        J.ajax({ url: "/annunciate/select", type: 'POST' }, param, function(data) {           
            self.page.refresh(data.count, self.pageIndex);
            self.vm.annunciateList = [];
            self.vm.annunciateList = data.annunciateList;
            $("body").show();
        });
    },
    httpMessageRead: function(item) {
        var self =this;
        var param = {
            annunciateId:item.annunciateId,
            classSubjectId:item.classSubjectId
        };
        J.ajax({ url: "/annunciate/read", type: 'POST' }, param, function(data) {
            if (window.frames.length != parent.frames.length) {
                top.refreshRedDot();
            } 
            
            self.vm.message = data;
            self.vm.message = data;
            self.vm.msg.publicTime = data.publicTime;
            self.vm.msg.name = data.name;
            self.vm.msg.content = data.content;
        });
    }
});
var f = new InfoCenterStudent();
