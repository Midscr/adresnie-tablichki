const connect = require('./connections');

const delivery = function (callback) {
      connect.query('SELECT * FROM delivery', callback);
      connect.end();
}
 
module.exports = delivery;
