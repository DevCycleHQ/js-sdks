import { Target } from '../../assembly/types'
import { JSON as ASJSON } from 'assemblyscript-json/assembly'

describe('Target', () => {
    it('should work for a valid target', () => {
        const data = {
            _id: 'test',
            _audience: {

            },
            distribution: [{
                _variation: 'variation',
                percentage: 100
            }],
            rollout: {

            }
        }
        expect(() => new Target(ASJSON.parse(JSON.stringify(data)) as ASJSON.Obj)).not.toThrow()
    })

    it('should fail for required field _id', () => {
        expect(Target).toBeDefined()
    })
})
