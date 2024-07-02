import { sharedVercelEdgeConfig } from './shared-vercel-edge-config'

describe('sharedVercelEdgeConfig', () => {
    it('should work', () => {
        expect(sharedVercelEdgeConfig()).toEqual('shared-vercel-edge-config')
    })
})
