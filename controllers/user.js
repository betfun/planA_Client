const helper = require("../helpers/miseHelpers");
const dbHelper = require("../helpers/dbHelpers");

/**
 * get user info
 */
exports.getUserInfo = async (req, res) => {
  const idx = req.session.idx;
  const user = await dbHelper.getOneRow(`SELECT * FROM tb_user WHERE idx = ? limit 1`, [idx]);

  res.render('user/profile', {user: user});
}

/**
 * modify user information
 * @returns 
 */
exports.modifyUserInfo = async (req, res) => {

  helper.trimStringProperties(req.body);

  let user_id = req.session.user_id;

  let account = helper.getRequest(req.body.account);
  let name = helper.getRequest(req.body.name);
  let country_code = helper.getRequest(req.body.country_code);
  let tel = helper.getRequest(req.body.tel);

  let password = helper.getRequest(req.body.password);
  let repassword = helper.getRequest(req.body.repassword);
  
  let userno = helper.getRequest(req.body.userno);
  let accountholder = helper.getRequest(req.body.accountholder); 
  let bankname = helper.getRequest(req.body.bankname);
  let bankaccountnumber = helper.getRequest(req.body.bankaccountnumber);

  name = name.toUpperCase();

  let rst = {result:0, msg:''};

  try {

    if (password) {
      if (password.length < 8 || password.length > 20) throw new Error('* Please enter between 8 and 20 digits.');
      if (!helper.checkPasswd(password)) throw new Error('* Please use the mixture of English, numbers, and special characters.');        
      if (password != repassword) throw new Error('The password does not match.');
    }

    let param = [account, name, country_code, tel, accountholder, bankname, bankaccountnumber];
  
    param.forEach((_v, _k) => {      
      if(!_v) {
        rst.result = 201;      
        throw new Error('The data is not available.');
      }
    });

    param = [account, name, country_code, tel, userno, accountholder, bankname, bankaccountnumber];

    let rsUser = await dbHelper.getOneRow('select * from user where id = ?', [user_id]);

    let rs = await dbHelper.getOneRow("select * from user where tel = ? and id <> ? limit 1", [tel, user_id]);

    if (rs) {
      rst.result = 301;
      throw new Error('This phone number is already registered.');
    }
    
    rs = await dbHelper.getOneRow("select * from user where account = ? and id <> ? limit 1", [account, user_id]);

    if (rs) {
      rst.result = 302;
      throw new Error('This email is already registered.');
    }

    let sets = '';
  
    if (password) {
      sets += ', password = MD5(?)';
      param.push(password);
    }
  
  
    param.push(user_id);

    await dbHelper.exeQuery(`
      UPDATE user 
      SET account = ?, name = ?, country_code = ?, tel = ?, userno = ?, 
        accountholder = ?, bankname = ?, bankaccountnumber = ?, regdate = CURRENT_TIMESTAMP() ${sets} 
      WHERE id = ?`, param);
    
    rst.result = 100;

  } catch (err) {    
    console.log(err);
    rst.msg = err.message;
    rst.result = rst.result||500;
  }

  return res.json(rst);
}
