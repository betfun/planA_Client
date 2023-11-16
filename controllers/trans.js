const dbHelper = require("../helpers/dbHelpers");
const helper = require('../helpers/miseHelpers');
const Pagination = require('../helpers/paginationHelper');

/**
 * get trans
 */
exports.getTrans = async (req, res) => {
  const query = req.query;

  let idx = req.session.idx;
  let s_page = helper.getRequest(query.s_page, 1);

  let s_pagecnt = helper.getRequest(query.s_pagecnt, 10);

  let pname = req.originalUrl.split("?").shift();

  let totalcnt = await dbHelper.getOneRow(`SELECT COUNT(1) AS count FROM tb_trans_log T LEFT JOIN tb_user U ON T.f_useridx = U.idx where T.f_useridx = ?`, idx);

  
  //pagination 
  let pagination = new Pagination({
    base_url: pname,
    page_rows: s_pagecnt,
    page: s_page, 
    total_rows: totalcnt['count'],
    display_prev10next10: true,
    classname: 'pagination-sm justify-content-end',      
  });

  let pagescript = pagination.build();
  let wheres = 'WHERE f_useridx = ?';
  let params = [idx];
  params = params.concat([pagination.startnum, pagination.page_rows]);

  const trans = await dbHelper.getRows(`
      SELECT * FROM tb_trans_log
      ${wheres}  ORDER BY f_regAt DESC LIMIT ?, ?`, params);

  res.render('user/trans', {
    helper,
    trans: trans ?? {}, 
    s_page, s_pagecnt,
    totalcnt: totalcnt['count'],
    pagination: pagescript,
    pagesnum: pagination.startnum+1,
    pageenum: pagination.startnum + pagination.page_rows,
  });
}