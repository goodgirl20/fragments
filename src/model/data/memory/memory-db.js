const db = {};

module.exports.get = async (key) => db[key];

module.exports.put = async (key, value) => {
  db[key] = value;
};

module.exports.del = async (key) => {
  delete db[key];
};

module.exports.list = async () => Object.keys(db);

module.exports.reset = async () => {
  Object.keys(db).forEach((key) => delete db[key]);
};