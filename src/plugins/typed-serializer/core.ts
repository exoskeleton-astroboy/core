import { Constructor } from "@bonbons/di";
import { Deserialize, GenericDeserialize, Serialize } from "cerialize";
import {
  IStaticSerializeOptions,
  IStaticTypedResolver
} from "../../typings/IStaticTypeResolver";

/**
 * 内建静态类型序列化工具类
 * @description
 * @author Big Mogician
 * @export
 * @class TypedSerializerCreator
 * @implements {IStaticTypedResolver}
 */
export class TypedSerializerCreator implements IStaticTypedResolver {
  public ToJSON<T = any>(
    obj: any,
    options?: Partial<IStaticSerializeOptions<T>>
  ): string {
    if (options === undefined) options = { format: false };
    return JSON.stringify(
      Serialize(obj, options.type),
      null,
      options.format ? "  " : 0
    );
  }

  public FromJSON<T = any>(json: string, type?: Constructor<T>): T {
    return !type
      ? (Deserialize(JSON.parse(json)) as T)
      : (GenericDeserialize(JSON.parse(json), type) as T);
  }

  public ToObject<T = any>(
    obj: any,
    options?: Partial<IStaticSerializeOptions<T>>
  ): any {
    if (options === undefined) options = { format: false };
    return Serialize(obj, options.type);
  }

  public FromObject<T>(json: any, type?: Constructor<T>): T {
    return !type
      ? (Deserialize(json) as T)
      : (GenericDeserialize(json, type) as T);
  }
}
