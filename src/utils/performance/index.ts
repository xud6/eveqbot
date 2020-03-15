export function formatHrtime(hr: [number, number]) {
    return hr[0] + 's ' + hr[1] / 1000000 + 'ms ' + hr[1] % 1000000 + 'ns'
}

/**
 * 性能计时模块
 */
export class performance {
    hrTime: [number, number]
    constructor() {
        // 记录当前的高精度时钟时间
        this.hrTime = process.hrtime()
    }
    /**
     * 重置计时器
     */
    reset(): void {
        this.hrTime = process.hrtime()
    }
    /**
     * 计算经过的时间
     */
    timePast(): [number, number] {
        
        return process.hrtime(this.hrTime);
    }
    /**
     * 输出文字形式的经过时间
     */
    timePastStr(): string {
        return formatHrtime(this.timePast());
    }
}
