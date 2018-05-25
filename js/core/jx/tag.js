 /**
    *   章节逻辑处理 插件
    *  args :
          {   type:"manage", // manage、view
              //当前课程的章节
              courseId:this.courseId,
              update:function(){
                  更新章节数据
              },
              //选中章节业务处理
              change:function(pid,id){
      
              }
          }
    **/
 J.$package(function(J) {
     var Tag = new J.Class({
         init: function(args) {
             this.modalID = "chapterModal";
             this.q = ".lesson_chapter";
             this.courseId = "";
             this.parentID = "";
             this.paramData = args.data;
             this.id = "";
             if (args) {
                 this.courseId = args.courseId
             }
             this.update = function() {};
             if (args && args.update) {
                 this.update = args.update;
             }
             this.change = function() {};
             if (args && args.change) {
                 this.change = args.change;
             }
             this.data = [];
             this.mode = "add"; //edit
             if (args && args.type && args.type === "manage") {
                 this.initHtml();
             }
             this.bindEvent();
         },
         bindEvent: function() {
             var self = this;
             $(this.q).on("click", ".chapter", function(event) {
                 var _self = $(this);
                 var target = $(event.target);
                 self.parentID = _self.attr("pid");
                 self.id = _self.attr("id");
                 if (target.hasClass("addz") || target.hasClass("addj")) {

                     $("#" + self.modalID + " input").val("");
                     $('#chapterModal').modal('show');
                     if (target.hasClass("addz")) {
                         self.mode = "addz";
                         self.setLable("添加标签", "标签");
                     } else if (target.hasClass("addj")) {
                         self.mode = "addj";
                         self.setLable("添加子标签", "子标签");
                     }
                     return false;
                 } else if (target.hasClass("edit")) {

                     var name = _self.attr("name");;
                     $("#" + self.modalID + " input").val(name);
                     $('#chapterModal').modal('show');
                     self.mode = "edit";
                     self.setLable("修改标签", "标签");

                     return false;
                 } else if (target.hasClass("delete")) {

                     self.httpcourseChapterDel(self.id);
                     return false;
                 }

                 if (!_self.hasClass("current")) {
                     _self.addClass("current");
                     _self.find("ul").slideDown("slow");
                     self.change.call(_self, self.parentID,self.id);
                     _self.siblings(".chapter").removeClass("current").find("ul").slideUp();
                 } else {
                     _self.removeClass("current");
                     _self.find("ul").slideUp("slow");
                 }

             });
             $(this.q).on("click", ".section", function() {
                 var _self = $(this);
                 var target = $(event.target);
                 self.parentID = _self.attr("pid");
                 self.id = _self.attr("id");
                 if (target.hasClass("edit")) {
                     var name = _self.attr("name");;
                     $("#" + self.modalID + " input").val(name);
                     $('#chapterModal').modal('show');
                     self.mode = "edit";
                     self.setLable("修改子标签", "子标签");
                     return false;
                 } else if (target.hasClass("delete")) {

                     self.httpcourseChapterDel(self.id);
                     return false;
                 }

                 _self.addClass("active");
                 self.change.call(_self, self.parentID,self.id);
                 _self.siblings(".section").removeClass("active");
                 return false;
             });
             //
             $("#" + this.modalID).on("click", ".cbtn", function() {
                 if (self.mode === "addz") {
                     self.httpcourseChapterAdd(self.parentID);
                 } else if (self.mode === "addj") {
                     self.httpcourseChapterAdd(self.id);
                 } else if (self.mode === "edit") {
                     self.httpcourseChapterUpdate(self.id);
                 }

             });
             $(".lesson_chapter").on("click", ".editlist", function() {

                 $(this).siblings(".operatebtns").toggle();
                 return false;
             });
            
         },
         setData: function(data) {
             this.data = data;
         },
         setParamData: function(data) {
             this.paramData.gradeId = data.gradeId;
             this.paramData.subjectId = data.subjectId;
         },
         setGrade: function(gradeId) {
             this.paramData.gradeId = gradeId;
             
         },
         setSubject: function(subjectId) {             
             this.paramData.subjectId = subjectId;
         },
         getVal: function() {
             var chapterID = $(this.q + ".current .chapter-head").attr("data-id");
             var sectionID = $(this.q + ".current .chapter-head .active").attr("data-id");
             return { chapter: chapterID, section: sectionID };
         },
         setLable: function(title, lable) {
             $("#" + this.modalID + " .modal-header span").text(title);
             $("#" + this.modalID + " .jlabel").text(lable);
         },
         //选中节点
         checked:function(pid,id){
            $(this.q).find(".chapter").each(function(){
                var _id = $(this).attr("id");
                if(pid+"" === _id){
                    $(this).addClass("current");
                    $(this).find("ul").show();
                    $(this).find(".section").each(function(){
                        var subid =  $(this).attr("id");
                        if(id+"" === subid){
                            $(this).addClass("active");
                        }
                    });
                }
            });
         },
         initHtml: function() {
             var html = [];
             html.push('<div class="cdialog modal fade" id="' + this.modalID + '" tabindex="-1" role="dialog">');
             html.push('<div class="modal-dialog" role="document">');
             html.push('<div class="modal-content">');
             html.push('    <form id="newclass_form">');
             html.push('        <div class="modal-header">');
             html.push('            <span>添加章</span>');
             html.push('            <div class="cclose" data-dismiss="modal"></div>');
             html.push('        </div>');
             html.push('        <div class="modal-body jcms">');
             html.push('            <div class="jrow">');
             html.push('                <div class="jlabel">章</div>');
             html.push('                <div class="jinput">');
             html.push('                    <input class="" type="text" />');
             html.push('                </div>');
             html.push('            </div>');
             html.push('        </div>');
             html.push('        <div class="modal-footer">');
             html.push('            <div class="cbtn">确定</div>');
             html.push('        </div>');
             html.push('    </form>');
             html.push('</div>');
             html.push('</div>');
             html.push('</div>');
             $("body").append(html.join(""));
         },
         //增加章节
         httpcourseChapterAdd: function(pid) {
             var self = this;
             var name = $("#" + self.modalID + " input").val();
             if (name) {
                 var params = {
                     name: name,
                     gradeId: self.paramData.gradeId,
                     subjectId:self.paramData.subjectId,
                     parentsTagId: pid,
                     type:self.paramData.type
                 }
                 J.ajax({ url: "/tag/edit", type: 'POST' }, params, function(data) {
                     $('#chapterModal').modal('hide');
                     self.update();
                 });
             }

         },
          //增加章节
         httpcourseChapterUpdate: function(id) {
             var self = this;
             var name = $("#" + self.modalID + " input").val();
             if (name) {
                 var params = {
                     name: name,                     
                     tagId:id
                 }
                 J.ajax({ url: "/tag/edit", type: 'POST' }, params, function(data) {
                     $('#chapterModal').modal('hide');
                     self.update();
                 });
             }

         },
        
         //删除章节
         httpcourseChapterDel: function(pid) {
             var self = this;
             J.ajax({ url: "/tag/delete", type: 'GET' }, { tagId: pid }, function(data) {
                 
                 self.update();
             });
         },
     })
     J.Tag = J.Tag || {};
     J.Tag = Tag;
 });
