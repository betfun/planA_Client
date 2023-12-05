let pwUtils = {
  ajaxJSON: function (url, data, sCallback, sError, modal) {
    if (typeof $ === 'function') {
      if (typeof modal !== 'undefined') modal.modal('show');

      $.ajax({
        url: url,
        data: data,
        type: 'POST',
        dataType: 'JSON',
        cache: false,
        success: function (dt) {
          if (dt.result == '102') {
            alert(dt.msg);
            document.location.href = dt.rUrl;
          } else if (typeof sCallback === 'function') {
            sCallback(dt);
          } else {
            console.log(dt);
          }
        },
        complete: function () {
          if (typeof modal !== 'undefined') modal.modal('hide');
        },
        error: function (j, s, e) {
          console.log(
            'code:' + j.status + '\n' + 'message:' + j.responseText + '\n' + 'error:' + e
          );
          if (typeof sError === 'function') {
            sError(j);
          }
        },
      });
    } else console.log('jQuery undefined');
  },
  validateEmail: (_v) => {
    const patternEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
    if (!_v) {
      pwUtils.setAlert("Email" + "Please input");
      return false
    }
    if (!patternEmail.test(_v)) {
      pwUtils.setAlert("It's invalid email format");
      return false;
    }
    return true;
  },
  validatePassword: (password) => {
    var num = password.search(/[0-9]/g);
    var eng = password.search(/[a-zA-Z]/ig);
    //var spe = password.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

    if (password.length < 8 || password.length > 20) {
      pwUtils.setAlert("* Please enter between 8 and 20 digits.");
      return false;
    } else if (password.search(/\s/) != -1) {
      pwUtils.setAlert("Please enter the password without spaces.");
      return false;
    } else if (num < 0 || eng < 0) {
      pwUtils.setAlert("Please use the mixture of English, numbers, and special characters.");
      return false;
    }

    return true;
  },
  validateTRC20Address: async (address) => {
    const options = {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ address: address, visible: true })
    };

    try {
      let rs = await fetch('https://api.shasta.trongrid.io/wallet/validateaddress', options)
      let data = await rs.json();
      return data;
    } catch (err) {
      console.error(err);
      return {result: false, message: "서버 오류입니다."};
    }

  },
  setAlert: (_text, _title) => {
    if (typeof $ != 'function' && typeof $.gritter != 'object') {
      alert(_text);
      return false;
    } else {
      if (!_text) return false;

      $.gritter.add({
        title: _title ?? 'Alert',
        text: _text,
      });
    }
  },
  setAlertImg: (_title, _text) => {
    if (typeof $ != 'function' && typeof $.gritter != 'object') {
      alert(_text);
      return false;
    }
    var unique_id = $.gritter.add({
      // (string | mandatory) the heading of the notification
      title: _title || 'Alert',
      // (string | mandatory) the text inside the notification
      text: _text || '',
      // (string | optional) the image to display on the left
      image: '/plugins/gritter/images/notice.png',
      // (bool | optional) if you want it to fade out on its own or just sit there
      sticky: true,
      // (int | optional) the time you want it to be alive for before fading out
      time: '',
      // (string | optional) the class name you want to apply to that specific message
      class_name: 'my-sticky-class',
    });
  },
  swalSuccess: function (_text, _cb) {
    swal({
      title: 'Succeded',
      text: _text ?? '',
      icon: 'success',
      buttons: {
        cancel: {
          text: 'Close',
          value: null,
          visible: true,
          className: 'btn btn-secondary',
          closeModal: true,
        },
      }
    }).then(() => {
      if (typeof _cb === 'function') {
        _cb();
      }
    });
  },
  //Message alert
  swalFailed: function (_text, _cb) {
    swal({
      title: 'Failed',
      text: _text ?? '',
      icon: 'error',
      buttons: {
        cancel: {
          text: 'Close',
          value: null,
          visible: true,
          className: 'btn btn-secondary',
          closeModal: true,
        },
      }
    }).then(() => {
      if (typeof _cb === 'function') {
        _cb();
      }
    });
  },
  //Message Confirm alert 
  swalConfirm: function (_title, _text, _cb) {
    swal({
      title: _title ?? '정말 처리하겠습니까?',
      text: _text ?? '',
      icon: 'warning',
      buttons: {
        cancel: {
          text: '취소',
          value: null,
          visible: true,
          className: 'btn btn-secondary',
          closeModal: true,
        },
        confirm: {
          text: '승인',
          value: true,
          visible: true,
          className: 'btn btn-info',
          closeModal: true
        }
      }
    }).then((v) => {
      if (typeof _cb === 'function' && v) {
        _cb();
      }
    });
  },
  setFormatNumber: function (_x) {
    let parts = _x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },
  /**
   * Change the number in a given format with
   * @param {Number} _x
   * @param {Number} _places
   * @param {Boolean} _fix
   * @returns
   */
  setFormatNumberWithPlaces: function (_x, _places, _fix = false) {
    if (_fix && _places != undefined) {
      let num = Number(_x);
      if (typeof num === 'number' && isFinite(num)) {
        return num
          .toFixed(_places)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        return _x;
      }
    } else {
      return this.setFormatNumber(_x);
    }
  },
  /**
   * Numbers with Comma, decimal place
   * marked by <Small> by the decimal point
   * @param {Number} _x
   * @param {Number} _places
   * @param {Boolean} _fix
   * @returns
   */
  setFormatNumberWithPlacesSmall: function (_x, _places, _fix = false) {
    let rst = this.setFormatNumberWithPlaces(_x, _places, _fix);
    let parts = rst.toString().split('.');
    return `${parts[0]}.<small>${parts[1]}</small>`;
  },
  /* showLoading bootstrap */
  showLoading: function (target) {
    if (!target.querySelector('.' + pwUtils.preset.loader.class)) {
      let spinnerHtml = document.createElement('div');
      spinnerHtml.classList.add(pwUtils.preset.loader.class);
      spinnerHtml.innerHTML = pwUtils.preset.loader.html;
      target.classList.add(pwUtils.preset.loader.body);
      target.appendChild(spinnerHtml);
    }
  },
  /* hide Loading bootstrap */
  hideLoading: function (target) {
    if (!target) {
      target = $("." + pwUtils.preset.loader.body)[0];
      if (target) {
        /*
        $(target.querySelector('.' + pwUtils.preset.loader.class)).fadeOut(1000, () => {
          target.querySelector('.' + pwUtils.preset.loader.class).remove();
        });        
        */
        target.querySelector('.' + pwUtils.preset.loader.class).remove();

        target.classList.remove(pwUtils.preset.loader.body);
      }
    } else if (target.classList.contains(pwUtils.preset.loader.body)) {
      target.querySelector('.' + pwUtils.preset.loader.class).remove();
      target.classList.remove(pwUtils.preset.loader.body);
    }
  },
  setCookie: function (cookie_name, value, days) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + days);
    var cookie_value = escape(value) + ((days == null) ? '' : ';expires=' + exdate.toUTCString());
    document.cookie = cookie_name + '=' + cookie_value;
  },
  getCookie: function (cookieName) {
    var cookieValue = null;
    if (document.cookie) {
      var array = document.cookie.split(escape(cookieName) + '=');
      if (array.length >= 2) {
        var arraySub = array[1].split(';');
        cookieValue = unescape(arraySub[0]);
      }
    }
    return cookieValue;
  },
  deleteCookie: function (cookieName) {
    var temp = pwUtils.getCookie(cookieName);
    if (temp) {
      pwUtils.setCookie(cookieName, temp, 0);
    }
  },
  preset: {
    loader: {
      body: 'container-loading',
      class: 'container-loader',
      html: '<span class="spinner spinner-sm"></span>',
    },
  },
  /* move page */
  page_move: function(page)
  {
    $("#listForm")[0].s_page.value = page;   
    this.page_link();
  },
  /* reload page */
  page_link: function()
  {    
    $("#listForm")[0].action = window.location.pathname;
    $("#listForm")[0].submit();
  },
  userStatus: function(status) {
    let userStatus = $('.user-status');
    let bg = 'bg-dark bg-green bg-warning bg-secondary';
    //(1 : 미등록, 2: 활성, 3:비활성, 9:탈퇴)
    switch (status) {
      case 1:
        userStatus.removeClass(bg).addClass('bg-dark');
        userStatus.text('미등록');
        break;
      case 2:
        userStatus.removeClass(bg).addClass('bg-green');
        userStatus.text('활성');
        break;
      case 3:
        userStatus.removeClass(bg).addClass('bg-warning');
        userStatus.text('비활성');
        break;
      case 9:
        userStatus.removeClass(bg).addClass('bg-secondary');
        userStatus.text('탈퇴');
        break;
    }
  },
  getSelectedNode: function(idx) {
    pwUtils.ajaxJSON(
      '/user/getSelectedNode',
      {idx: idx}, 
      (data) => {          
        switch(data['result']) {
          case 100:
            let email = data['data']['f_email'];
            let balance = data['data']['f_balance'];
            let referralCnt = data['data']['referralCnt'];
            let groupCnt = data['data']['groupCnt'];
            let sumfee = data['data']['f_sumfee'];
            let sumcoms = data['data']['f_sumcoms'];
            let status = data['data']['f_status'];
            $('#modal-node').modal('show');
            $('#nodeEmail').text(email);
            $('#totalBalance').html(pwUtils.setFormatNumberWithPlacesSmall(balance, 2, true));
            $('#referralCnt').text(referralCnt);
            $('#groupCnt').text(groupCnt);
            $('#sumfee').html(pwUtils.setFormatNumberWithPlacesSmall(sumfee, 2, true));
            $('#sumcoms').html(pwUtils.setFormatNumberWithPlacesSmall(sumcoms, 2, true));
            pwUtils.userStatus(status);
            break;
          default:
            pwUtils.setAlert(data['msg'] || 'Server error');
            break;
        }                  
      },
      (j) => {
        pwUtils.setAlert(data['msg'] || 'Server error');
      });
  },
  nodeSearch: function() {
    var v = $('#nodeSearch').val();
    var r = $("#jstree").jstree(true).search(v);
  },
  openAllNode: function(e) {
    $("#jstree").jstree('open_all');
    $('.node.btn-group button').removeClass('active');
    $(e).addClass('active');
  },
  closeAllNode: function(e) {
    $("#jstree").jstree('close_all');
    $('.node.btn-group button').removeClass('active');
    $(e).addClass('active');
  },
  do_findpassword: function(f) {
    let target = f.closest('.login-container');

    let account = $(f).find('input[name=account').val();;

    if (account.length < 5) {
      alert('계정을 입력해주세요');
      return false;
    }

    pwUtils.showLoading(target);

    pwUtils.ajaxJSON('/auth/findpassword', $(f).serialize(), (data) => {
      switch (data['result']) {
        case 100:
          alert('이메일을 확인해 주세요.');
          location.href = '/';
          break;
        case 201:
          alert('아이디 또는 비밀번호를 확인해주세요.');
          break;
        case 401:
          alert('관리자에게 문의하시기 바랍니다.');
          break;
        case 403:
          alert('계정 승인을 기다리십시오.');
          break;
        default:
          alert(data.msg || "잘못된 접근입니다.");
          break;
      }
      pwUtils.hideLoading(target);
    });
  },
  do_resetpassword: (f) => {
    let target = f.closest('.login-container');

    let account = $(f).find('input[name=account').val();;

    if (account.length < 5) {
      alert('아이디를 확인해 주시기 바랍니다.');
      location.href = '/';
    }

    pwUtils.showLoading(target);

    pwUtils.ajaxJSON('/auth/resetpassword', $(f).serialize(), (data) => {        
      switch(data['result']) {
        case 100:
          alert('비밀번호가 변경되었습니다.');
          location.href = '/';
          break;
        case 201:
          alert('아이디 또는 비밀번호를 확인해 주시기 바랍니다.');              
          break;
        case 401:
          alert('관리자에게 문의하시기 바랍니다.');              
          break;
        case 403:
          alert('계정 승인을 기다리십시오.');              
          break;
        default:
          alert(data.msg || "잘못된 접근입니다.");
          break;
        }
        pwUtils.hideLoading(target);
    });    
  },
  do_login: function(f, path) {
    let target = f.closest('.app');
    pwUtils.showLoading(target);

    pwUtils.ajaxJSON(
      '/auth/login', 
      $(f).serialize(), 
      (data) => {          
        switch(data['result']) {
          case 100:
            location.href = path ?? '/';
            return;
            break;
          default:
            pwUtils.setAlert(data['msg'] || 'Server error');
            break;
        }                  
        pwUtils.hideLoading(target);  
      }
    );
  }
};

var modalUtils = {
  hidestay: function (id) {
    $(id).modal('hide');
    this.hideOverlay(id);
  },
  hide: function (id) {
    $(id).modal('hide');
    this.hideOverlay(id);
    this.setContent(id, '');
  },
  close: function (id) {
    $(id).find('.close-button').trigger("click");
  },
  setTitle: function (id, title) {
    $(id).find('.modal-title').html(title);
  },
  setContent: function (id, content) {
    $(id).find('.modal-body').html(content);
    this.hideOverlay(id);
  },
  showButton: function (id, caption) {
    if (typeof caption != "undefined")
      $(id).find('.modal-button').text(caption);
    else
      $(id).find('.modal-button').text("적용");
    $(id).find('.modal-button').show();
  },
  hideButton: function (id) {
    $(id).find('.modal-button').hide();
  },
  setButton: function (id, fnc) {
    $(id).find('.modal-button').off("click");
    $(id).find('.modal-button').on("click", fnc);
  },
  setCloseButton: function (id, fnc) {
    $(id).find('.close-button, .ico-close-button').on("click", fnc);
  },
  disableButton: function (id) {
    $(id).find('.ico-close-button').prop("disabled", true);
    $(id).find('.close-button').prop("disabled", true);
    $(id).find('.modal-button').prop("disabled", true);
  },
  enableButton: function (id) {
    $(id).find('.ico-close-button').prop("disabled", false);
    $(id).find('.close-button').prop("disabled", false);
    $(id).find('.modal-button').prop("disabled", false);
  },
  showOverlay: function (id, fade) {
    $(id).find('.overlay').show().addClass('d-flex');
  },
  hideOverlay: function (id, fade) {
    if (fade == undefined)
      $(id).find('.overlay').hide().removeClass('d-flex');
    else
      $(id).find('.overlay').fadeOut(400, function () { $(id).find('.overlay').removeClass('d-flex') });
  },
  showConfirm: function (title, callback) {
    if (title == undefined) title = '수정하시겠습니까?';
    this.showmin('#modal-sm', '<i class="fas fa-cogs text-danger"></i> 알림', title, '아니요', '', '예', callback);
  },
  hideConfirm: function () {
    this.hide('#modal-sm');
  },
  showAlert: function (id, msg, autoClose) {

    $(id).find('.modal-alertmsg').text(msg);

    if (autoClose == true) {
      $(id).find('.modal-alert').fadeTo(4000, 500).slideUp(500, function () {
        $(id).find('.modal-alert').slideUp(500);
      });
    } else {
      $(id).find('.modal-alert').show();
    }

  },
  hideAlert: function (id) {
    $(id).find('.modal-alert').hide();
  },
  getModalId: function (obj) {
    return '#' + $(obj).parents(".modal").attr("id");
  },
}