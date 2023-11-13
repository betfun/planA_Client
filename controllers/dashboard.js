const db = require('../db');
const dbHelpers = require('../helpers/dbHelpers');

//dashboard data 
exports.dashboard1 = async (req, res, next) => {

  const idx = req.session.idx;
  const user = await dbHelpers.getOneRow(`SELECT * FROM tb_user WHERE idx = ? limit 1`, [idx]);
  // const balance = await walletHelpers.getBallance();  
  // const amount = await dbHelpers.getUserPayPoint();
  // const withdrawal = await dbHelpers.getOneRow(`SELECT IFNULL(SUM(amount), 0) AS sum FROM withdrawal WHERE approve = 0`);
  // const transfer = await dbHelpers.getOneRow('SELECT IFNULL(SUM(`change`), 0) as sum FROM history WHERE `type` = 4 AND user_id = 1 AND confirm = 0');

  // let settings = {};
  // const setting = await dbHelpers.getRows(`SELECT name, value FROM setting`);

  // for (var i = 0; i < setting.length; i++) {
  //   settings[setting[i].name] = setting[i].value;
  // }

  // res.render('index', 
  //   {
  //     helper: require('../helpers/miscHelpers'), 
  //     balance: balance[0], 
  //     usdtBalance: balance[1], 
  //     userPayPoint: amount, 
  //     withdrawal: withdrawal['sum'], 
  //     transfer: transfer['sum'], 
  //     list: [user[0], history1[0], history2[0], history3[0]], 
  //     setting: settings});

  res.render('index', {user: user});
};