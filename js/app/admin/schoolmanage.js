var SchoolManage = new J.Class({
    init: function(arg) {

        this.vm = null;
        this.pageIndex = 1;
        this.pageNumber = 0;
        this.school= null;
        this.type = "";
        this.bindEvent();
        this.initAvalon();
        this.initPage();
        this.httpSchoolList();
        var self = this;
        this.httpArea(0,function(data){
            self.vm.provinceList = data.areaList;
        });

    },
    bindEvent:function(){
        var self = this;
        $("#province").bind("change",function(){
            var code = $("#province").val();
            if(code =="0"){
                self.showE($("#province"),"请选择省");
            }else{
                self.hideE($("#province"));
               self.httpArea(code,function(data){
                    self.vm.cityList = data.areaList;
                }); 
            }
            
        });
        $("#city").bind("change",function(){
            var code = $("#city").val();
             if(code =="0"){
                self.showE($("#city"),"请选择市");
            }else{
                self.hideE($("#city"));
                self.httpArea(code,function(data){
                    self.vm.districtList = data.areaList;
                });
            }
        });
    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "schoolController",
            list: [],
            query: {
                name:"",
                schoolId:""
            },
            data:{
                name:"",
                provinceId:"0",
                cityId:"0",
                areaId:"0"
            },
            provinceList:[],
            cityList:[],
            districtList:[],
            searchFunc: function() {
                self.httpSchoolList();
            },
            exportFunc: function() {
                var param = self.getParam();
                J.exp("/school/export", param);
            },
            del: function(cid) {
                new J.alert({
                        type: "confirm",
                        msg: "确定要删除？",
                        confirmFn: function() {
                           self.httpDel(cid);
                        }
                    });
                
            },
            show:function(){
                $("#myModal").modal('show');
                self.vm.data.name="";
                self.vm.data.provinceId ="0";
                self.vm.data.cityId = "0";
                self.vm.data.areaId = "0";
                self.type = "1";
            },
            add:function(){
                self.httpEditSchool();
            },
            edit:function(school){
                self.type = "2";
                self.school = school.$model;
                self.setData(self.school);


                $("#myModal").modal('show');
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
                self.httpSchoolList();
            }
        });
        this.pageNumber = page.getPageSize();
        this.page = page;
    },
    getParam:function(){
        var obj = this.vm.query.$model;
        var param = {};
        if(obj.schoolId){
            param["schoolId"] = obj.schoolId;
        }
        if(obj.name){
            param["name"] = obj.name;
        }
        return param;
    },
    setData:function(school){
         var self = this;
         this.vm.data.name = school.name;
         this.vm.data.provinceId = school.provinceId;
         //市
         this.httpArea(school.provinceId,function(data){
            self.vm.cityList = data.areaList;
            self.vm.data.cityId = school.cityId;
         });
         //区
         this.httpArea(school.cityId,function(data){
            self.vm.districtList = data.areaList;
            self.vm.data.areaId = school.areaId;
         });

    },  
    showE:function(target,msg){
        if(target.parent().siblings(".jtips").length == 0){
            target.parent().after("<div Class='jtips'>"+msg+"</div>")
        }else{
            target.parent().siblings(".jtips").html(msg);
        }
        target.parent().parent().addClass("jerror");
    },
    hideE:function(target){
        target.parent().parent().removeClass("jerror");
        target.parent().siblings(".jtips").remove();
    },
    httpSchoolList: function() {
        var self = this;
        var param = this.getParam();
        param["pageIndex"] = this.pageIndex;
        param["pageNumber"] = this.pageNumber;
       
        J.ajax({ url: "/school/getSchoolList", type: 'GET' }, param, function(data) {
            self.page.refresh(data.count, self.pageIndex);
            self.vm.list = [];
            self.vm.list = data.schoolList;
            $("body").show();
        });
    },
    httpDel: function(cid) {
        var self = this;
        J.ajax({ url: "/school/deleteSchool", type: 'GET' }, { schoolId: cid }, function(data) {
            self.httpSchoolList();
        });
    },
    httpArea: function(cid,func) {
        J.ajax({ url: "/area/getAreaList", type: 'GET' }, { parentAreaId: cid }, function(data) {
           func && func(data);
        });
    },
    httpEditSchool: function() {
        var self = this;
        var vform = new J.Vform({
            id: "newschool_form",
            rowq: ".jrow"
        });
        var validRs = vform.validate();
        if (!validRs) {
            return;
        }


        var param = self.vm.data.$model;
        if(self.type == "2"){
            param["schoolId"] = self.school.schoolId;
        }
        if(param.provinceId =="0"){
            self.showE($("#province"),"请选择省");
            return;
        }
        if(param.cityId =="0"){
            self.showE($("#city"),"请选择市");
            return;
        }

        J.ajax({ url: "/school/editSchool", type: 'POST' },param, function(data) {
           $("#myModal").modal('hide');
           self.httpSchoolList();
        });
    }
    




});
var f = new SchoolManage();
