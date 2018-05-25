var Task = new J.Class({
    init: function(arg) {
        "use strict";
        this.vm = null;
        this.tagId = J.getQueryString("tagid");
        this.type = J.getQueryString("type");
        this.pageIndex = 1;
        this.pageNumber = 10;
       
        this.initAvalon();
        this.bindEvent();
        this.initTree();
        this.initPage();
        //this.httpTask();
        this.checkType();



    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "taskc",
            query:{
                segmentTagId:"",
                type:self.type?self.type:"1"
            },
            segmentList: [],
            addTask:function(){
                if (self.vm.query.segmentTagId == "") {
                    J.alert("请先添加节点");
                    return;
                }
                J.goPage("task_add.html",{tagid:self.vm.query.segmentTagId});
            },
            preview:function(segmentId){
                J.goPage("task_view.html",{segmentId:segmentId});
            },
            edit:function(segmentId){
                J.goPage("task_add.html",{segmentId:segmentId});
            },
            del:function(id){
                self.httpDelTask(id);
            }


        });
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
                self.httpTask();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },

    bindEvent: function() {
        var self = this;

        $("#question_type").on("click", "li", function() {
            var type = $(this).attr("data-questiontype");
            self.vm.query.type = type;
            $(this).addClass("current").siblings().removeClass("current");
            self.pageIndex = 1;
            self.httpTask();
        });


    },
    initTree: function() {
        var self = this;
        var tree = new J.JTree({type:"4",tagId:self.tagId,func:function(tagId){
            self.vm.query.segmentTagId = tagId;
            
            self.httpTask();
        }});

    },
    checkType:function(){
        var self = this;
        if(!self.type){
            return;
        }
        $("#question_type li").each(function(){
            var obj = $(this)
            if(obj.attr("data-questiontype") == self.type){
                obj.addClass("current");
            }else{
                obj.removeClass("current");
            }
        });
    },
    httpTask: function() {
        var self = this;
        var params = this.vm.query.$model;
        params["pageIndex"] = this.pageIndex;
        params["pageNumber"] = this.pageNumber;
        if(!self.vm.query.segmentTagId){
            return;
        }
        J.ajax({ url: "/segment/getSegmentList", type: 'POST' }, params, function(data) {
            self.page.refresh(data.count, self.pageIndex);
            self.vm.segmentList = [];
            self.vm.segmentList = data.segmentList;
        });
    },
    httpDelTask: function(segmentId) {
        var self = this;
        J.ajax({ url: "/segment/delete", type: 'POST'}, {segmentId:segmentId}, function(data) {
            if(data.status == 2){
                J.alert("任务已发布，不能删除");
            }else{
                self.httpTask();
            }
        });
    },

    



});
var f = new Task();
