import { exec } from 'node:child_process'

describe('dvcClient cleanup', () => {
    it('cleans up any open handles when close is called', (done) => {
        exec('node ' + __dirname + '/testCloseProcess.js', { timeout: 2000 }, (error: unknown) => {
            if (error) {
                done(error)
                return
            }
            done()
        })
    })
})
