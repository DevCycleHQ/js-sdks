import {
    variableForUser_PB
} from '../bucketingImportHelper'
import protobuf, { Type } from 'protobufjs'
import fs from 'fs'
import path from 'path'

describe('protobuf tests', () => {
    let VariableForUserParams_PB: Type
    beforeAll(() => {
        const protoFile = '../../assembly/types/protobuf/variableForUserParams.proto'
        const filePath = path.resolve(__dirname, protoFile)
        const root = protobuf.loadSync(filePath)
        VariableForUserParams_PB = root.lookupType('VariableForUserParams_PB')
        if (!VariableForUserParams_PB) throw new Error('VariableForUserParams_PB not found')
    })

    it('should write protobuf message', () => {
        const params = {
            sdkKey: 'sdkKey',
            variableKey: 'variableKey',
            variableType: 2,
            user: {
                userId: 'userId'
            }
        }
        const err = VariableForUserParams_PB.verify(params)
        if (err) throw new Error(err)

        const pbMsg = VariableForUserParams_PB.create(params)
        const buffer = VariableForUserParams_PB.encode(pbMsg).finish()
        const resultBuffer = variableForUser_PB(buffer)
        const result = VariableForUserParams_PB.decode(resultBuffer)
        expect(result).toEqual(params)
    })
})
