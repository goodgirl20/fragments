const memory = require('../src/model/data/memory/memory-db');

describe('Memory DB', () => {
  test('put and get', async () => {
    await memory.put('test', 'hello');

    const value = await memory.get('test');

    expect(value).toBe('hello');
  });

  test('delete', async () => {
    await memory.put('delete', 'value');

    await memory.del('delete');

    const value = await memory.get('delete');

    expect(value).toBeUndefined();
  });

  test('list', async () => {
    const keys = await memory.list();

    expect(Array.isArray(keys)).toBe(true);
  });
});