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
      WHERE N.f_node LIKE "%:?:%" and U.f_status <> 1 ORDER BY N.f_level DESC`, [idx]);

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

/**
 * getRequestWithdrawal
 */
exports.getRequestWithdrawal = async (req, res) => {
  let idx = req.session.idx;
  const wallet = await dbHelper.getOneRow(`
      SELECT * FROM tb_wallet 
      WHERE f_useridx = ? limit 1` , [idx]);

  let maxUSDT = await dbHelper.getSetting('trans.maxUSDT');
  maxUSDT = maxUSDT['trans.maxUSDT'];
  let minUSDT = await dbHelper.getSetting('trans.minUSDT');
  minUSDT = minUSDT['trans.minUSDT'];

  res.render('user/request_withdrawal', {wallet: wallet ?? {}, helper, maxUSDT, minUSDT});
}

/**
 * doRequestWithdrawal
 */
exports.doRequestWithdrawal = async (req, res) => {
  let idx = req.session.idx;
  let token = helper.getRequest(req.body.token);
  let network = helper.getRequest(req.body.network);
  let address = helper.getRequest(req.body.address);
  let amount = helper.getRequest(req.body.amount, 0);
  let balance = helper.getRequest(req.body.balance, 0);
  let rst = {result:0, msg:''};
  let conn = null;
  try {

    if (!token) throw new Error('Token is empty.');
    if (!network) throw new Error('Network is empty.');
    if (!address) throw new Error('Address is empty.');

    let maxUSDT = await dbHelper.getSetting('trans.maxUSDT');
    let minUSDT = await dbHelper.getSetting('trans.minUSDT');

    if (amount <= 0) {
      throw new Error('0보다 큰 금액을 입력해 주세요');
    }

    if (amount > Number(balance)) {
      throw new Error('잔액이 부족합니다.');
    }

    if (amount < Number(minUSDT)) {
      throw new Error('최소 출금액보다 신청금액이 커야합니다.');
    }

    if (amount > Number(maxUSDT)) {
      throw new Error('최대 출금액보다 신청금액이 초과하였습니다.');
    }

    balance = Number(balance) - amount;

    conn = await dbHelper.getConnection();

    await dbHelper.beginTransaction(conn);

    // await dbHelper.exeQueryConn(conn,`
    //   UPDATE tb_wallet 
    //   SET f_balance = ?
    //   WHERE f_useridx = ? `, [balance, idx]);
  
    // type 1: ACE에서 회원 지갑에 롤업된 커미션을 개인지갑으로 전송
    // type 2: 롤업 커미션
    // type 3: 개인 지갑으로 전송요청(출금내역)
    // status: 1 대기, 2 전송중, 3 완료, 4 실패, 9 삭제
    let type = 3;
    let status = 1;

    let cnt = await dbHelper.exeQuery(`
      SELECT COUNT(1) as cnt from tb_trans_log
      WHERE f_useridx = ? and f_type = ? and f_status in (1,2)`, [idx, type]);

    if(cnt[0][0].cnt > 0) {
      throw new Error('기존에 신청하신 내역을 처리중입니다.');
    }

    let [transIdx] = await dbHelper.exeQueryConn(conn,`
    INSERT INTO tb_trans (f_type, f_status, f_useridx, f_amount, f_address, f_token, f_network) 
    values( ?, ?, ?, ?, ?, ?, ?, ?)`, [type, status, idx, amount, address, token, network]);
    
    // await dbHelper.exeQueryConn(conn,`
    // INSERT INTO tb_trans_log (f_transidx, f_type, f_status, f_useridx, f_amount, f_balance, f_address, f_token, f_network, f_regAt) 
    // values( ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [transIdx.insertId, type, status, idx, amount, balance, address, token, network]);
  
    await dbHelper.commit(conn);

    rst.result = 100;

  } catch (err) {    
    rst.msg = err.message;
    rst.result = rst.result||500;

    await dbHelper.rollback(conn);  
  } finally {
    dbHelper.releaseConnection(conn);
  }

  return res.json(rst);
}