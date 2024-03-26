import {
    DevCycleClient,
    DevCycleUser,
    DVCVariable,
} from '@devcycle/js-client-sdk'
import { BucketedUserConfig } from '@devcycle/types'

type LiveEvent = {
    type: string
    key?: string
    variable?: DVCVariable<any> | null
}

type ClientData = {
    current: {
        config?: BucketedUserConfig
        user?: DevCycleUser
        events: LiveEvent[]
        loadCount: number
    }
}

const clientData: ClientData = {
    current: {
        events: [],
        loadCount: 0,
    },
}

const setupClientSubscription = (client: DevCycleClient) => {
    const addEvent = (event: any) => {
        clientData.current.events.unshift(event)
    }

    const onConfigUpdated = () => {
        clientData.current.config = client.config
        clientData.current.user = client.user
        addEvent({ type: 'configUpdated', date: Date.now() })
    }
    const onVariableEvaluated = (key: string, variable: DVCVariable<any>) => {
        addEvent({
            type: 'variableEvaluated',
            key,
            variable: { ...variable },
            date: Date.now(),
        })
    }
    const onVariableUpdated = (
        key: string,
        variable: DVCVariable<any> | null,
    ) => {
        addEvent({
            type: 'variableUpdated',
            key,
            variable: variable ? { ...variable } : null,
            date: Date.now(),
        })
    }
    client.subscribe('configUpdated', onConfigUpdated)
    client.subscribe('variableEvaluated:*', onVariableEvaluated)
    client.subscribe('variableUpdated:*', onVariableUpdated)

    return () => {
        client.unsubscribe('configUpdated', onConfigUpdated)
        client.unsubscribe('variableEvaluated:*', onVariableEvaluated)
        client.unsubscribe('variableUpdated:*', onVariableUpdated)
    }
}

export const createIframe = (
    client: DevCycleClient,
    debuggerUrl = 'https://debugger.devcycle.com',
) => {
    const cleanup = setupClientSubscription(client)
    const iframe = document.createElement('iframe')

    const postDataMessage = (data: ClientData['current']) => {
        console.log('posting message', data)
        iframe.contentWindow!.postMessage(
            {
                ...data,
                type: 'dvcDebuggerData',
            },
            debuggerUrl,
        )
    }

    const listener = (event: MessageEvent) => {
        if (event.origin === debuggerUrl) {
            console.log('Message received from iframe: ', event.data)
            if (
                event.data.type === 'DEVCYCLE_IDENTIFY_USER' &&
                event.data.user
            ) {
                void client.identifyUser(event.data.user)
            } else if (event.data.type === 'DEVCYCLE_RESET_USER') {
                void client.resetUser()
            } else if (event.data.type === 'DEVCYCLE_REFRESH') {
                postDataMessage(clientData.current)
            }
        }
    }
    window.addEventListener('message', listener)

    const createIframeWhenReady = () => {
        client.onClientInitialized().then(() => {
            clientData.current.config = client.config
            clientData.current.user = client.user

            const searchParams = new URLSearchParams()
            searchParams.set('project_id', client.config!.project._id)
            searchParams.set('org_id', client.config!.project.a0_organization)
            searchParams.set('user_id', client.user!.user_id)
            searchParams.set('environment_id', client.config!.environment._id)
            searchParams.set('parentOrigin', window.location.origin)

            iframe.id = 'devcycle-debugger-iframe'
            iframe.src = `${debuggerUrl}?${searchParams.toString()}`
            iframe.style.width = '500px'
            iframe.style.height = '700px'
            iframe.style.position = 'absolute'
            iframe.style.bottom = '50px'
            iframe.style.right = '100px'
            iframe.style.border = 'none'
            iframe.style.overflow = 'hidden'
            iframe.title = 'Devcycle Debugger'
            iframe.onload = () => {
                clientData.current.loadCount += 1
            }

            document.body.appendChild(iframe)
        })
    }

    if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
    ) {
        createIframeWhenReady()
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            createIframeWhenReady()
        })
    }

    return () => {
        window.removeEventListener('message', listener)
        cleanup()
        document.body.removeChild(iframe)
    }
}
