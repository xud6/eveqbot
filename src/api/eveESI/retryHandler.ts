
export async function retryHandler<T>(func: () => Promise<T>, cnt: number = 1, log?: (e: Error) => Promise<void> | void): Promise<T> {
    if (cnt < 1) {
        cnt = 1
    }
    while (cnt-- > 0) {
        try {
            let result = await func()
            return result
        } catch (e) {
            if (log) {
                log(e);
            }
        }
    }
    throw new Error(`max retry reached`);
}
