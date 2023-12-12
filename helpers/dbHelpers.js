
const db = require('../db');

module.exports = _dbHelper = {

  isStartTransaction: false,

  poolEnd: async() => {
    return await db.end();
  },
  /**
   * get db connection
   * @returns db connection
   */
  getConnection: async() => {
    return await db.getConnection();
  },
  /**
   * release connection
   * @param {Object} _conn 
   */
  releaseConnection: (_conn) => {
    if (_conn) {
      _conn.release();
    }
  },
  beginTransaction: async (_conn) => {
    if (!_conn) return;
    await _conn.beginTransaction();
    _dbHelper.isStartTransaction = true;
  },
  commit: async (_conn) => {
    if (!_conn || !_dbHelper.isStartTransaction) return;
    await _conn.commit();
    _dbHelper.isStartTransaction = false;
  },
  rollback: async (_conn) => {
    if (!_conn || !_dbHelper.isStartTransaction) return;
    await _conn.rollback();
    _dbHelper.isStartTransaction = false;
  },
  /**
   * get single row on connection
   * @param {Object} _conn 
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show 
   * @returns 
   */
  getOneRowConn: async(_conn, _q, _param, _show = false) => {
    if (!_conn) return;
    if (_show) {
      sql = await _conn.format(_q, _param);
      console.log(sql);
    }    
    let [rs] = await _conn.query(_q, _param);
    if (rs) return rs[0];    
  },
  /**
   * Execute Query on connection
   * @param {Object} _conn 
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show 
   * @returns 
   */
   exeQueryConn: async(_conn, _q, _param, _show = false) => {
    if (_show) {
      sql = await _conn.format(_q, _param);
      console.log(sql);
    }
    let rs = await _conn.query(_q, _param);
    return rs;
  },  
  /**
   * Multi Rows on connection
   * @param {Object} _conn 
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show
   * @returns 
   */
   getRowsConn: async(_conn, _q, _param, _show = false) => {
    if (!_conn) return;
    if (_show) {
      sql = await _conn.format(_q, _param);
      console.log(sql);
    }
    let [rs] = await _conn.query(_q, _param);
    return rs;
  },
  /**
   * et single row
   * @param {String} _q 
   * @param {String} _param 
   * @returns 
   */  
  getOneRow: async(_q, _param, _show = false) => {
    if (_show) {
      sql = await db.format(_q, _param);
      console.log(sql);
    }    
    let [rs] = await db.query(_q, _param);
    if (rs) return rs[0];
  },
  /**
   * Multi Rows
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show
   * @returns 
   */
  getRows: async(_q, _param, _show = false) => {
    if (_show) {
      sql = await db.format(_q, _param);
      console.log(sql);
    }
    let [rs] = await db.query(_q, _param);
    return rs;
  },
  /**
   * Execute Query
   * @param {String} _q 
   * @param {Array} _param 
   * @param {Boolean} _show 
   * @returns 
   */
  exeQuery: async(_q, _param, _show = false) => {
    if (_show) {
      sql = await db.format(_q, _param);
      console.log(sql);
    }
    let rs = await db.query(_q, _param);
    return rs;
  },

  getSetting: async(_key = '', _like = false) => {

    let rsSetting = null;

    if (_key) {
      if (_like)
        rsSetting = await _dbHelper.getRows(`select * from tb_setting where f_key like ?`, [_key]);
      else 
        rsSetting = await _dbHelper.getRows(`select * from tb_setting where f_key = ?`, [_key]);
    } else {
      rsSetting = await _dbHelper.getRows(`select * from tb_setting`);
    }

    if (!rsSetting) return null;
  
    let setting = {};
  
    rsSetting.forEach((e)=>{
      let key = e.f_key;
      setting[key] = Number.isNaN(e.f_value)?e.f_value:Number(e.f_value);
      if (e.f_type == 'json') {
        setting[key] = JSON.parse(e.f_value);
      }
    })

    return setting;
  }
} 
