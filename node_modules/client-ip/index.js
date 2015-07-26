module.exports = function (req) {
  if (!req) throw new Error('Request object required to find client IP address');
  
  return req.headers['x-forwarded-for'] || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}