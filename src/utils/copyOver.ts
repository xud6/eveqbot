import { merge, isArray, union, isObject } from "lodash";

/**
 * Created by xudaiqing on 2014/12/16.
 */

export function copyOver<T, K>(old: T & K, overWrite: K): T & K {
    return merge(old, overWrite, function (oldProperties: any, overWriteProperties: any) {
        if (isArray(oldProperties)) {
            if (isArray(overWriteProperties)) {
                return union(oldProperties, overWriteProperties);
            } else {
                return union(oldProperties, [overWriteProperties]);
            }
        } else if (isObject()) {
            return copyOver(oldProperties, overWriteProperties);
        } else {
            return overWriteProperties;
        }
    });
};

export default copyOver;
