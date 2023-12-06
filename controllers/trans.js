const dbHelper = require("../helpers/dbHelpers");
const helper = require('../helpers/miseHelpers');
const Pagination = require('../helpers/paginationHelper');

/**
 * get trans
 */
exports.getTrans = async (req, res) => {
  helper.trimStringProperties(req.query);

  let query = req.query;

  let idx = req.session.idx;
  let s_value = helper.getRequest(query.s_value);
  let s_page = helper.getRequest(query.s_page, 1);
  let s_pagecnt = helper.getRequest(query.s_pagecnt, 10);
  let s_sdate = helper.getRequest(query.s_sdate, '');
  let s_edate = helper.getRequest(query.s_edate, '');
  
  s_sdate = helper.formatDateTime(s_sdate, 'YYYY-MM-DD');
  s_edate = helper.formatDateTime(s_edate, 'YYYY-MM-DD');

  let pname = req.originalUrl.split("?").shift();
  let wheres = 'WHERE T.f_useridx = ? and (T.f_type = 1 or T.f_type = 2)';
  let params = [idx];

  // 날짜 검색
  // s_sdate <= s_edate 체크 !!!
  if (s_sdate && s_edate) {      
    wheres += ' AND DATE(T.f_regAt) BETWEEN ? AND ?';
    params = params.concat([s_sdate, s_edate]);
  } else if (s_sdate) {
    wheres += ' AND T.f_regAt >= ? ';
    params = params.concat([s_sdate]);      
  } else if (s_edate) {
    wheres += ' AND T.f_regAt <= ? ';
    params = params.concat([s_edate]);      
  }

  // 페이지내 검색
  if (s_value) {
    wheres += ` AND (T.f_address = ?)`;        
    params = params.concat([`${s_value}`]);
  }

  let totalcnt = await dbHelper.getOneRow(`SELECT COUNT(1) AS count FROM tb_trans_log T LEFT JOIN tb_user U ON T.f_useridx = U.idx ${wheres}`, params);

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

  params = params.concat([pagination.startnum, pagination.page_rows]);

  const trans = await dbHelper.getRows(`
      SELECT * FROM tb_trans_log T
      ${wheres} ORDER BY f_regAt DESC LIMIT ?, ?`, params);

  res.render('user/trans', {
    helper,
    trans: trans ?? {}, 
    s_page, s_pagecnt,
    totalcnt: totalcnt['count'],
    pagination: pagescript,
    pagesnum: pagination.startnum+1,
    pageenum: pagination.startnum + pagination.page_rows,
    s_pageArray: pagination.aRowLength,
    s_value,
    s_sdate, s_edate,
  });
}


/**
 * get withdrawal
 * 타입 1: 회원 지갑에 롤업된 커미션을 개인지갑으로 전송
    타입 2: 롤업 커미션
    타입 3: 개인 지갑으로 전송요청(출금내역)
 */
exports.getWithdrawal = async (req, res) => {
  helper.trimStringProperties(req.query);

  let query = req.query;

  let idx = req.session.idx;
  let s_value = helper.getRequest(query.s_value);
  let s_page = helper.getRequest(query.s_page, 1);
  let s_pagecnt = helper.getRequest(query.s_pagecnt, 10);
  let s_sdate = helper.getRequest(query.s_sdate, '');
  let s_edate = helper.getRequest(query.s_edate, '');
  
  s_sdate = helper.formatDateTime(s_sdate, 'YYYY-MM-DD');
  s_edate = helper.formatDateTime(s_edate, 'YYYY-MM-DD');

  let pname = req.originalUrl.split("?").shift();
  let wheres = 'WHERE T.f_useridx = ? and T.f_type = 3';
  let params = [idx];

  // 날짜 검색
  // s_sdate <= s_edate 체크 !!!
  if (s_sdate && s_edate) {      
    wheres += ' AND DATE(T.f_regAt) BETWEEN ? AND ?';
    params = params.concat([s_sdate, s_edate]);
  } else if (s_sdate) {
    wheres += ' AND T.f_regAt >= ? ';
    params = params.concat([s_sdate]);      
  } else if (s_edate) {
    wheres += ' AND T.f_regAt <= ? ';
    params = params.concat([s_edate]);      
  }

  // 페이지내 검색
  if (s_value) {
    wheres += ` AND (T.f_address = ?)`;        
    params = params.concat([`${s_value}`]);
  }

  let totalcnt = await dbHelper.getOneRow(`SELECT COUNT(1) AS count FROM tb_trans_log T LEFT JOIN tb_user U ON T.f_useridx = U.idx ${wheres}`, params);

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

  params = params.concat([pagination.startnum, pagination.page_rows]);

  const trans = await dbHelper.getRows(`
      SELECT * FROM tb_trans_log T
      ${wheres} ORDER BY f_regAt DESC LIMIT ?, ?`, params);

  res.render('user/withdrawal', {
    helper,
    trans: trans ?? {}, 
    s_page, s_pagecnt,
    totalcnt: totalcnt['count'],
    pagination: pagescript,
    pagesnum: pagination.startnum+1,
    pageenum: pagination.startnum + pagination.page_rows,
    s_pageArray: pagination.aRowLength,
    s_value,
    s_sdate, s_edate,
  });
}