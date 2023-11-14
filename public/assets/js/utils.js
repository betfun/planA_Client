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
  //Ajax file Json
  ajaxFileJSON: function (url, data, sCallback, modal, sError) {
    if (typeof $ === 'function') {      
      if (typeof modal !== 'undefined') modal.modal('show');
      $.ajax({
        url: url,
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        cache: false,
        //success: typeof sCallback === 'function'?sCallback:function(dt) {console.log(dt)},
        success: function (dt) {
          if (dt.result == '102') {
            alert(dt.msg);
            document.location.href = dt.rUrl;
          } else {
            if (typeof sCallback === 'function') {
              sCallback(dt);
            } else {
              console.log(dt);
            }
          }
        },
        complete: function () {
          if (typeof modal !== 'undefined') modal.modal('hide');
        },
        error: function (j, s, e) {
          if (typeof sError !== 'function') {
            console.log(
              'code:' + j.status + '\n' + 'message:' + j.responseText + '\n' + 'error:' + e
            );
          } else {
            sError(j);
          }
        },
      });
    } else console.log('jQuery undefined');
  },
  validateEmail: (_v) => {
    const patternEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
    if (!_v ) {
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
  
    if(password.length < 8 || password.length > 20) {     
      pwUtils.setAlert("* Please enter between 8 and 20 digits.");
      return false;
    } else if(password.search(/\s/) != -1) {
      pwUtils.setAlert("Please enter the password without spaces.");
      return false;
    } else if(num < 0 || eng < 0) {        
      pwUtils.setAlert("Please use the mixture of English, numbers, and special characters.");
      return false;
    } 
      
    return true;    
  },
  setLocale: (locale, thiz) => {
    savedLocale = locale;
    renderText();
    $('#dropdownMenuButton').html(thiz.innerHTML);
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
  setNotice: (_title, _content, _link, _id, ) => {
    if (typeof $ != 'function') return;

    let pwCookie = pwUtils.getCookie(`pwAnnounce_${_id}`);

    if (pwCookie) return;

    $('.announcement-backdrop').show();
    $('body').css('overflow', 'hidden');
    
    if ($('.ofBar-area').length == 0) {
      $('body').append('<div class="ofBar-area"></div>');
    }

    let txtOneDay = 'Not showing on Today';
    let idnotshowme = 'notshowme'+_id;

    _content = _content.replace(/\r\n/g, '<br/>');

    let ofBar = $(`
    <div class="ofBar">
      <div class="ofBar-content">
        <h5 class="ofBar-title"><img src="/plugins/gritter/images/notice.png"> ${_title}.</h5>      
        <div class="ofBar-body">${_content}</div>
      </div>
      <div class="ofBar-bottom">
        <div class="col-6">
          <div class="form-check form-switch d-flex ">
            <input class="form-check-input" type="checkbox" name="notshowme" id="${idnotshowme}">
            <label class="form-check-label mb-0 ms-3" for="${idnotshowme}">${txtOneDay}</label>
          </div>
        </div>
        <div class="col-6 text-end">
          <a href="javascript:;" class="ofBar-btn">View</a>
          <a href="javascript:;" class="ofBar-close-btn">x</a>
        </div>
      </div>
    </div>    
    `);

    ofBar.find('.ofBar-btn').on('click', (e) => {
      location.href = '/announcements';
    });

    ofBar.find('.ofBar-close-btn').on('click', (e) => {

      let ofBar = $(e.target).parents('.ofBar');

      let notshowme = ofBar.find('input[name=notshowme]');

      if (notshowme.is(":checked")) {
        pwUtils.setCookie(`pwAnnounce_${_id}`, 'y', 1);  
      }

      ofBar.remove();

      //pwUtils.deleteCookie(`pwAnnounce_${_id}`);

      if ($('.ofBar').length == 0) {
        $('.ofBar-area').remove();
        $('.announcement-backdrop').hide();
        $('body').css('overflow', 'auto');        
      }
    });

    $('.ofBar-area').append(ofBar);
  },
  swalSuccess: function(_text, _cb) {    
    swal({
      title: 'Succeded',
      text: _text??'',
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
  swalFailed: function(_text, _cb) {
    swal({
      title: 'Failed',
      text: _text??'',
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
  swalConfirm: function(_title, _text, _cb) {
    swal({
      title: _title??'정말 처리하겠습니까?',
      text: _text??'',
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
  simpleLightbox: function (imageUrl, bgColor, maxWidth){
      if(typeof bgColor === 'undefined'){
          bgColor = '#000';
      }
      if(typeof maxWidth === 'undefined'){
          maxWidth = '1100px';
      }
      window.open('', 'simpleLightbox').document.write('<html><head><meta name="viewport" content="user-scalable=yes, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, width=device-width" /></head><body style="margin:0;'+bgColor+';height:100%;" onclick="javascript:window.close(\'simpleLightbox\');"><table border="0" width="100%" height="100%"><tr><td valign="middle" align="center"><img style="position:relative;z-index:2;width:100%;max-width:'+maxWidth+';" src="'+imageUrl+'"/></td></tr></table></body></html>');
  },
  setFormatNumber: function (_x) {
    let parts = _x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },
  //Form to FormData
  makeFormData: function(form, withFile) {
    var formData = new FormData();

    form.find('input, select, textarea, radio, checkbox').each(function(k, v) {
      if (v.type == 'file' && withFile == true) {
        for (var x = 0; x < v.files.length; x++) {
          formData.append(v.name, v.files[x]);
        }      
      } else if (v.type == 'radio' || v.type == 'checkbox') {
        if (v.checked) formData.append(v.name, v.value);
      } else {
        formData.append(v.name, v.value);        
      }
    });

    return formData;
  },
  showFormData: function(fd) {
    for (let pair of fd.entries()) { 
      console.log(pair[0]+ ', ' + pair[1]); 
    }
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
      target = $("."+pwUtils.preset.loader.body)[0];
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
};

var modalUtils = {
	show : function(id, title, content, caption1, fnc1, caption2, fnc2, shownfnc) {

		if (typeof title != "undefined") this.setTitle(id, title);
		if (typeof content != "undefined") 
      this.setContent(id, content);
    else
      this.showOverlay(id);
		if (typeof caption1 != "undefined") {
			$(id).find('.close-button').text(caption1);			
		} else {
			$(id).find('.close-button').text('닫기');
		}
		
		if (caption2 == true) {
			this.showButton(id);
		} else if (typeof caption2 == "string") {
			this.showButton(id, caption2);
		} else {
			this.hideButton(id);
		}
		
		$(id).find('.close-button, .ico-close-button').off("click");

		if (typeof fnc1 == "function")
			$(id).find('.close-button, .ico-close-button').on("click", fnc1);
		else {
			$(id).find('.close-button, .ico-close-button').on("click", function(){
				modalUtils.hide(id);
			});
    }
		
    $(id).find('.modal-button').off('click');

		if (typeof fnc2 == "function")
			$(id).find('.modal-button').on("click", fnc2);
		else 
			$(id).find('.modal-button').on("click", function(){
				modalUtils.hide(id);
			});

		$(id).modal('show'); 		

    $(id).off('shown.bs.modal');

    if (typeof shownfnc == "function") {
      $(id).on('shown.bs.modal', shownfnc);
    }
	},
  showPasswd : function(procFunc) {

    let id = '#modal-password';

    $(id).find('.modal-button').off("click");

    if (typeof procFunc == "function")
      modalUtils.setButton(id, procFunc);      
    else 
      modalUtils.setButton(id, () => {
        modalUtils.hide(id);
      });

    $(id).modal('show')
	},
  hidestay : function(id) {
		$(id).modal('hide');
    this.hideOverlay(id);
  },
	hide : function(id) {
		$(id).modal('hide');
    this.hideOverlay(id);
    this.setContent(id, '');
	},
  close : function(id) {
    $(id).find('.close-button').trigger("click");
  },
	setTitle : function(id, title) {		
		$(id).find('.modal-title').html(title);
	},
	setContent : function(id, content) {
		$(id).find('.modal-body').html(content);
    this.hideOverlay(id);
	},
	showButton : function(id, caption) {
		if (typeof caption != "undefined")
			$(id).find('.modal-button').text(caption);
		else 
			$(id).find('.modal-button').text("적용");
		$(id).find('.modal-button').show();
	},
	hideButton : function(id) {
		$(id).find('.modal-button').hide();
	}, 
	setButton : function(id, fnc) {
		$(id).find('.modal-button').off("click");
		$(id).find('.modal-button').on("click", fnc);
	},
  setCloseButton : function(id, fnc) {    
    $(id).find('.close-button, .ico-close-button').on("click", fnc);
  },
	disableButton : function(id) {
    $(id).find('.ico-close-button').prop("disabled", true);
    $(id).find('.close-button').prop("disabled", true);
		$(id).find('.modal-button').prop("disabled", true);
	},
	enableButton : function(id) {
    $(id).find('.ico-close-button').prop("disabled", false);
    $(id).find('.close-button').prop("disabled", false);
		$(id).find('.modal-button').prop("disabled", false);
	},
  showOverlay : function(id, fade) {
    $(id).find('.overlay').show().addClass('d-flex');    
    /*
    if (fade == undefined)
      $(id).find('.overlay').show().addClass('d-flex');    
    else {
      $(id).find('.overlay').fadeIn().addClass('d-flex');    
    }
    */
  },
  hideOverlay : function(id, fade) {
    if (fade == undefined)
      $(id).find('.overlay').hide().removeClass('d-flex');
    else
      $(id).find('.overlay').fadeOut(400, function() {$(id).find('.overlay').removeClass('d-flex')});
  },
  showConfirm : function(title, callback) {
    if (title == undefined) title = '수정하시겠습니까?';
    this.showmin('#modal-sm', '<i class="fas fa-cogs text-danger"></i> 알림', title, '아니요', '', '예', callback);
  },
  hideConfirm : function() {
    this.hide('#modal-sm');
  },
	showAlert : function(id, msg, autoClose) {
		
		$(id).find('.modal-alertmsg').text(msg);
		
		if (autoClose == true) {
			$(id).find('.modal-alert').fadeTo(4000, 500).slideUp(500, function () {
				$(id).find('.modal-alert').slideUp(500);
			});				
		} else {
			$(id).find('.modal-alert').show();
		}
			
	},
	hideAlert : function(id) {
		$(id).find('.modal-alert').hide();
	},
  getModalId : function(obj) {
    return '#'+$(obj).parents(".modal").attr("id");
  },
}