const Fragment = require('../src/model/fragment');

describe('Fragment', () => {
  test('creates a fragment', () => {
    const fragment = new Fragment({
      ownerId: 'user1',
      type: 'text/plain',
    });

    expect(fragment.ownerId).toBe('user1');
    expect(fragment.type).toBe('text/plain');
    expect(fragment.id).toBeDefined();
  });

  test('throws without ownerId', () => {
    expect(() => {
      new Fragment({
        type: 'text/plain',
      });
    }).toThrow();
  });

  test('throws without type', () => {
    expect(() => {
      new Fragment({
        ownerId: 'user1',
      });
    }).toThrow();
  });

  test('supported type', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
  });
});