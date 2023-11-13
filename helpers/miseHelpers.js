/**
 * 기타
 * 숫자처리
 * 날짜 처리
 */
const moment = require('moment');

module.exports = {
  /**
  * Change the number with comma
  * @param {Number} _x 
  * @returns 
  */
  setFormatNumber: function (_x) {
    let parts = _x.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  },
  /**
  * Change the number in a given format with
  * @param {Number} _x 
  * @param {Number} _places 
  * @param {Boolean} _fix 
  * @returns 
  */
  setFormatNumberWithPlaces: function (_x, _places, _fix = false) {
    if (_fix && _places != undefined) {            
      let num = Number(_x);
      if (typeof num === 'number' && isFinite(num)) {        
        return num
          .toFixed(_places)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        return _x;
      }
    } else {
      return this.setFormatNumber(_x);
    }
  },
  /**
  * Numbers with Comma, decimal place
  * marked by <Small> by the decimal point
  * @param {Number} _x 
  * @param {Number} _places 
  * @param {Boolean} _fix 
  * @returns 
  */
  setFormatNumberWithPlacesSmall: function (_x, _places, _fix = false) {
    let rst = this.setFormatNumberWithPlaces(_x, _places, _fix);    
    let parts = rst.toString().split('.');
    return `${parts[0]}.<small>${parts[1]}</small>`;
  },
  /**
  * Change the Datetime in a given format
  * @param {datetime} _dt 
  * @param {'YYYY-MM-DD HH:mm'} _fmt 
  * @returns 
  */
  formatDateTime: function (_dt, _fmt = 'YYYY-MM-DD HH:mm') {
    if (!_dt) return '';
    let dt = moment(_dt).format(_fmt);
    return dt == 'Invalid date' ? '' : dt;
  },
  /**
  * trim Stirng or Object
  * @param {object or string} obj 
  * @returns 
  */
  trimStringProperties: function (_obj) {
    if (_obj == null) return '';

    if (typeof _obj === 'object') {
      for (var prop in _obj) {
        if (typeof _obj[prop] === 'object') {
          this.trimStringProperties(_obj[prop]);
        } else if (typeof _obj[prop] === 'string') {
          _obj[prop] = _obj[prop].trim();
        }
      }
      
    } else if (typeof _obj === 'string') {
      return _obj.trim();
    }

    return '';
  },  
  /**
  * if wrong return _default 
  * @param {any} _v 
  * @param {any} _default 
  * @returns 
  */
  getRequest: function (_v, _default = '') {
    if (typeof _default === 'number') {
      let v = Number(String(_v).replace(/,/g,''));      
      return (typeof v === 'number' && Number.isNaN(v) == false)?v:_default;
    } else if (typeof _default === 'object') {
      return _v??_default;
    } return _v||_default;
  },
  /**
  * check order and dir 
  */
  checkOrder: function (_column, _order, _dir) {
    if (_column != _order) return '';
    return 'sorting_' + _dir;
  },
  checkEmail: function (_email) {
    let patternEmail = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;
    if (!patternEmail.test(_email)) {
      return false
    }
    return true;
  },
  checkPasswd: function (_passwd) {
    let patternPwd = /^(?=.*[0-9])(?=.*[`~!@#$%^&*])[a-zA-Z0-9`~!@#$%^&*]{8,20}$/;
    if (!patternPwd.test(_passwd)) {
      return false
    }
    return true;    
  }
};
 