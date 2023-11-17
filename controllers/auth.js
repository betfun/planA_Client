const helper = require("../helpers/miseHelpers");
const dbHelper = require('../helpers/dbHelpers');
const mailerHelper = require('../helpers/mailerHelper');
const bcrypt = require('bcrypt');

module.exports = {

  /**
   * login page
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  login: (req, res) => {

    let path = req.query.path;

    if (req.session.logined != undefined && req.session.logined)
      return res.redirect('/');
    else
      return res.render('auth/login', 
        {
          account: req.cookies['account'], 
          rememberMe: req.cookies['account'] ? 'checked' : '',
          path
        }
      );
  },

  /**
   * process Login
   * @param {*} req 
   * @param {*} res 
   */
  procLogin: async (req, res) => {
    const { account, password, rememberMe } = req.body;
    
    let rst = {result:0, msg:''};
  
    try {
  
      if (!account || !password) {
        throw new Error('input your id or password');
      }

      // let encrypted = await bcrypt.hash(password, Number(process.env.CRYPTO_ROUND));

      let rsUser = await dbHelper.getOneRow('SELECT * FROM tb_user WHERE f_email = ? limit 1', account);

      if(!rsUser) throw new Error('아이디 또는 비밀번호를 확인해주세요.');

      let isCompare = await bcrypt.compare(password, rsUser.f_pwd);
      
      if(!isCompare) throw new Error('아이디 또는 비밀번호를 확인해주세요.');
      
      let ipAddress = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || '';
      
      if (ipAddress.startsWith('::ffff:')) {ipAddress = ipAddress.substring(7)}    
  
      let refererSite = req.header("Referrer") || "";
      let userAgent = req.headers["user-agent"] ?
        req.headers["user-agent"] :
        "jest-test";    
  
      param = [rsUser.idx, ipAddress, userAgent, refererSite];
  
      await dbHelper.exeQuery('insert into tb_user_log (f_userIdx, f_ip, f_userAgent, f_refererSite) values (?, ?, ?, ?)', param);
  
      req.session.logined = true;
      req.session.idx = rsUser.idx;
      req.session.account = rsUser.f_email;
  
      if (rememberMe == 'on') {
        res.cookie('account', account);
      } else {
        res.clearCookie('account');
      }

      rst.result = 100;
      
    } catch (err) {    
      rst.msg = err.message;
      rst.result = rst.result||500;
    }
    res.json(rst);    
  },
  
  logout: (req, res) => {

    req.session.destroy(function (err) {
      if (err) {
        return res.status(500).json(err);
      } else {
        return res.redirect('/auth/login');
      }
    });
  },

  /**
   * reset password by email
   */
  resetPassword: async (req, res) => {

    let token = helper.getRequest(req.query._t, '');
    let account = helper.getRequest(req.query.account, '');
    let bRst = true;
    let msg = '';

    if (!token || !account) bRst = false;

    token = decodeURIComponent(token);
    account = decodeURIComponent(account);

    try {

      let bcompare = await bcrypt.compare(account, token);

      if (!bcompare) throw new Error('Not equal bcrypt token')
    
      let rsPasswd = await dbHelper.getOneRow('select *, TIMESTAMPDIFF(SECOND, f_reqAt, NOW()) AS sec from tb_resetpasswd where f_account = ? and f_token = ? limit 1', [account, token])

      if (!rsPasswd) throw new Error('The request is invalid.')

      if (rsPasswd['doneAt']) throw new Error('Request expired')

      if (Number(rsPasswd['sec']) > Number(process.env.TOKEN_DELAY)) throw new Error('Request timeout');
      
    } catch (err) {
      bRst = false;
      msg = encodeURIComponent(err.message);
    }

    if (bRst)
      res.render('auth/resetpassword', {
        account,
        token
      });
    else 
      res.redirect(`/?msg=${msg}`);
  },

  doResetPassword: async (req, res) => {

    let token = helper.getRequest(req.body.token, '');
    let new_password = helper.getRequest(req.body.new_password, '');
    let confirm_password = helper.getRequest(req.body.confirm_password, '');
    let account = helper.getRequest(req.body.account, '');

    let rst = {result:0, msg: ''};

    try {

      if (!token) throw new Error('That was a wrong approach.');    
      if (!new_password) throw new Error('Please enter the password without spaces.');
      if (new_password.length < 8 || new_password.length > 20) throw new Error('* Please enter between 8 and 20 digits.');
      if (!helper.checkPasswd(new_password)) throw new Error('* Please use the mixture of English, numbers, and special characters.');    

      if (new_password != confirm_password) throw new Error('The password does not match.');

      let bcompare = await bcrypt.compare(account, token);

      if (!bcompare) throw new Error('Not equal bcrypt token')

      let rsPasswd = await dbHelper.getOneRow('select *, TIMESTAMPDIFF(SECOND, f_reqAt, NOW()) AS sec from tb_resetpasswd where f_account = ? and token = ? and doneAt is Null', [account, token])

      if (!rsPasswd) throw new Error('That was a wrong approach.');

      if (Number(rsPasswd['sec']) > Number(process.env.TOKEN_DELAY)) throw new Error('Request timeout');

      let rsRst = await dbHelper.exeQuery('update tb_user set `password` = MD5(?) where f_email = ?', [new_password, account]);
      rsRst = await dbHelper.exeQuery('update tb_resetpasswd set doneAt = NOW() where f_account = ? and token = ? ', [account, token]);

      rst.result = 100;

    } catch (err) {    
      
      rst.msg = err.message;
      rst.result = rst.result||500;
    }

    return res.json(rst);
  },

  /**
   * find password page
   */
  findPassword: (req, res) => {
    res.render('auth/findpassword');
  },

  /**
   * process find password
   */
  dofindPassword: async (req, res) => {

    let account = helper.getRequest(req.body.account, '');

    let rst = {result:0, msg: ''};

    try {

      if (!account) throw new Error('Please enter your email');

      if (helper.checkEmail(account) == false) throw new Error('It\'s invalid email format');

      let rsUser = await dbHelper.getOneRow('select * from tb_user where f_email = ? limit 1', [account]);

      if (!rsUser) throw new Error('This is an unknown user.');

      let rsMailCnt = await dbHelper.getOneRow('SELECT COUNT(*) as cnt FROM tb_resetpasswd WHERE f_account = ? AND DATEDIFF(f_reqAt, NOW()) = 0 ;', [account])

      if (rsMailCnt['cnt'] > 5) throw new Error('Exceed 5 of emails sent per day');

      let token = await bcrypt.hash(account, Number(process.env.CRYPTO_ROUND));
      
      let mailTemp = mailerHelper.templateForgotEmail(rsUser['f_email'], encodeURIComponent(account), encodeURIComponent(token));

      let rsInfo = await mailerHelper.send(account, 'Reset your password', '', mailTemp);

      if (!rsInfo) throw new Error('Error, Check SMTP(Email) System');

      let ipAddress = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || '';
      
      if (ipAddress.startsWith('::ffff:')) {ipAddress = ipAddress.substring(7)}    

      dbHelper.exeQuery('insert into tb_resetpasswd (f_account, f_token, f_ip) values( ?, ?, ?)', [email, token, ipAddress]);

      rst.result = 100;

    } catch (err) {    
      rst.msg = err.message;
      rst.result = rst.result||500;
    }

    return res.json(rst);
  }

}