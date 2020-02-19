interface ArgInfoType {
  type: 'number' | 'string' | 'list';
}

interface ArgInfoParser {
  parser: (input: string) => any;
}

interface ArgInfoOptional {
  optional?: boolean;
}

interface ArgInfoDefault {
  default?: any;
}

type ArgInfo = (ArgInfoType | ArgInfoParser) & (ArgInfoOptional & ArgInfoDefault);

type ArgType<T extends string> = 
  T extends 'number' ? number :
  T extends 'string' ? string :
  T extends 'list' ? string[] :
  any;

type GetArgTypeInner<T extends ArgInfo> = 
  T extends ArgInfoParser ? ReturnType<T['parser']> :
  T extends ArgInfoType ? ArgType<T['type']> :
  never;

type GetArgTypeOptional<T extends ArgInfo> =
  T extends ArgInfoDefault ? T['default'] : undefined;

type GetArgType<T extends ArgInfo> = T['optional'] extends true ? GetArgTypeInner<T> | GetArgTypeOptional<T> : GetArgTypeInner<T>; 

type ArgReturnType<T extends Record<string, ArgInfo>> = {
  [K in keyof T]: GetArgType<T[K]>;
}

interface Options {
  env?: Record<string, string> | NodeJS.ProcessEnv;
}

export default function config<T extends Record<string, ArgInfo>>(info: T, options?: Options): ArgReturnType<T> {
  const env = options?.env || process.env;

  const config: Record<string, any> = {};

  for(const [key, argInfo] of Object.entries(info)) {
    const value = env[key];

    if (!value) {
      if (!argInfo.optional) {
        throw new Error(`env[${key}] is not defined`);
      } else if ('default' in argInfo) {
        config[key] = argInfo.default;

        continue;
      } else {
        continue;
      }
    }

    if ('parser' in argInfo) {
      config[key] = argInfo.parser(value);

      continue;
    }

    if (argInfo.type === 'string') {
      config[key] = value;
    } else if (argInfo.type === 'number') {
      config[key] = parseInt(value);
    } else if (argInfo.type === 'list') {
      config[key] = value.split(',');
    }
  }

  return config as ArgReturnType<T>;
};