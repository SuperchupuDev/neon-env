import process from 'node:process';

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

export function config<T extends Config>(info: T, options?: Options): ArgReturnType<T> {
  const env = options?.env ?? process.env;

  const config: Record<string, unknown> = {};

  for (const [key, argInfo] of Object.entries(info)) {
    const value = env[key];

    if (!value) {
      if (!argInfo.optional) {
        throw new Error(`Missing environment variable: ${key}`);
      }
      if ('default' in argInfo) {
        config[key] = argInfo.default;
      }

      continue;
    }

    if ('parser' in argInfo) {
      config[key] = argInfo.parser(value);

      continue;
    }

    if (argInfo.choices && !argInfo.choices.includes(value)) {
      throw new Error(`Invalid value for environment variable: ${key}`);
    }

    switch (argInfo.type) {
      case 'string':
        config[key] = value;
        break;
      case 'number':
        config[key] = Number(value);
        break;
      case 'boolean':
        config[key] = value.toLowerCase() === 'true' || value === '1';
        break;
      case 'array':
        config[key] = value.split(',');
        break;
    }
  }

  return config as ArgReturnType<T>;
}
