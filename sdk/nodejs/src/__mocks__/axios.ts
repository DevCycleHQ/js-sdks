module.exports = {
  request: jest.fn((req) => {
    if (req.url.indexOf('/v1/variables/') > -1) {
      expect(req.data.platform).toBe('NodeJS Cloud')
      if (req.url.indexOf('not-in-config') > -1) {
        return Promise.reject({
          status: 400,
          message: 'Variable not availabe for this User'
        })
      } else {
        return Promise.resolve({
          status: 200,
          data: {
            key: 'test-key',
            value: true,
            type: 'Boolean',
            defaultValue: false
          }
        })
      }
    } else if (req.url.indexOf('/v1/variables') > -1) {
      expect(req.data.platform).toBe('NodeJS Cloud')
      if (req.data.user_id === 'bad') {
        return Promise.reject({
          status: 400,
          message: 'No Variables for this User'
        })
      } else if (req.data.user_id === 'empty') {
        return Promise.resolve({
          status: 200,
          data: {}
        })
      } else {
        return Promise.resolve({
          status: 200,
          data: {
            'test-key': {
              key: 'test-key',
              value: true,
              type: 'Boolean',
              defaultValue: false
            }
          }
        })
      }
    } else if (req.url.indexOf('/v1/features') > -1) {
      expect(req.data.platform).toBe('NodeJS Cloud')
      if (req.data.user_id === 'bad') {
        return Promise.reject({
          status: 400,
          message: 'No Features for this User'
        })
      } else if (req.data.user_id === 'empty') {
        return Promise.resolve({
          status: 200,
          data: {}
        })
      } else {
        return Promise.resolve({
          status: 200,
          data: {
            'test-feature': {
              _id: 'test-id',
              _variation: 'variation-id',
              variationKey: 'variationKey',
              variationName: 'Variation Name',
              key: 'test-feature',
              type: 'release',
            }
          }
        })
      }
    } else if (req.url.indexOf('/v1/track') > -1) {
      expect(req.data.user.platform).toBe('NodeJS Cloud')
      if (req.data.user.user_id === 'bad') {
        console.log('bad user')
        return Promise.reject({
          status: 401,
          message: 'Unauthorized',
          data: 'Unauthorized'
        })
      } else {
        return Promise.resolve({
          status: 201,
          message: 'Event tracked'
        })
      }
    } else {
      return Promise.reject({
        status: 400,
        message: 'Generic Error'
      })
    }
  }),
  create: jest.fn(function () {
    return this
  })
}