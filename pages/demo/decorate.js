/**
 * Created by a on 2017/8/3.
 */
$(function () {
    $(".rule").click(function (e) {
        console.log(123);
        $(".m_tap").css("display","block");
       $('html').setAttribute("style","overflow:hidden;height:100%;");
       $('body').setAttribute("style","overflow:hidden;height:100%;");
       // $(".m_tap").css("overflow","auto");
        setTimeout(function () {
            myScroll = new IScroll('#wrapper', {
                scrollbars: true
            });
        },500);
    });
    $(".close_tap").click(function (e) {
        $(".m_tap").css("display","none");
    });

});
$("#mobile_show_duobao_all_num").show();
