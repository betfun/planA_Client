const db = require('../db');
const dbHelpers = require('../helpers/dbHelpers');
const helper = require("../helpers/miseHelpers");

//dashboard data 
exports.dashboard1 = async (req, res, next) => {

  const idx = req.session.idx;
  const user = await dbHelpers.getOneRow(`SELECT * FROM tb_user WHERE idx = ? limit 1`, [idx]);
  const wallet = await dbHelpers.getOneRow(`SELECT * FROM tb_wallet WHERE f_useridx = ? limit 1`, [idx]);
  const referralCnt = await dbHelpers.getOneRow(`SELECT COUNT(1) AS count FROM tb_user WHERE f_referral = ? limit 1`, [idx]);
  const groupCnt = await dbHelpers.getOneRow(`SELECT COUNT(1) as count FROM tb_node N LEFT JOIN tb_user U ON N.f_useridx = U.idx WHERE f_node LIKE "%:?:%"`, [idx]);

  res.render('index', {
    helper, user: user ?? {},
    wallet: wallet ?? {}, 
    referralCnt: referralCnt['count'] ?? 0, 
    groupCnt: groupCnt['count'] ?? 0
  });
};