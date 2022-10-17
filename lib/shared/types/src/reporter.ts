
export type FlushResults = {
    successes: number,
    failures: number,
    retries: number,
}

export type Tags = Record<string, string>

export type MetricName = 
    'queueLength'
    | 'flushPayloadSize'
    | 'flushRequestDuration'
    | 'jsonParseDuration'

export interface DVCReporter {
    reportFlushResults(results: FlushResults, tags: Tags): void
    reportMetric(key: MetricName, value: number, tags: Tags): void
}