const helper = require("../helpers/miseHelpers");
const dbHelper = require("../helpers/dbHelpers");

const bcrypt = require('bcrypt');

/**
 * get user info
 */
exports.rePassword = async (req, res) => {
  let idx = req.session.idx;
  const wallet = await dbHelper.getOneRow(`
      SELECT * FROM tb_wallet 
      WHERE f_useridx = ? limit 1` , [idx]);
  
  res.render('user/repassword', {wallet: wallet ?? {}});
}

/**
 * rePassword
 * @returns 
 */
exports.doRePassword = async (req, res) => {

  helper.trimStringProperties(req.body);

  let idx = req.session.idx;

  let password = helper.getRequest(req.body.password);
  let repassword = helper.getRequest(req.body.repassword);

  let rst = {result:0, msg:''};

  try {

    if (password) {
      if (password.length < 8 || password.length > 20) throw new Error('* Please enter between 8 and 20 digits.');
      if (!helper.checkPasswd(password)) throw new Error('* Please use the mixture of English, numbers, and special characters.');        
      if (password != repassword) throw new Error('The password does not match.');
    }

    let pwd = await bcrypt.hash(password, Number(process.env.CRYPTO_ROUND));
  
    await dbHelper.exeQuery(`
      UPDATE tb_user 
      SET f_pwd = ?
      WHERE idx = ?`, [pwd, idx]);
    
    rst.result = 100;

  } catch (err) {    
    rst.msg = err.message;
    rst.result = rst.result||500;
  }

  return res.json(rst);
}

/**
 * rePassword
 * @returns 
 */
exports.doEditWallet = async (req, res) => {

  helper.trimStringProperties(req.body);

  let idx = req.session.idx;

  let token = helper.getRequest(req.body.token);
  let network = helper.getRequest(req.body.network);
  let address = helper.getRequest(req.body.address);

  let rst = {result:0, msg:''};

  try {

    if (!token) throw new Error('Token is empty.');
    if (!network) throw new Error('Network is empty.');
    if (!address) throw new Error('Address is empty.');
  
    await dbHelper.exeQuery(`
      UPDATE tb_wallet 
      SET f_token = ?,
      f_tnetwork = ?,
      f_taddress = ?
      WHERE f_useridx = ? `, [token, network, address, idx]);
    
    rst.result = 100;

  } catch (err) {    
    rst.msg = err.message;
    rst.result = rst.result||500;
  }

  return res.json(rst);
}

/**
 * get user info
 */
exports.getTree = async (req, res) => {
  let idx = req.session.idx;
 
  const tree = await dbHelper.getRows(`
      SELECT * FROM tb_node N LEFT JOIN tb_user U ON N.f_useridx = U.idx
      WHERE f_node LIKE "%:?:%" ORDER BY N.f_level DESC`, [idx]);

  res.render('user/tree', {tree: tree ?? {}, userIdx: idx});
}

/**
 * get user info
 */
exports.getSelectedNode = async (req, res) => {
  let idx = helper.getRequest(req.body.idx, 0);

  let rst = {result:0, msg:''};

  try {
    let node = await dbHelper.getOneRow(`
    SELECT * FROM tb_wallet W LEFT JOIN tb_user U ON W.f_useridx = U.idx
    WHERE U.idx = ? limit 1`, [idx]);

    let referralCnt = await dbHelper.getOneRow(`SELECT COUNT(1) AS count FROM tb_user WHERE f_referral = ? limit 1`, [idx]);
    let groupCnt = await dbHelper.getOneRow(`
    SELECT COUNT(1) as count FROM tb_node N LEFT JOIN tb_user U ON N.f_useridx = U.idx
    WHERE f_node LIKE "%:?:%"`, [idx]);

    if (!node) throw new Error('데이터가 존재하지 않습니다.');

    rst['data'] = node;
    rst['data']['referralCnt'] = referralCnt['count'];
    rst['data']['groupCnt'] = groupCnt['count'];
    rst.result = 100;

  } catch (err) {    
    rst.msg = err.message;
    rst.result = rst.result||500;
  }

  return res.json(rst);
}
