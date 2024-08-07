import { describe, it } from 'node:test';
import { createEnv } from '../src/index.ts';

const assertType = <T>(value: T) => value;

describe('env types', () => {
  it('should infer the choice types', () => {
    const env = {
      TEST_ENV: 'production'
    };

    const result = createEnv(
      {
        TEST_ENV: { type: 'string', choices: ['production', 'development'] }
      },
      { env }
    );

    assertType<'production' | 'development'>(result.TEST_ENV);
  });
});
