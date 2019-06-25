import { TypedSerializerCreator } from "./core";

export * from "./defines";

/** 内建静态类型序列化工具 (based on cerialize) */
export const TypedSerializer = new TypedSerializerCreator();
