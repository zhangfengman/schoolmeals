 /**
  *  Page 插件
  *  
  **/
 J.$package(function(J) {
     var Page = new J.Class({
         init: function(args) {
             this.pageSizeList = [5, 10, 15, 20];
             this.pageSize = 5;
             this.total = args.total;
             this.totalPage = Math.ceil(args.total/this.pageSize);
             this.curPage = 1;
             this.cid = args.cid;
             this.container = $("#" + this.cid);
             this.change = function() {};
             if (args.change) {
                 this.change = args.change;
             }
             this.createHtml();
             this.bindEvent();
         },
         getPageSize:function(){
            return this.pageSize;
         },

         refresh:function(total,curPage){
            this.total = total;
            this.totalPage = Math.ceil(total/this.pageSize);
            if(curPage){
                this.curPage = curPage;
            }
            this.createHtml();
         },
         bindEvent: function() {
            var self = this;
             this.container.on("change", "select", function() {

                var val = $(this).val();
                self.pageSize = parseInt(val);
                self.change.call(self,{pageSize:self.pageSize,curPage:self.curPage});
             });
             this.container.on("click", "#_pageindex li", function() {
               
                var num = $(this).attr("data-num");
                if(num){
                    if("pre" === num){
                        if(self.curPage > 1){
                            self.curPage -= 1;
                        }                        
                    }else if("next" === num){
                        if(self.curPage < self.totalPage){
                            self.curPage += 1;
                        }                       
                    }else{
                        self.curPage = parseInt(num);
                    }
                    self.change.call(self,{pageSize:self.pageSize,curPage:self.curPage});
                }
                
             });
             this.container.on("click", "#_pageconfirm", function() {

                var num =  self.container.find("#_pagenum").val();
                self.curPage = parseInt(num);
                self.change.call(self,{pageSize:self.pageSize,curPage:self.curPage});
             });
         },
         createHtml: function() {
            if(this.totalPage === 1 || this.totalPage === 0){
                this.container.html("");
                return ;
            }
             var html = [];
             html.push('<div class="paging fright">');
             html.push('        <div class="jselect">');
             html.push('            <select >');
             for (var i = 0; i < this.pageSizeList.length; i++) {
                 if (this.pageSizeList[i] === this.pageSize) {
                     html.push('<option value="' + this.pageSizeList[i] + '" selected="selected">' + this.pageSizeList[i] + '</option>');
                 } else {
                     html.push('<option value="' + this.pageSizeList[i] + '">' + this.pageSizeList[i] + '</option>');
                 }
             }
             html.push('            </select>');
             html.push('        </div>');
             html.push('        <ul id="_pageindex">');
             var pp = this.getPageNumDOM(this.totalPage,this.curPage);
             html.push(pp);
             html.push('        </ul>');
             html.push('        <div class="skip">到第');
             html.push('            <input id="_pagenum" type="text">');
             html.push('        页</div>');
             html.push('        <div class="confirm">');
             html.push('            <div id="_pageconfirm" class="btn-mini">确定</div>');
             html.push('        </div>');
             html.push('    </div>');
             this.container.html( html.join(""));
         },
         getPageNumDOM:function(totalPage,curPage){
            var html = [];
            if(totalPage <5){
                for(var i=1;i<=totalPage;i++){
                    var cls = "";
                    if(i === curPage ){
                         cls = "active";
                    }
                    html.push('<li class="'+cls+'"  data-num="'+i+'">'+i+'</li>');                    
                }
                
               
            }else if(totalPage == 5){
                for(var i=1;i<=totalPage;i++){
                    var cls = "";
                    if(i === curPage ){
                         cls = "active";
                    }
                    if( i===3){
                        html.push('<li>...</li>');                    
                    }else{
                       html.push('<li class="'+cls+'"  data-num="'+i+'">'+i+'</li>');                     
                    }
                    
                }
            }else if(totalPage > 5){
                html.push('<li data-num="pre"><</li>');
                var cls ="";
                if(1 === curPage ){
                    cls = "active";
                    html.push('<li class="'+cls+'"  data-num="1">1</li>'); 
                }else{
                    html.push('<li data-num="1">1</li>'); 
                    cls = "active";
                    html.push('<li class="'+cls+'" data-num="1" >'+curPage+'</li>'); 
                }
                if(curPage !== totalPage){
                    html.push('<li>...</li>'); 
                    html.push('<li  data-num="'+totalPage+'" >'+totalPage+'</li>');
                }                              
                html.push('<li data-num="next">></li>');
            }
            return html.join("");
         }


     })
     J.Page = J.Page || {};
     J.Page = Page;
 });
