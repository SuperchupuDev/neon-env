import process from 'node:process';
import { describe, expect, it } from 'vitest';
import { createEnv } from '../src/index.js';

describe('env', () => {
  it('should work', () => {
    const env = {
      TEST_STRING: 'test',
      TEST_NUMBER: '123',
      TEST_ARRAY: 'a,b,c',
      TEST_ARRAY_2: 'd, e, f',
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
        TEST_ARRAY_2: { type: 'array' },
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
      TEST_ARRAY_2: ['d', 'e', 'f'],
      TEST_BOOLEAN: true,
      TEST_BOOLEAN_2: true,
      TEST_BOOLEAN_3: false,
      TEST_BOOLEAN_4: false
    });
  });

  it('should work with choices', () => {
    const env = {
      TEST_ENV: 'production'
    };

    const result = createEnv(
      {
        TEST_ENV: { type: 'string', choices: ['production', 'development'] }
      },
      { env }
    );

    expect(result).toEqual({
      TEST_ENV: 'production'
    });
  });

  it('should throw with invalid choice value', () => {
    const env = {
      TEST_STRING: 'test'
    };

    expect(() =>
      createEnv(
        {
          TEST_STRING: { type: 'string', choices: ['hello', 'hi'] }
        },
        { env }
      )
    ).toThrowError('Invalid value for TEST_STRING environment variable: test');
  });

  it('should throw with missing required field', () => {
    const env = {
      TEST_STRING: 'test'
    };
    expect(() =>
      createEnv(
        {
          TEST_NUMBER: { type: 'number' }
        },
        { env }
      )
    ).toThrow('Missing environment variable: TEST_NUMBER');
  });

  it('should throw with invalid number', () => {
    const env = {
      TEST_NUMBER: '123a'
    };
    expect(() =>
      createEnv(
        {
          TEST_NUMBER: { type: 'number' }
        },
        { env }
      )
    ).toThrow('Invalid value for TEST_NUMBER environment variable, should be number: 123a');
  });

  it('should work with a custom parser', () => {
    const env = {
      TEST_STRING: 'test'
    };

    const result = createEnv(
      {
        TEST_STRING: {
          parser(value) {
            return value.toUpperCase();
          }
        }
      },
      { env }
    );

    expect(result).toEqual({
      TEST_STRING: 'TEST'
    });
  });

  it('should work with process.env', () => {
    process.env.TEST_STRING = 'test';

    const result = createEnv({
      TEST_STRING: { type: 'string' }
    });

    expect(result).toEqual({
      TEST_STRING: 'test'
    });
  });
});
