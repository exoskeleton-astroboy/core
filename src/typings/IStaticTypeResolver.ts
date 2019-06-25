import { Constructor } from "@bonbons/di";

export interface IStaticSerializeOptions<T> {
  format: boolean;
  type: Constructor<T>;
}

export interface IStaticTypedResolver {
  /** Convert static typed instance to JSON text */
  ToJSON<T = any>(
    obj: any,
    options?: Partial<IStaticSerializeOptions<T>>
  ): string;
  /** Convert JSON text to static typed instance */
  FromJSON<T = any>(json: string, type?: Constructor<T>): T;
  /** Convert static typed instance to javascript object */
  ToObject<T = any>(
    obj: any,
    options?: Partial<IStaticSerializeOptions<T>>
  ): any;
  /** Convert javascript object to static typed instance */
  FromObject<T = any>(json: any, type?: Constructor<T>): T;
}
