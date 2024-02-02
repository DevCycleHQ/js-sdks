import useVariableValue from './useVariableValue'
import { DVCVariableValue } from '@devcycle/js-client-sdk'

type CommonProps = {
    children: React.ReactNode
    variableKey: string
    showBorder?: boolean
    borderColor?: string
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

    const borderColor = props.borderColor ?? '#ff6347'

    const variableValue = useVariableValue(props.variableKey, defaultValue)
    if (variableValue === targetValue) {
        if (props.showBorder) {
            return (
                <div
                    style={{
                        border: `2px solid ${borderColor}`,
                        position: 'relative',
                    }}
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
                            backgroundColor: `${borderColor}`,
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
