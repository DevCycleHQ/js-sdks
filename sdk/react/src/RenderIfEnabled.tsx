import useVariableValue from './useVariableValue'
import { DVCVariableValue } from '@devcycle/js-client-sdk'
import { useContext } from 'react'
import { debugContext } from './context'
import { VariableKey } from '@devcycle/types'

type CommonProps = {
    children: React.ReactNode
    variableKey: VariableKey
}

type RenderIfEnabledProps<T extends DVCVariableValue> =
    | CommonProps
    | (CommonProps & {
          targetValue: T
          defaultValue: T
      })

export const RenderIfEnabled = <T extends DVCVariableValue>(
    props: RenderIfEnabledProps<T>,
): React.ReactNode => {
    let targetValue: DVCVariableValue
    let defaultValue: DVCVariableValue
    if ('targetValue' in props) {
        targetValue = props.targetValue
        defaultValue = props.defaultValue
    } else {
        targetValue = true
        defaultValue = false
    }

    const variableValue = useVariableValue(props.variableKey, defaultValue)
    const debugSettings = useContext(debugContext)

    if (variableValue === targetValue) {
        if (debugSettings.showConditionalBorders) {
            return (
                <div
                    style={{
                        border: `2px solid ${debugSettings.borderColor}`,
                        position: 'relative',
                    }}
                    className={`devcycle-conditional-border devcycle-conditional-border-${props.variableKey}`}
                >
                    <a
                        style={{
                            position: 'absolute',
                            cursor: 'pointer',
                            right: '-2px',
                            top: '-2.5rem',
                            color: 'white',
                            fontSize: '1.5rem',
                            padding: '2px 5px',
                            backgroundColor: `${debugSettings.borderColor}`,
                        }}
                        target={'_blank'}
                        href={`https://app.devcycle.com/r/variables/${props.variableKey}`}
                        rel="noreferrer"
                    >
                        {props.variableKey}: {JSON.stringify(variableValue)}
                    </a>
                    {props.children}
                </div>
            )
        }
        return <>{props.children}</>
    }
    return null
}
