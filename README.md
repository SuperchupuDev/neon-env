# neon-env
> Basically [typed-env](https://www.npmjs.com/package/typed-env), but with support for choices and maintained.

A typed environment variable parser with support for choices, custom parsers, and more.

## Usage

```ts
import { config } from 'neon-env';

const env = config({
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

<warn>If you notice that it's just typed as `string` this likely means you forgot to add `as const`.</warn>

```ts
import { config } from 'neon-env';

const env = config({
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
import { config } from 'neon-env';

const env = config({
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
