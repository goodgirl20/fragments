// src/model/data/memory/index.js

const memory = require('./memory-db');

module.exports.readFragment = async (ownerId, id) => {
  return memory.get(`${ownerId}:${id}`);
};

module.exports.writeFragment = async (fragment) => {
  return memory.put(`${fragment.ownerId}:${fragment.id}`, fragment);
};

module.exports.readFragmentData = async (ownerId, id) => {
  return memory.get(`${ownerId}:${id}:data`);
};

module.exports.writeFragmentData = async (ownerId, id, data) => {
  return memory.put(`${ownerId}:${id}:data`, data);
};

module.exports.listFragments = async (ownerId) => {
  const keys = await memory.list();

  return keys
    .filter((key) => key.startsWith(`${ownerId}:`))
    .filter((key) => !key.endsWith(':data'))
    .map((key) => key.split(':')[1]);
};