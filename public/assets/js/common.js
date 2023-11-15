let cmUtils = {
  do_modify: (f) => {
    if (f.password.value || f.repassword.value) {
      if (pwUtils.validatePassword(f.password.value) == false) {
        f.password.focus();
        return;
      }

      if (f.password.value != f.repassword.value) {
        pwUtils.setAlert('The password does not match.');
        f.password.focus();
        return;
      }
    }
    cmUtils.send_info(f);
  },
  send_info: (f) => {
    pwUtils.ajaxJSON(
      '/user/repassword',
      $(f).serialize(),
      (data) => {
        switch (data['result']) {
          case 100:
            pwUtils.swalSuccess('User infomation has been modified.'), () => { location.href = '/'; }
            break;
          default:
            pwUtils.setAlert(data['msg'] || 'Server error');
            break;
        }
      },
      (j) => {
        pwUtils.setAlert('Server error');
      });
  },
  do_modify_wallet: async (f) => {
    let target = f.closest('.wallet-panel-body');
    pwUtils.showLoading(target);

    if (f.address.value) {
      let rst = await pwUtils.validateTRC20Address(f.address.value);
      if (rst.result == false) {
        pwUtils.hideLoading(target);
        pwUtils.setAlert(rst.message || 'Server error');
        f.address.focus();
        return;
      }
    }
    pwUtils.hideLoading(target);

    cmUtils.send_info_wallet(f);
  },
  send_info_wallet: (f) => {
    pwUtils.ajaxJSON(
      '/user/doEditWallet',
      $(f).serialize(),
      (data) => {
        switch (data['result']) {
          case 100:
            pwUtils.swalSuccess('Wallet infomation has been modified.'), () => { location.href = '/'; }
            break;
          default:
            pwUtils.setAlert(data['msg'] || 'Server error');
            break;
        }
      },
      (j) => {
        pwUtils.setAlert('Server error');
      });
  }
}