import { useObfuscationTest } from '../../devcycleClient'

export const DevCycleExample = () => {
    const obfuscationVariable = useObfuscationTest(false)
    return (
        <div>Obfuscation Test Value: {JSON.stringify(obfuscationVariable)}</div>
    )
}

export default DevCycleExample
