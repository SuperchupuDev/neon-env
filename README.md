# neon-env
> Basically [typed-env](https://www.npmjs.com/package/typed-env), but with support for choices and maintained.

A typed environment variable parser with support for choices, custom parsers, and more.

## Installation

> Node.js ^14.8, v16 or newer is required. [See issue #1](https://github.com/SuperchupuDev/neon-env/issues/1#issuecomment-1296366710).

```sh-session
npm i neon-env
```

## Usage

```ts
import { createEnv } from 'neon-env';

const env = createEnv({
  PORT: { type: 'number', default: 80 }
});

env.PORT // number
```

## Features
- Strongly typed
- Supports [custom parsers](#parser)
- Supports optional environment variables
- Supports limiting the possible values (see [Choices](#choices))
- Supports passing custom environments (see [Options](#options))

### Choices

Make sure you add `as const` after the `choices` array for maximum type safety.

> **Warning**
> If you notice that it's just typed as `string`, this likely means you forgot to add `as const`.

```ts
import { createEnv } from 'neon-env';

const env = createEnv({
  NODE_ENV: {
    type: 'string',
    choices: ['development', 'production'] as const
  }
});

env.NODE_ENV // 'development' | 'production'
```

### Parser
You can pass a `parser` function to return your own custom type

```ts
import { createEnv } from 'neon-env';

const env = createEnv({
  HOMEPAGE: { parser: url => new URL(url) }
});

env.HOMEPAGE // URL
```

### Options
If you want to use a custom env, pass `env` in the `options` parameter, otherwise it will load from `process.env`
```ts
interface Options {
  env?: Record<string, string> | NodeJS.ProcessEnv;
}
```
