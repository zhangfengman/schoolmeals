var Task = new J.Class({
    init: function(arg) {
        "use strict";
        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 2;
        this.tagId = "";
        this.type = "";
        this.initAvalon();
        this.bindEvent();
        this.initTree();
        this.initPage();
        //this.httpTask();



    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "taskc",
            query:{
                segmentTagId:"",
                type:"1"
            },
            segmentList: [],
            chooseList:[],
            addTask:function(){
                if (self.vm.query.segmentTagId == "") {
                    J.alert("请先添加节点");
                    return;
                }
                J.goPage("task_add.html",{tagid:self.vm.query.segmentTagId});
            },
            preview:function(segmentId){
                J.goPage("task_add.html",{segmentId:segmentId});
            },
            add:function(id){
            	self.addQuestion(id);
            },
            del:function(id){
            	self.delQuestion(id);
            },
            confirm:function(){
            	index = parent.layer.getFrameIndex(window.name); //获取窗口索引
            	parent.layer.close(index);
            	store.set("chooselist", JSON.stringify(self.vm.chooseList.$model));
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

    delQuestion: function(segmentId) {
        var list = this.vm.chooseList;
        for (var i = 0; i < list.length; i++) {
            if (segmentId === list[i].segmentId) {
                list.splice(i, 1);
                break;
            }
        }
    },
    addQuestion: function(segmentId) {
        var item = this.getQuestion(segmentId);
        if (!this.checkRepeat(item)) {
            this.vm.chooseList.push(item);
        }

    },
    getQuestion:function(segmentId){
    	var reObj = null;
    	var list  = this.vm.segmentList.$model;
    	for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if(item.segmentId == segmentId){
            	reObj = item;
            	break;
            }
        }
        return reObj;
    },
    checkRepeat: function(item) {
        var list = this.vm.chooseList;
        var flag = false;
        for (var i = 0; i < list.length; i++) {
            if (item.segmentId === list[i].segmentId) {
                flag = true;
                break;
            }
        }
        return flag;

    },
    initTree: function() {
        var self = this;
        var tree = new J.JTree({type:"4",func:function(tagId){
            self.vm.query.segmentTagId = tagId;
            self.httpTask();
        }});

    },
    httpTask: function() {
        var self = this;
        var params = this.vm.query.$model;
        params["pageIndex"] = this.pageIndex;
        params["pageNumber"] = this.pageNumber;
        J.ajax({ url: "/segment/getSegmentList", type: 'POST' }, params, function(data) {
            self.page.refresh(data.count, self.pageIndex);
            self.vm.segmentList = [];
            self.vm.segmentList = data.segmentList;
        });
    },
    httpDelTask: function(segmentId) {
        J.ajax({ url: "/segment/delete", type: 'POST'}, {segmentId:segmentId}, function(data) {
            if(data.status == 2){
                J.alert("任务已发布，不能删除");
            }
        });
    },

    



});
var f = new Task();
