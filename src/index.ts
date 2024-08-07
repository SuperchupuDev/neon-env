interface ArgInfoType {
  type: 'number' | 'string' | 'array' | 'boolean';
}

interface ArgInfoParser {
  parser: (input: string) => unknown;
}

interface ArgInfoOptional {
  optional?: boolean;
}

interface ArgInfoDefault {
  default?: unknown;
}

interface ArgInfoChoices {
  choices?: readonly unknown[];
}

type ArgInfo = (ArgInfoType | ArgInfoParser) & ArgInfoOptional & ArgInfoDefault & ArgInfoChoices;

interface MappedArgType<Choice> {
  string: Choice extends (infer U)[] ? U : string;
  number: Choice extends (infer U)[] ? U : number;
  boolean: boolean;
  array: string[];
}

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

type GetArgTypeInner<T extends ArgInfo> = T extends ArgInfoParser
  ? ReturnType<T['parser']>
  : T extends ArgInfoType
    ? MappedArgType<Mutable<T['choices']>>[T['type']]
    : never;

type GetArgTypeOptional<T extends ArgInfo> = T extends ArgInfoDefault ? T['default'] : undefined;

type GetArgType<T extends ArgInfo> = T extends ArgInfoOptional
  ? GetArgTypeInner<T> | GetArgTypeOptional<T>
  : GetArgTypeInner<T>;

type ArgReturnType<T extends Record<string, ArgInfo>> = {
  [K in keyof T]: GetArgType<T[K]>;
};

export interface Options {
  env?: Record<string, string> | NodeJS.ProcessEnv;
}

export type Config = Record<string, ArgInfo>;

interface CustomEnvError {
  key: string;
  value: string;
  error: unknown;
  kind: 'custom';
}

interface ChoiceEnvError {
  key: string;
  value: string;
  expected: readonly unknown[];
  kind: 'choice';
}

interface NumberEnvError {
  key: string;
  value: string;
  kind: 'number';
}

interface MissingEnvError {
  key: string;
  kind: 'missing';
}

type EnvError = CustomEnvError | ChoiceEnvError | NumberEnvError | MissingEnvError;

export function createEnv<const T extends Config>(info: T, options?: Options): ArgReturnType<T> {
  const env = options?.env ?? (typeof process !== 'undefined' ? process.env : null);

  if (!env) {
    throw new TypeError('No env specified');
  }

  const errors: EnvError[] = [];
  const config: Record<string, unknown> = {};

  for (const [key, argInfo] of Object.entries(info)) {
    const value = env[key];

    if (!value) {
      if ('default' in argInfo) {
        config[key] = argInfo.default;
      } else if (!argInfo.optional) {
        errors.push({ key, kind: 'missing' });
      }

      continue;
    }

    if ('parser' in argInfo) {
      try {
        config[key] = argInfo.parser(value);
      } catch (error) {
        errors.push({ key, value, kind: 'custom', error });
      }

      continue;
    }

    if (argInfo.choices && !argInfo.choices.includes(value)) {
      errors.push({ key, value, kind: 'choice', expected: argInfo.choices });
      continue;
    }

    switch (argInfo.type) {
      case 'string':
        config[key] = value;
        break;
      case 'number': {
        const numberValue = Number(value);
        if (Number.isNaN(numberValue)) {
          errors.push({ key, value, kind: 'number' });
          continue;
        }
        config[key] = numberValue;
        break;
      }
      case 'boolean':
        config[key] = value.toLowerCase() === 'true' || value === '1';
        break;
      case 'array':
        config[key] = value.split(/, ?/gu);
        break;
    }
  }

  if (errors.length !== 0) {
    let message = 'The following environment variables are invalid:\n';

    for (const error of errors) {
      switch (error.kind) {
        case 'missing':
          message += `  ${error.key} (missing)\n`;
          break;
        case 'number':
          message += `  ${error.key}: ${error.value} (expected number)\n`;
          break;
        case 'choice':
          message += `  ${error.key}: ${error.value} (expected one of ${error.expected.join(', ')})\n`;
          break;
        case 'custom':
          message += `  ${error.key}: ${error.value} (${error.error})\n`;
          break;
      }
    }
    throw new TypeError(message);
  }

  return config as ArgReturnType<T>;
}
