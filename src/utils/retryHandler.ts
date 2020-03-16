export async function retryHandler<T>(func: (retryCnt: number) => Promise<T>, cnt: number = 1, log?: (e: Error) => Promise<void> | void): Promise<T> {
    if (cnt < 1) {
        cnt = 1
    }
    let retryCounter: number = 0;
    while (retryCounter < cnt) {
        try {
            let result = await func(retryCounter)
            return result
        } catch (e) {
            if (log) {
                log(e);
            }
        }
        retryCounter++;
    }
    throw new Error(`max retry reached`);
}
