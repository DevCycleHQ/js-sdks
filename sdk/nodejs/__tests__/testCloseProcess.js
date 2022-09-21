const { initialize } = require('../../../dist/sdk/nodejs')

const client = initialize('token')

client.close()
