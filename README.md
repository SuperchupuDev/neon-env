# neon-env

## Merged with [typed-env](https://www.npmjs.com/package/typed-env), development will continue there, use that instead.

> Basically [typed-env](https://www.npmjs.com/package/typed-env), but with support for choices and maintained.

A typed environment variable parser with support for choices, custom parsers, and more.

## Installation

> Node.js ^14.18.0, v16 or newer is required. [See issue #1](https://github.com/SuperchupuDev/neon-env/issues/1#issuecomment-1296366710).

```sh-session
npm i neon-env
```

## Usage

```ts
import { createEnv } from 'neon-env';

const env = createEnv({
  PORT: { type: 'number', default: 80 }
});

env.PORT; // number
```

## Features

- Strongly typed
- Supports [custom parsers](#parser)
- Supports optional environment variables
- Supports limiting the possible values (see [Choices](#choices))
- Supports passing custom environments (see [Options](#options))

### Choices

```ts
import { createEnv } from 'neon-env';

const env = createEnv({
  NODE_ENV: {
    type: 'string',
    choices: ['development', 'production']
  }
});

env.NODE_ENV; // 'development' | 'production'
```

As of 0.2.0, you no longer need to add `as const` to the choices array to get the best type safety.

### Parser

You can pass a `parser` function to return your own custom type

```ts
import { createEnv } from 'neon-env';

const env = createEnv({
  HOMEPAGE: { parser: url => new URL(url) }
});

env.HOMEPAGE; // URL
```

### Options

If you want to use a custom env, pass `env` in the `options` parameter, otherwise it will load from `process.env`

```ts
interface Options {
  env?: Record<string, string> | NodeJS.ProcessEnv;
}
```
