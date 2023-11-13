const TronWeb = require('tronweb');
const dbHelpers = require('./dbHelpers');

/**
 * Get usdt account balance
 * @returns json
 */
exports.getBallance =  async () => {

  const fullNode = 'https://api.trongrid.io';
  const solidityNode = 'https://api.trongrid.io';
  const eventServer = 'https://api.trongrid.io';
  const smartContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
  const account = process.env.WALLET_ADDRESS;
  const privateKey = process.env.WALLET_PRIVATE_KEY;

  const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
  );

  const {abi} = await tronWeb.trx.getContract(smartContract);
  const contract = tronWeb.contract(abi.entrys, smartContract);
  const usdt = await contract.methods.balanceOf(account).call();
  const balance = await tronWeb.trx.getBalance(account);
  
  return [(balance??0) / 1000000, (usdt??0) / 1000000];
}

/**
 * send usdt on trc20
 * @param {string} to 
 * @param {number} amount 
 * @returns json
 */
 exports.sendUsdt = async (to, amount) => {

  const fullNode = 'https://api.trongrid.io';
  const solidityNode = 'https://api.trongrid.io';
  const eventServer = 'https://api.trongrid.io';
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  const smartContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // USDT

  const tronWeb = new TronWeb(
    fullNode,
    solidityNode,
    eventServer,
    privateKey
  );

  const {abi} = await tronWeb.trx.getContract(smartContract);
  const contract = tronWeb.contract(abi.entrys, smartContract);
  const resp = await contract.methods.transfer(to, amount * 1000000).send();

  return resp;

}

/**
 * 회원에게 코인 전송
 * @returns 
 */
 exports.sendToken = async (account, amount, memo) => {
  
  let conn = null;

  let rsUser = await dbHelpers.getOneRow(`SELECT id, fcmtoken, language FROM user WHERE account = ? limit 1`, [account]);
    
  if (!rsUser) {
    console.error(`error: unknown user ${account}`);
    return false;
  }

  let rst = false;

  try {
    conn = await dbHelpers.getConnection();

    await dbHelpers.beginTransaction(conn);

    const receiver = rsUser['id'];
  
    await dbHelpers.exeQueryConn(conn, `
      INSERT INTO history (user_id, \`change\`, other_user_id, type, regdate, memo) 
        VALUES (?, ?, 1, 1, CURRENT_TIMESTAMP(), ?)`, 
      [receiver, amount, memo]);

    await dbHelpers.exeQueryConn(conn,`UPDATE user SET balance = balance + ? WHERE id = ?`, [amount, receiver]);
  
    await dbHelpers.commit(conn);

    await fcmHelper.sendTransMessage('deposit', rsUser['fcmtoken'], amount, 'UnionMK', rsUser['language']);
    //await fcmHelper.sendMessage(rsUser['fcmtoken'], `${amount}$ has been deposited from UnionMk`, `Deposit`);

    rst = true;
  } catch(err) {
    console.log(err);
    await dbHelpers.rollback(conn);    
  } finally {
    if(conn) conn.release();
  }
  
  return rst;
}

exports.getbackToken = async (account, amount, memo) => {

  let conn = null;
  
  let rsUser = await dbHelpers.getOneRow(`SELECT id, balance, fcmtoken, language FROM user WHERE account = ? limit 1`, [account]);
    
  if (!rsUser) {    
    return `error: unknown user ${account}`;
  }
  
  if (Number(rsUser['balance']) < Number(amount)) {    
    //return `error: not enough balance `;    
  }

  let rst = false;

  try {

    conn = await dbHelpers.getConnection();

    await dbHelpers.beginTransaction(conn);

    const sender = rsUser['id'];    
  
    //await dbHelpers.exeQueryConn(conn, `INSERT INTO history (user_id, \`change\`, other_user_id, type, regdate, memo, confirm) VALUES (?, ?, 1, 2, CURRENT_TIMESTAMP(), ?, 1)`, [sender, amount, memo]);
    //await dbHelpers.exeQueryConn(conn, `INSERT INTO history (user_id, \`change\`, other_user_id, type, regdate, memo, confirm) VALUES (1, ?, ?, 4, CURRENT_TIMESTAMP(), ?, 1)`, [amount, sender, memo]);
    await dbHelpers.exeQueryConn(conn, `INSERT INTO history (user_id, \`change\`, other_user_id, type, regdate, memo, confirm) VALUES (1, ?, ?, 13, CURRENT_TIMESTAMP(), ?, 1)`, [amount, sender, memo]);
    await dbHelpers.exeQueryConn(conn, `UPDATE user SET balance = balance - ? WHERE id = ?`, [amount, sender]);
    await dbHelpers.exeQueryConn(conn, `UPDATE user SET balance = balance + ? WHERE id = ?`, [amount, 1]);
  
    await dbHelpers.commit(conn);

    rst = true;
  } catch(err) {
    console.log(err);
    rst = err.message;
    await dbHelpers.rollback(conn);    
  } finally {
    if(conn) conn.release();
  }
  
  return rst;
}