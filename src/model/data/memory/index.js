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

/**
 * Returns fragment IDs by default.
 * If expand=true, returns complete fragment metadata.
 */
module.exports.listFragments = async (ownerId, expand = false) => {
  const keys = await memory.list();

  const fragmentKeys = keys
    .filter((key) => key.startsWith(`${ownerId}:`))
    .filter((key) => !key.endsWith(':data'));

  if (!expand) {
    return fragmentKeys.map((key) => key.split(':')[1]);
  }

  return Promise.all(
    fragmentKeys.map(async (key) => {
      return memory.get(key);
    })
  );
};
