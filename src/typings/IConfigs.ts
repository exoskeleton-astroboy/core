export interface IConfigToken<T> {
  key: symbol;
}

export interface IConfigEntry<T> {
  token: IConfigToken<T>;
  value: T;
}

export type TokenGenerator = <T>(key: string) => IConfigToken<T>;

export const createOptions: TokenGenerator = (key: string) => ({
  key: Symbol(key)
});
export const createConfig: TokenGenerator = (key: string) => ({
  key: Symbol(`config::${key}`)
});
