/**
模拟下拉菜单
参数 {
    type:go 超链接跳转页面、select 选中值  默认go 
    defaultval:0  默认选中  type=‘select’ 需要指定此参数
    containerID:  容器id  type=‘select’ 需要指定此参数
    onchange: 选中触发事件 type=‘select’ 需要指定此参数

}
**/
J.$package(function(J) {
    var TYPE_GO = "go";
    var TYPE_SELECt = "select";
    var DDmenu = new J.Class({
        init: function(args) {
            this.type = args.type || "go";
            if (TYPE_SELECt === this.type) {
                if (!args.defaultval) {
                    J.log("ddmenu 需要参数 defaultval");
                }
                this.defaultval = args.defaultval;
                if (!args.containerID) {
                    J.log("ddmenu 需要参数 containerID");
                }
                this.containerID = args.containerID;
                this.onchange = args.onchange || function() {};
                this.setDefault(this.defaultval);
            }
            this.bindEvent();
        },
        bindEvent: function() {
            var self = this;
            var ocontainer = $("#" + this.containerID);
            ocontainer.on("click", "li a", function() {
                var sval = $(this).attr("data-id");
                var stext = $(this).text();
                ocontainer.find(".menu").attr("data-val", sval);
                ocontainer.find(".menu span").text(stext);
                if (self.onchange) {
                    self.onchange.call(self, sval, stext);
                }
            });
        },
        //设置默认值
        setDefault: function(val) {
            var ocontainer = $("#" + this.containerID);
            ocontainer.find("li a").each(function() {
                if ($(this).attr("data-id") === val) {
                    ocontainer.find(".menu").attr("data-val", val);                    
                    ocontainer.find(".menu span").text($(this).text());
                }
            })
        }


    })

    J.DDmenu = J.DDmenu || {};
    J.DDmenu = DDmenu;
});
