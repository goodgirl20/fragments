// src/model/fragment.js

const crypto = require('crypto');

const { readFragment, writeFragment, readFragmentData, writeFragmentData } = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('ownerId is required');
    }

    if (!type) {
      throw new Error('type is required');
    }

    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported content type: ${type}`);
    }

    this.id = id || crypto.randomUUID();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Assignment 2 supports all text types and application/json.
   */
  static isSupportedType(type) {
    if (!type || typeof type !== 'string') {
      return false;
    }

    const mediaType = type.split(';')[0].trim().toLowerCase();

    return mediaType.startsWith('text/') || mediaType === 'application/json';
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
    let buffer;

    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (typeof data === 'string') {
      buffer = Buffer.from(data);
    } else {
      buffer = Buffer.from(JSON.stringify(data));
    }

    this.size = buffer.length;

    await writeFragmentData(this.ownerId, this.id, buffer);
    await this.save();
  }
}

module.exports = Fragment;
