import { assertType, describe, it } from 'vitest';
import { createEnv } from '../src/index.js';

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
