import {
    DevCycleClient,
    DevCycleUser,
    DVCVariable,
} from '@devcycle/js-client-sdk'
import { BucketedUserConfig } from '@devcycle/types'
import { setTimeout } from '@testing-library/react-native/build/helpers/timers'

type LiveEvent = {
    type: string
    key?: string
    variable?: DVCVariable<any> | null
}

type ClientData = {
    current: {
        config?: BucketedUserConfig
        user?: DevCycleUser
        liveEvents: LiveEvent[]
        loadCount: number
        expanded: boolean
    }
}

const clientData: ClientData = {
    current: {
        liveEvents: [],
        loadCount: 0,
        expanded: false,
    },
}

const synchronizeIframeUrl = (
    client: DevCycleClient,
    iframe: HTMLIFrameElement,
    position: string,
    debuggerUrl: string,
) => {
    const searchParams = new URLSearchParams()
    // searchParams.set('project_id', client.config!.project._id)
    // searchParams.set('org_id', client.config!.project.a0_organization)
    // searchParams.set('user_id', client.user!.user_id)
    // searchParams.set('environment_id', client.config!.environment._id)
    searchParams.set('parentOrigin', window.location.origin)
    searchParams.set('position', position)
    const url = `${debuggerUrl}/${client.config!.project.a0_organization}/${
        client.config!.project._id
    }/${client.config!.environment._id}?${searchParams.toString()}`
    if (url !== iframe.src) {
        iframe.src = url
    }
}

const setupClientSubscription = (
    client: DevCycleClient,
    postDataMessage: () => void,
) => {
    const addEvent = (event: any) => {
        clientData.current.liveEvents.unshift(event)
    }

    const onConfigUpdated = () => {
        clientData.current.config = client.config
        clientData.current.user = client.user
        addEvent({ type: 'configUpdated', date: Date.now() })
        postDataMessage()
    }
    const onVariableEvaluated = (key: string, variable: DVCVariable<any>) => {
        addEvent({
            type: 'variableEvaluated',
            key,
            variable: { ...variable },
            date: Date.now(),
        })
        postDataMessage()
    }
    const onVariableUpdated = (
        key: string,
        variable: DVCVariable<any> | null,
    ) => {
        console.log('VARIABLE UPDATED!')
        addEvent({
            type: 'variableUpdated',
            key,
            variable: variable ? { ...variable } : null,
            date: Date.now(),
        })
        postDataMessage()
    }
    console.log('subscribing to events')
    client.subscribe('configUpdated', onConfigUpdated)
    client.subscribe('variableEvaluated:*', onVariableEvaluated)
    client.subscribe('variableUpdated:*', onVariableUpdated)

    return () => {
        console.log('unsubscribing to events')
        client.unsubscribe('configUpdated', onConfigUpdated)
        client.unsubscribe('variableEvaluated:*', onVariableEvaluated)
        client.unsubscribe('variableUpdated:*', onVariableUpdated)
    }
}

export type DebuggerIframeOptions = {
    position?: 'left' | 'right'
    debuggerUrl?: string
}

export const createIframe = (
    client: DevCycleClient,
    {
        position = 'right',
        debuggerUrl = 'https://debugger.devcycle.com',
    }: DebuggerIframeOptions = {},
): (() => void) => {
    const iframe = document.createElement('iframe')

    const updateIframeData = () => {
        clientData.current.config = client.config
        clientData.current.user = client.user
        synchronizeIframeUrl(client, iframe, position, debuggerUrl)
        console.log('posting message', clientData.current)
        iframe.contentWindow?.postMessage(
            {
                ...clientData.current,
                type: 'dvcDebuggerData',
            },
            debuggerUrl,
        )
    }

    const cleanup = setupClientSubscription(client, updateIframeData)

    const listener = (event: MessageEvent) => {
        if (event.origin === debuggerUrl) {
            console.log('Message received from iframe: ', event.data)
            if (
                event.data.type === 'DEVCYCLE_IDENTIFY_USER' &&
                event.data.user
            ) {
                client.identifyUser(event.data.user).then(() => {
                    updateIframeData()
                })
            } else if (event.data.type === 'DEVCYCLE_RESET_USER') {
                client.resetUser().then(() => {
                    updateIframeData()
                })
            } else if (event.data.type === 'DEVCYCLE_REFRESH') {
                updateIframeData()
            } else if (event.data.type === 'DEVCYCLE_TOGGLE_OVERLAY') {
                clientData.current.expanded = !clientData.current.expanded
                iframe.style.width = clientData.current.expanded
                    ? '500px'
                    : '80px'
                iframe.style.height = clientData.current.expanded
                    ? '700px'
                    : '80px'
                updateIframeData()
            }
        }
    }
    window.addEventListener('message', listener)

    const createIframeWhenReady = () => {
        client.onClientInitialized().then(() => {
            clientData.current.config = client.config
            clientData.current.user = client.user

            iframe.id = 'devcycle-debugger-iframe'
            synchronizeIframeUrl(client, iframe, position, debuggerUrl)
            iframe.style.width = '80px'
            iframe.style.height = '80px'
            iframe.style.position = 'fixed'
            iframe.style.bottom = '25px'
            if (position === 'left') {
                iframe.style.left = '25px'
            } else {
                iframe.style.right = '25px'
            }
            iframe.style.border = 'none'
            iframe.style.overflow = 'hidden'
            iframe.title = 'Devcycle Debugger'
            iframe.allow = 'clipboard-read; clipboard-write'
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
