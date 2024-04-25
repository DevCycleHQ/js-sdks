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

export type DebuggerIframeOptions = {
    position?: 'left' | 'right'
    debuggerUrl?: string
    debugLogs?: boolean
    shouldEnable?: boolean | (() => boolean)
    shouldEnableVariable?: string
}

const defaultEnabledCheck = () => {
    return process.env['NODE_ENV'] === 'development'
}

class IframeManager {
    mainIframe: HTMLIFrameElement
    buttonIframe: HTMLIFrameElement
    debuggerUrl: string
    position: string
    debugLogs: boolean
    client: DevCycleClient

    constructor(
        client: DevCycleClient,
        {
            position = 'right',
            debuggerUrl = 'https://debugger.devcycle.com',
            debugLogs = false,
        }: DebuggerIframeOptions = {},
    ) {
        this.client = client
        this.debuggerUrl = debuggerUrl
        this.position = position
        this.debugLogs = debugLogs
        this.mainIframe = document.createElement('iframe')
        this.buttonIframe = document.createElement('iframe')
    }

    createIframesWhenReady() {
        this.client.onClientInitialized().then(() => {
            clientData.current.config = this.client.config
            clientData.current.user = this.client.user
            this.createMainIframe()
            this.createButtonIframe()
        })
    }

    updateIframeData() {
        clientData.current.config = this.client.config
        clientData.current.user = this.client.user
        this.synchronizeIframeUrl()
        if (this.debugLogs) {
            this.log('posting message', clientData.current)
        }
        this.mainIframe.contentWindow?.postMessage(
            {
                ...clientData.current,
                type: 'dvcDebuggerData',
            },
            this.debuggerUrl,
        )
    }

    setupSubscriptions() {
        const addEvent = (event: any) => {
            clientData.current.liveEvents.unshift(event)
        }

        const onConfigUpdated = () => {
            clientData.current.config = this.client.config
            clientData.current.user = this.client.user
            addEvent({ type: 'configUpdated', date: Date.now() })
            this.updateIframeData()
        }
        const onVariableEvaluated = (
            key: string,
            variable: DVCVariable<any>,
        ) => {
            addEvent({
                type: 'variableEvaluated',
                key,
                variable: { ...variable },
                date: Date.now(),
            })
            this.updateIframeData()
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
            this.updateIframeData()
        }
        this.log('subscribing to events')
        this.client.subscribe('configUpdated', onConfigUpdated)
        this.client.subscribe('variableEvaluated:*', onVariableEvaluated)
        this.client.subscribe('variableUpdated:*', onVariableUpdated)

        // wrap the original track method in a new method that can monitor and forward the events to the debugger
        const oldTrack = this.client.track.bind(this.client)
        this.client.track = (...args) => {
            const [event] = args
            addEvent({
                type: event.type,
                target: event.target,
                value: event.value,
                date: Date.now(),
            })
            this.updateIframeData()
            oldTrack(...args)
        }

        window.addEventListener(
            'message',
            this.iframeMessageReceiver.bind(this),
        )

        return () => {
            this.log('unsubscribing from events')
            this.client.unsubscribe('configUpdated', onConfigUpdated)
            this.client.unsubscribe('variableEvaluated:*', onVariableEvaluated)
            this.client.unsubscribe('variableUpdated:*', onVariableUpdated)
            window.removeEventListener(
                'message',
                this.iframeMessageReceiver.bind(this),
            )
        }
    }

    createButtonIframe() {
        this.buttonIframe.id = 'devcycle-debugger-button-iframe'
        this.buttonIframe.style.width = '80px'
        this.buttonIframe.style.height = '80px'
        this.buttonIframe.style.position = 'fixed'
        this.buttonIframe.style.bottom = '25px'
        if (this.position === 'left') {
            this.buttonIframe.style.left = '25px'
        } else {
            this.buttonIframe.style.right = '25px'
        }
        this.buttonIframe.style.zIndex = '100'
        this.buttonIframe.style.border = 'none'
        this.buttonIframe.style.overflow = 'hidden'
        this.buttonIframe.title = 'Devcycle Debugger'
        const searchParams = new URLSearchParams()
        searchParams.set('parentOrigin', window.location.origin)
        searchParams.set('position', this.position)
        this.buttonIframe.src = `${
            this.debuggerUrl
        }/button?${searchParams.toString()}`

        document.body.appendChild(this.buttonIframe)
    }

    createMainIframe() {
        this.mainIframe.id = 'devcycle-debugger-iframe'
        this.synchronizeIframeUrl()
        this.mainIframe.style.width = '0px'
        this.mainIframe.style.height = '0px'
        this.mainIframe.style.position = 'fixed'
        this.mainIframe.style.bottom = '25px'
        if (this.position === 'left') {
            this.mainIframe.style.left = '25px'
        } else {
            this.mainIframe.style.right = '25px'
        }
        this.mainIframe.style.border = 'none'
        this.mainIframe.style.overflow = 'hidden'
        this.mainIframe.title = 'Devcycle Debugger'
        this.mainIframe.allow = 'clipboard-read; clipboard-write'
        this.mainIframe.onload = () => {
            clientData.current.loadCount += 1
        }
        document.body.appendChild(this.mainIframe)
    }

    synchronizeIframeUrl() {
        const searchParams = new URLSearchParams()
        searchParams.set('parentOrigin', window.location.origin)
        searchParams.set('position', this.position)
        const url = `${this.debuggerUrl}/${
            this.client.config!.project.a0_organization
        }/${this.client.config!.project._id}/${
            this.client.config!.environment._id
        }?${searchParams.toString()}`
        if (url !== this.mainIframe.src) {
            this.mainIframe.src = url
        }
    }

    iframeMessageReceiver(event: MessageEvent) {
        if (event.origin === this.debuggerUrl) {
            this.log('Message received from iframe: ', event.data)
            if (
                event.data.type === 'DEVCYCLE_IDENTIFY_USER' &&
                event.data.user
            ) {
                this.client.identifyUser(event.data.user).then(() => {
                    this.updateIframeData()
                })
            } else if (event.data.type === 'DEVCYCLE_RESET_USER') {
                this.client.resetUser().then(() => {
                    this.updateIframeData()
                })
            } else if (event.data.type === 'DEVCYCLE_REFRESH') {
                this.updateIframeData()
            } else if (event.data.type === 'DEVCYCLE_TOGGLE_OVERLAY') {
                clientData.current.expanded = !clientData.current.expanded
                this.mainIframe.style.width = clientData.current.expanded
                    ? '500px'
                    : '0px'
                this.mainIframe.style.height = clientData.current.expanded
                    ? '700px'
                    : '0px'
                setTimeout(() => this.updateIframeData(), 10)
            }
        }
    }

    log(...args: any[]) {
        if (this.debugLogs) {
            console.log(...args)
        }
    }
}

export const initializeDevCycleDebugger = async (
    client: DevCycleClient,
    {
        shouldEnable = defaultEnabledCheck,
        shouldEnableVariable,
        ...options
    }: DebuggerIframeOptions = {},
): Promise<() => void> => {
    if (shouldEnableVariable) {
        await client.onClientInitialized()
        if (!client.variableValue(shouldEnableVariable, false)) {
            return () => {
                // no-op
            }
        }
    } else if (
        !shouldEnable ||
        (typeof shouldEnable === 'function' && !shouldEnable())
    ) {
        return () => {
            // no-op
        }
    }

    const iframeManager = new IframeManager(client, options)

    if (
        document.readyState === 'complete' ||
        document.readyState === 'interactive'
    ) {
        iframeManager.createIframesWhenReady()
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            iframeManager.createIframesWhenReady()
        })
    }

    const cleanup = iframeManager.setupSubscriptions()

    return () => {
        cleanup()
        document.body.removeChild(iframeManager.mainIframe)
        document.body.removeChild(iframeManager.buttonIframe)
    }
}
