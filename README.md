# typed-env

A typed environment variable parser.

```ts
import config from 'typed-env';

const cfg = config({
  PORT: { type: 'number', optional: true, default: 80 },
  HOMEPAGE: { parser: url.parse }
})

cfg.PORT // number
cfg.HOMEPAGE // URL object
```

## Features
- Strongly typed
- Support for custom parsers
- Support for optional environment variables
- Support for passing in custom environments (see Options)