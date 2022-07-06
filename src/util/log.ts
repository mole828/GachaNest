import { Logger } from "@nestjs/common";

export function log<A extends any[], R>(
    target: Object,
    methodName: string,
    descriptor: TypedPropertyDescriptor<(...args: A) => R>) {
    let method = descriptor.value!; // this is the wrapped function
    descriptor.value = function (...args: A) {
        // instead of methodName, method.name works as well to get its name
        const resp = method.apply(target, args);
        Logger.log(`${methodName}(${args}) => ${resp}`, `${target.constructor.name}`)
        return resp;
    }
}