import { sdkOpenfeatureNodeServer } from './sdk-openfeature-nodejs-provider';

describe('sdkOpenfeatureNodeServer', () => {
    it('should work', () => {
        expect(sdkOpenfeatureNodeServer()).toEqual('sdk-openfeature-nodejs-provider');
    })
})
