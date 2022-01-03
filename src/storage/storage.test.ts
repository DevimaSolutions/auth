import LocalStorage from './local-storage';
import MemoryStorage from './memory-storage';

import type { IStorage } from './types';

const storages = [
  { storage: new LocalStorage() as IStorage, name: 'LocalStorage' },
  { storage: new MemoryStorage() as IStorage, name: 'MemoryStorage' },
];

const multiSetData = {
  'key-1': 'value-1',
  'key-2': 'value-2',
  'key-3': 'value-3',
  'key-4': 'value-4',
};

const singleSetData = {
  key: 'test-key',
  value: 'test-value',
};

describe.each(storages)('$name', ({ storage }) => {
  test(`Throw error when getting undefined value`, () => {
    expect(() => {
      storage.getItem('notExistingKey');
    }).toThrowError();
  });
  test(`Can set and get value`, () => {
    storage.setItem(singleSetData.key, singleSetData.value);
    const actualResult = storage.getItem(singleSetData.key);
    expect(actualResult).toBe(singleSetData.value);
  });
  test(`Can set multiple values`, () => {
    storage.multiSet(multiSetData);
    Object.entries(multiSetData).forEach(([key, value]) => {
      const currentResult = storage.getItem(key);
      expect(currentResult).toBe(value);
    });
  });
  test(`Can remove value`, () => {
    storage.setItem(singleSetData.key, singleSetData.value);
    const getResult = storage.getItem(singleSetData.key);
    expect(getResult).toBe(singleSetData.value);

    storage.remove(singleSetData.key);

    expect(() => {
      storage.getItem(singleSetData.key);
    }).toThrowError();
  });
  test(`Can remove multiple values`, () => {
    storage.multiSet(multiSetData);
    Object.entries(multiSetData).forEach(([key, value]) => {
      const currentResult = storage.getItem(key);
      expect(currentResult).toBe(value);
    });

    storage.multiRemove(Object.keys(multiSetData));

    Object.keys(multiSetData).forEach((key) => {
      expect(() => {
        storage.getItem(key);
      }).toThrowError();
    });
  });
});
