const aes256 = require('aes256');

const encrypt = (key, input) => {
  return aes256.encrypt(key, input);
};

const decrypt = (key, input) => {
  return aes256.decrypt(key, input);
};

module.exports = { encrypt, decrypt }