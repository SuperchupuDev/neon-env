import { describe, expect, it } from 'vitest';
import { createEnv } from '../src/index.js';

describe('env', () => {
  it('should work', () => {
    const env = {
      TEST_STRING: 'test',
      TEST_NUMBER: '123',
      TEST_ARRAY: 'a,b,c',
      TEST_BOOLEAN: 'true',
      TEST_BOOLEAN_2: '1',
      TEST_BOOLEAN_3: 'false',
      TEST_BOOLEAN_4: '0'
    };

    const result = createEnv(
      {
        TEST_STRING: { type: 'string' },
        TEST_STRING_DEFAULT: { type: 'string', default: 'default' },
        TEST_NUMBER: { type: 'number' },
        TEST_ARRAY: { type: 'array' },
        TEST_BOOLEAN: { type: 'boolean' },
        TEST_BOOLEAN_2: { type: 'boolean' },
        TEST_BOOLEAN_3: { type: 'boolean' },
        TEST_BOOLEAN_4: { type: 'boolean' },
        TEST_OPTIONAL: { type: 'string', optional: true }
      },
      { env }
    );

    expect(result).toEqual({
      TEST_STRING: 'test',
      TEST_STRING_DEFAULT: 'default',
      TEST_NUMBER: 123,
      TEST_ARRAY: ['a', 'b', 'c'],
      TEST_BOOLEAN: true,
      TEST_BOOLEAN_2: true,
      TEST_BOOLEAN_3: false,
      TEST_BOOLEAN_4: false
    });
  });

  it('should throw with invalid values', () => {
    const env = {
      TEST_STRING: 'test'
    };

    expect(() =>
      createEnv(
        {
          TEST_STRING: { type: 'string', choices: ['hello', 'hi'] as const }
        },
        { env }
      )
    ).toThrowError('Invalid value for TEST_STRING environment variable: test');

    expect(() =>
      createEnv(
        {
          TEST_NUMBER: { type: 'number' }
        },
        { env }
      )
    ).toThrow('Missing environment variable: TEST_NUMBER');
  });
});
