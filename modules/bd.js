const connect = require('./connections');

const getCity = function (callback) {
      connect.query('SELECT * FROM adresnie_tablichki', callback);
}
 
module.exports = getCity;
