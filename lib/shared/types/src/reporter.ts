
export type FlushResults = {
    successes: number,
    failures: number,
    retries: number,
}

export type Tags = Record<string, string>

export interface DVCReporter {
    reportFlushResults(results: FlushResults, tags: Tags): void
    reportMetric(key: string, value: number, tags: Tags): void
}
