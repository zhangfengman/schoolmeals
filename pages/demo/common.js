(function () {
  'use strict';
  // 判断顶部导航条
  judgeTopNav();
  $(window).scroll(function () {
    judgeTopNav();
  });

  /**
   * 判断顶部导航条
   * 如果页面没有nav-split-line样式，则默认为白底顶部导航条
   */
  function judgeTopNav() {
    var windowTop = document.documentElement.scrollTop || document.body.scrollTop;
    var lineBoxTop = -1;
    try {
      lineBoxTop = document.getElementById('nav-split-ct').offsetTop - 60;
    } catch (e) {

    }
    if (windowTop > lineBoxTop) {
      $('#jr-top-nav').removeClass('normal').addClass('scroll-down');
    } else {
      $('#jr-top-nav').removeClass('scroll-down').addClass('normal');
    }
  }

  $('#jtnShowSearchBtnCt').click(function () {
    $('#jr-top-nav').addClass('search');
    $('#jtnNormalCt').hide();
    $('#jtnSearchCt').fadeIn();
    $('body').css('overflow', 'hidden');
    $('#jtnSearchInputCt').focus();
    if ($('#jtnSearchInputCt').val()) {
      $('#jtnSearchTypesCt').show();
    }
  });

  $('#jtnHideSearchBtnCt').click(function () {
    $('#jr-top-nav').removeClass('search');
    $('#jtnSearchCt').hide();
    $('#jtnNormalCt').fadeIn();
    $('body').css('overflow', 'visible');
  });

  $('#jtnMaskCt').click(function () {
    $('#jr-top-nav').removeClass('search');
    $('#jtnSearchCt').hide();
    $('#jtnNormalCt').fadeIn();
    $('body').css('overflow', 'visible');
  });

  $('#jtnSearchInputCt').keyup(function (e) {
    var keyword = $('#jtnSearchInputCt').val();
    if (keyword) {
      $('#jtnSearchTypesCt').show();
    } else {
      $('#jtnSearchTypesCt').hide();
    }
    if (e.keyCode === 13) {
      window.location.href = domain + '/shejishi/sousuo?s=' + encodeURIComponent(keyword);
    }
  });

  $('#jtnSearchDesignerCt').click(function () {
    window.location.href = domain + '/shejishi/sousuo?s=' + encodeURIComponent($('#jtnSearchInputCt').val());
  });

  $('#jtnSearch3dCt').click(function () {
    window.location.href = domain + '/anli/sousuo?type=3d&s=' + encodeURIComponent($('#jtnSearchInputCt').val());
  });

  $('#jtnSearch2dCt').click(function () {
    window.location.href = domain + '/anli/sousuo?type=2d&s=' + encodeURIComponent($('#jtnSearchInputCt').val());
  });

  var feedbackProcess = false;
  $('#feedbackBtn').click(function () {
    var feedbackContent = $('#feedbackContentCt').val();
    var feedbackEmail = $('#feedbackEmailCt').val();
    if (!feedbackContent) {
      $('#feedbackContentCt').focus().attr('placeholder', '请填写您的建议');
      return false;
    }
    if (feedbackEmail) {
      var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
      if (!reg.test(feedbackEmail)) {
        $('#feedbackEmailCt').next().html('请填入正确格式的邮箱地址');
        return false;
      }
    }
    if (!feedbackProcess) {
      feedbackProcess = true;
      $.post(domain + '/user/feedback', {
        content: feedbackContent,
        email: $('#feedbackEmailCt').val()
      }, function (rsp) {
        $('#feedbackModal').modal('hide');
      }, 'json').success(function () {

      }).error(function () {

      }).complete(function () {
        feedbackProcess = false;
      });
    }
  });

  $('#feedbackContentCt').blur(function () {
    $('#feedbackContentCt').attr('placeholder', '喜欢我们的设计家吗？欢迎吐槽和建议！');
  });

})();