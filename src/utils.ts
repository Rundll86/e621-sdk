export function assignRecursive<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
    const result = Object(target);
    for (const nextSource of sources) {
        if (nextSource != null) {
            for (const nextKey in nextSource) {
                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                    const nextVal = nextSource[nextKey];
                    if (typeof nextVal === 'object' && nextVal !== null && !Array.isArray(nextVal)) {
                        result[nextKey] = assignRecursive(Object.prototype.hasOwnProperty.call(result, nextKey) ? result[nextKey] : {}, nextVal);
                    } else {
                        result[nextKey] = nextVal;
                    }
                }
            }
        }
    }
    return result;
}