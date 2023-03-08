import { benchmarkSuite } from 'jest-bench'
import { DVCClient } from '../src'

const test_environmentKey = 'dvc_server_token_hash'
let client: DVCClient

benchmarkSuite('variableBenchmark', {
    setup() {
        client = new DVCClient('token')
    }
})
