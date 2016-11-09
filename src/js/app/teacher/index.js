
define(function (require,exports) {
    
    
     var vm = avalon.define({
                $id: "test",
                name: "司徒正美",
                array: [11,22,33]
            })

    avalon.scan(document.body);
    function a(){
         $(".q_s").text("我日");
    

    
     }

    return {
        a:a
    }
    

});




