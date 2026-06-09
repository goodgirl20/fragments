// src/model/fragment.js

const crypto = require('crypto');

const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    }

    if (!type) {
      throw new Error('type is required');
    }

    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  static isSupportedType(type) {
    return ['text/plain'].includes(type);
  }

  async save() {
    this.updated = new Date().toISOString();
    await writeFragment(this);
  }

  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);

    if (!fragment) {
      throw new Error('Fragment not found');
    }

    return new Fragment(fragment);
  }

  async getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    this.size = Buffer.byteLength(data);
    await writeFragmentData(this.ownerId, this.id, data);
    await this.save();
  }
}

module.exports = Fragment;