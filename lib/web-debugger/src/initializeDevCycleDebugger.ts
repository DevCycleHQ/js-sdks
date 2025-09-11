import {
    DevCycleClient,
    DevCycleUser,
    DVCVariable,
} from '@devcycle/js-client-sdk'
import { BucketedUserConfig } from '@devcycle/types'

type NextClient = Omit<DevCycleClient, 'identifyUser' | 'resetUser'>

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
        allowIdentify: boolean
    }
}

const clientData: ClientData = {
    current: {
        liveEvents: [],
        loadCount: 0,
        expanded: false,
        allowIdentify: true,
    },
}

export type DebuggerIframeOptions = {
    position?: 'left' | 'right'
    debuggerUrl?: string
    debugLogs?: boolean
    shouldEnable?: boolean | (() => boolean)
    shouldEnableVariable?: string
    hasClientSideUser?: boolean
    size?: 'small' | 'large'
    offset?: string
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
    hasClientSideUser?: boolean
    client: DevCycleClient | NextClient
    size: string
    offset: string
    private debouncedUpdateIframeData: () => void

    constructor(
        client: DevCycleClient | NextClient,
        {
            position = 'right',
            debuggerUrl = 'https://debugger.devcycle.com',
            debugLogs = false,
            hasClientSideUser = true,
            size = 'large',
            offset = '25px',
        }: DebuggerIframeOptions = {},
    ) {
        this.client = client
        clientData.current.allowIdentify = 'identifyUser' in client
        this.hasClientSideUser = hasClientSideUser
        this.debuggerUrl = debuggerUrl
        this.position = position
        this.size = size
        this.debugLogs = debugLogs
        this.offset = offset
        this.mainIframe = document.createElement('iframe')
        this.buttonIframe = document.createElement('iframe')
        this.debouncedUpdateIframeData = this.debounce(() => {
            this._updateIframeData()
        }, 300)
    }

    private debounce(func: () => void, delay: number) {
        let timeoutId: NodeJS.Timeout | null = null
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
            timeoutId = setTimeout(() => {
                func()
                timeoutId = null
            }, delay)
        }
    }

    createIframesWhenReady() {
        this.client.onClientInitialized().then(() => {
            clientData.current.config = this.client.config
            clientData.current.user = this.client.user
            this.createMainIframe()
            this.createButtonIframe()
        })
    }

    private _updateIframeData() {
        clientData.current.config = this.client.config
        clientData.current.user = this.client.user
        this.synchronizeIframeUrl()
        if (this.debugLogs) {
            this.log('posting message', clientData.current)
        }
        if (!clientData.current.loadCount) {
            // iframe hasn't loaded yet, don't post messages until it has
            return
        }
        this.mainIframe.contentWindow?.postMessage(
            {
                ...clientData.current,
                type: 'dvcDebuggerData',
            },
            this.debuggerUrl,
        )
    }

    updateIframeData() {
        this.debouncedUpdateIframeData()
    }

    setupSubscriptions() {
        const addEvent = (event: any) => {
            clientData.current.liveEvents.unshift(event)
            if (clientData.current.liveEvents.length > 200) {
                clientData.current.liveEvents.pop()
            }
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

        const boundMessageReceiver = this.iframeMessageReceiver.bind(this)

        window.addEventListener('message', boundMessageReceiver)

        return () => {
            this.log('unsubscribing from events')
            this.client.unsubscribe('configUpdated', onConfigUpdated)
            this.client.unsubscribe('variableEvaluated:*', onVariableEvaluated)
            this.client.unsubscribe('variableUpdated:*', onVariableUpdated)
            window.removeEventListener('message', boundMessageReceiver)
        }
    }

    createButtonIframe() {
        this.buttonIframe.id = 'devcycle-debugger-button-iframe'
        this.buttonIframe.style.width = this.size === 'small' ? '40px' : '80px'
        this.buttonIframe.style.height = this.size === 'small' ? '40px' : '80px'
        this.buttonIframe.style.position = 'fixed'
        this.buttonIframe.style.bottom = this.size === 'small' ? '10px' : '25px'
        if (this.position === 'left') {
            this.buttonIframe.style.left = this.offset
        } else {
            this.buttonIframe.style.right = this.offset
        }
        this.buttonIframe.style.zIndex = '100'
        this.buttonIframe.style.border = 'none'
        this.buttonIframe.style.overflow = 'hidden'
        this.buttonIframe.title = 'Devcycle Debugger'
        const searchParams = new URLSearchParams()
        searchParams.set('parentOrigin', window.location.origin)
        searchParams.set('position', this.position)
        searchParams.set('size', this.size)
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
                if ('identifyUser' in this.client && this.hasClientSideUser) {
                    this.client.identifyUser(event.data.user).then(() => {
                        this.updateIframeData()
                    })
                } else {
                    this.client.eventEmitter.emitDebugUserSet(event.data.user)
                }
            } else if (event.data.type === 'DEVCYCLE_RESET_USER') {
                if ('resetUser' in this.client) {
                    this.client.resetUser().then(() => {
                        this.updateIframeData()
                    })
                } else {
                    this.log(
                        'Unable to change user identity from debugger in Next.js',
                    )
                }
            } else if (
                event.data.type === 'DEVCYCLE_REVERT_TO_ORIGINAL_USER' &&
                event.data.user
            ) {
                if ('identifyUser' in this.client && this.hasClientSideUser) {
                    this.client.identifyUser(event.data.user).then(() => {
                        this.updateIframeData()
                    })
                } else {
                    this.client.eventEmitter.emitDebugUserReverted(
                        event.data.user,
                    )
                }
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

export const checkShouldEnable = async (
    client: DevCycleClient | NextClient,
    {
        shouldEnable,
        shouldEnableVariable,
    }: Pick<DebuggerIframeOptions, 'shouldEnable' | 'shouldEnableVariable'>,
): Promise<boolean> => {
    if (typeof shouldEnable !== 'undefined') {
        if (
            !shouldEnable ||
            (typeof shouldEnable === 'function' && !shouldEnable())
        ) {
            return false
        }
    } else if (typeof shouldEnableVariable === 'string') {
        await client.onClientInitialized()
        if (!client.variableValue(shouldEnableVariable, false)) {
            return false
        }
    } else if (!defaultEnabledCheck()) {
        return false
    }
    return true
}

export const initializeDevCycleDebugger = async (
    client: DevCycleClient | NextClient,
    {
        shouldEnable,
        shouldEnableVariable,
        ...options
    }: DebuggerIframeOptions = {},
): Promise<() => void> => {
    if (
        !(await checkShouldEnable(client, {
            shouldEnable,
            shouldEnableVariable,
        }))
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
        if (document.body.contains(iframeManager.mainIframe)) {
            document.body.removeChild(iframeManager.mainIframe)
        }
        if (document.body.contains(iframeManager.buttonIframe)) {
            document.body.removeChild(iframeManager.buttonIframe)
        }
    }
}
