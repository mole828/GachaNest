import { Logger } from "@nestjs/common";

export const log = <A extends any[], R>(
    target: Object,
    methodName: string,
    descriptor: TypedPropertyDescriptor<(...args: A) => R>) => {
    let method = descriptor.value!; 
    descriptor.value = (...args: A) => {
        const resp = method.apply(target, args);
        Logger.log(`${methodName}(${args}) => ${resp}`, `${target.constructor.name}`)
        return resp;
    }
}