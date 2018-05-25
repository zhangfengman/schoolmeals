var friendlink = new J.Class({
    init: function(arg) {

        this.bindEvent();
        var vm = avalon.define({
            $id: "test",
            name: "司徒正美",
            array: [11, 22, 33]
        })

        avalon.scan(document.body);
    },
    bindEvent: function() {

    },
    http: function() {

    }
});
var f = new friendlink();
