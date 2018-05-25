var Updatepwd = new J.Class({
    init: function(arg) {
        "use strict";
        this.vm = null;


        this.initAvalon();



    },
    initAvalon: function() {
        var self = this;
        this.vm = avalon.define({
            $id: "updatepwd",
            data: {
                oldPassword: "",
                newPassword: "",
                newPassword2: ""
            },
            update: function(segmentId) {
                var vform = new J.Vform({
                    id: "form",
                    rowq: ".jrow"
                });
                var validRs = vform.validate();
                if (!validRs) {
                    return;
                }
                if(self.vm.data.newPassword != self.vm.data.newPassword2){
                    J.alert("两次密码不一致");
                    return;
                }
                self.httpUpdatepwd();
            }
        });
        avalon.scan();
    },

    httpUpdatepwd: function() {
        var self = this;
        var params = this.vm.data.$model;

        J.ajax({ url: "/user/updateMyPassword", type: 'POST' }, params, function(data) {
            if(data.resultCode+"" == "1"){
                J.alert("密码修改成功");
            }
        });
    },






});
var f = new Updatepwd();
