const dbHelper = require("../helpers/dbHelpers");

/**
 * get trans
 */
exports.getTrans = async (req, res) => {
  let idx = req.session.idx;
  const trans = await dbHelper.getRows(`
      SELECT * FROM tb_trans
      WHERE f_useridx = ? ORDER BY f_regAt DESC`, [idx]);
  res.render('user/trans', {trans: trans ?? {}});
}