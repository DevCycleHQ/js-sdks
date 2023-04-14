import { DVCFeatureSet, DVCVariableSet } from './types'
import { DVCVariable } from './Variable'
import { checkParamType } from './utils'

const EventNames = {
    INITIALIZED: 'initialized',
    NEW_VARIABLES: 'newVariables',
    ERROR: 'error',
    VARIABLE_UPDATED: 'variableUpdated',
    FEATURE_UPDATED: 'featureUpdated',
    CONFIG_UPDATED: 'configUpdated',
}

type eventHandler = (...args: any[]) => void

const isInvalidEventKey = (key: string): boolean => {
    return !Object.values(EventNames).includes(key) &&
    !key.startsWith(EventNames.VARIABLE_UPDATED) &&
    !key.startsWith(EventNames.FEATURE_UPDATED) &&
    !key.startsWith(EventNames.NEW_VARIABLES)
}

const callHandler = (event: Event, handler: eventHandler): void  => {
    const args = (<CustomEvent<any[]>>event).detail
    handler(...args)
}

export class EventEmitter extends EventTarget {
    events: Record<string, {
        handler: eventHandler,
        handlerWrapper: eventHandler
    }[]>

    constructor() {
        super()
        this.events = {}
    }

    subscribe(key: string, handler: eventHandler): void {
        checkParamType('key', key, 'string')
        checkParamType('handler', handler, 'function')

        if (isInvalidEventKey(key)) {
            throw new Error('Not a valid event to subscribe to')
        }  
        
        const handlerWrapper = (event: Event) => callHandler(event, handler)
        this.addEventListener(key, handlerWrapper)
        if (!this.events[key]) {
            this.events[key] = [ { handler, handlerWrapper } ]
        } else {
            this.events[key].push({ handler, handlerWrapper })
        }
    }

    unsubscribe(key: string, handler?: eventHandler): void {
        checkParamType('key', key, 'string')

        if (isInvalidEventKey(key)) {
            return
        }

        if (handler) {
            // find the handler wrapper (the actual event listener) for this handler
            const handlerIndex = this.events[key]
                .findIndex((handlerPair) => handlerPair.handler == handler)
            const handlerWrapper = handlerIndex > -1 ? this.events[key][handlerIndex]?.handlerWrapper : undefined 

            // remove listener and reference to wrapper
            handlerWrapper && this.removeEventListener(key, handlerWrapper)
            this.events[key].splice(handlerIndex, 1)
        } else {
            // remove all listeners
            this.events[key].map(({ handlerWrapper }) => {
                this.removeEventListener(key, handlerWrapper)
            })
            this.events[key] = []
        }
    }

    emit(key: string, ...args: any[]): void {
        checkParamType('key', key, 'string')
        this.dispatchEvent(new CustomEvent(key, { detail: args }))
    }

    emitInitialized(success: boolean): void {
        this.emit(EventNames.INITIALIZED, success)
    }

    emitError(error: unknown): void {
        this.emit(EventNames.ERROR, error)
    }

    emitConfigUpdate(newVariableSet: DVCVariableSet): void {
        this.emit(EventNames.CONFIG_UPDATED, newVariableSet)
    }

    emitVariableUpdates(
        oldVariableSet: DVCVariableSet,
        newVariableSet: DVCVariableSet,
        variableDefaultMap: { [key: string]: { [defaultValue: string]: DVCVariable<any> } }
    ): void {
        const keys = new Set(Object.keys(oldVariableSet).concat(Object.keys(newVariableSet)))
        let newVariables = false
        keys.forEach((key) => {
            const oldVariableValue = oldVariableSet[key] && oldVariableSet[key].value
            const newVariable = newVariableSet[key]
            const newVariableValue = newVariable && newVariableSet[key].value

            if (JSON.stringify(oldVariableValue) !== JSON.stringify(newVariableValue)) {
                const variables = variableDefaultMap[key] && Object.values(variableDefaultMap[key])
                if (variables) {
                    newVariables = true
                    variables.forEach((variable) => {
                        variable.value = newVariableValue ?? variable.defaultValue
                        variable.isDefaulted = newVariableValue === undefined || newVariableValue === null
                        variable.callback?.call(variable, variable.value)
                    })
                }
                const finalVariable = newVariable || null 
                this.emit(`${EventNames.VARIABLE_UPDATED}:*`, key, finalVariable)
                this.emit(`${EventNames.VARIABLE_UPDATED}:${key}`, key, finalVariable)
            }
        })
        if (newVariables) {
            this.emit(`${EventNames.NEW_VARIABLES}`)
        }
    }

    emitFeatureUpdates(oldFeatureSet: DVCFeatureSet, newFeatureSet: DVCFeatureSet): void {
        const keys = Object.keys(oldFeatureSet).concat(Object.keys(newFeatureSet))
        keys.forEach((key) => {
            const oldFeatureVariation = oldFeatureSet[key] && oldFeatureSet[key]._variation
            const newFeature = newFeatureSet[key]
            const newFeatureVariation = newFeature && newFeatureSet[key]._variation

            const finalFeature = newFeature || null 
            if (oldFeatureVariation !== newFeatureVariation) {
                this.emit(`${EventNames.FEATURE_UPDATED}:*`, key, finalFeature)
                this.emit(`${EventNames.FEATURE_UPDATED}:${key}`, key, finalFeature)
            }
        })
    }
}
