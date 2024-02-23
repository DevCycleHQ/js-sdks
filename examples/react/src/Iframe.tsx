import { DVCVariable, useDevCycleClient } from '@devcycle/react-client-sdk'
import { useEffect, useRef, useState } from 'react'
import Togglebot from './togglebot.svg'

type LiveEvent = {
    type: string
    key?: string
    variable?: DVCVariable<any> | null
}

const useDevCycleClientData = () => {
    const client = useDevCycleClient()
    const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([])
    const [_, triggerRerender] = useState({})

    useEffect(() => {
        const onConfigUpdated = () => {
            setLiveEvents((liveEvents) => [
                { type: 'configUpdated', date: Date.now() },
                ...liveEvents,
            ])
        }
        const onVariableEvaluated = (
            key: string,
            variable: DVCVariable<any>,
        ) => {
            setLiveEvents((liveEvents) => [
                {
                    type: 'variableEvaluated',
                    key,
                    variable: { ...variable },
                    date: Date.now(),
                },
                ...liveEvents,
            ])
        }
        const onVariableUpdated = (
            key: string,
            variable: DVCVariable<any> | null,
        ) => {
            setLiveEvents((liveEvents) => [
                {
                    type: 'variableUpdated',
                    key,
                    variable: variable ? { ...variable } : null,
                    date: Date.now(),
                },
                ...liveEvents.slice(0, 100),
            ])
        }
        client.subscribe('configUpdated', onConfigUpdated)
        client.subscribe('variableEvaluated:*', onVariableEvaluated)
        client.subscribe('variableUpdated:*', onVariableUpdated)

        return () => {
            client.unsubscribe('configUpdated', onConfigUpdated)
            client.unsubscribe('variableEvaluated:*', onVariableEvaluated)
        }
    }, [client])

    return {
        liveEvents,
        config: client.config,
        user: client.user,
    }
}

export const Iframe = () => {
    const data = useDevCycleClientData()
    const client = useDevCycleClient()
    const ref = useRef<HTMLIFrameElement>(null)
    const [loadCount, setLoadCount] = useState(0)
    const [showIframe, setShowIframe] = useState(true)

    useEffect(() => {
        const listener = (event: MessageEvent) => {
            if (event.origin === 'http://localhost:4201') {
                console.log('Message received from iframe: ', event.data)
                if (
                    event.data.type === 'DEVCYCLE_IDENTIFY_USER' &&
                    event.data.user
                ) {
                    void client.identifyUser(event.data.user)
                } else if (event.data.type === 'DEVCYCLE_RESET_USER') {
                    void client.resetUser()
                }
            }
        }
        window.addEventListener('message', listener)

        return () => {
            window.removeEventListener('message', listener)
        }
    }, [client])

    useEffect(() => {
        if (!loadCount) return
        console.log('POSTING MESSAGE!', ref.current, data)
        const postMessage = () => {
            ref.current?.contentWindow?.postMessage(
                {
                    ...data,
                    type: 'dvcDebuggerData',
                },
                'http://localhost:4201',
            )
        }
        try {
            setTimeout(postMessage)
        } catch (e) {
            console.log('ERROR', e)
            setTimeout(postMessage, 1000)
        }
    }, [data, loadCount])

    if (!data.config || !data.user) {
        return null
    }

    const searchParams = new URLSearchParams()
    searchParams.set('project_id', data.config.project._id)
    searchParams.set('org_id', data.config.project.a0_organization)
    searchParams.set('user_id', data.user.user_id)
    searchParams.set('environment_id', data.config.environment._id)
    searchParams.set('parentOrigin', window.location.origin)

    return (
        <div style={{ position: 'absolute', bottom: '50px', right: '50px' }}>
            <div
                style={{
                    backgroundColor: '#1d49f4',
                    borderRadius: '50%',
                    boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.2)',
                    width: '100px',
                    height: '100px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    color: 'white',
                }}
                onClick={() => setShowIframe((showIframe) => !showIframe)}
            >
                <img src={Togglebot} style={{ width: '75px' }} />
            </div>
            <iframe
                id={'devcycle-debugger-iframe'}
                src={`http://localhost:4201?${searchParams.toString()}`}
                style={{
                    width: '400px',
                    height: '600px',
                    visibility: showIframe ? 'visible' : 'hidden',
                    position: 'absolute',
                    transform: 'translate(-100%, -120%)',
                    border: 'none',
                    overflow: 'hidden',
                }}
                ref={ref}
                onLoad={() => setLoadCount((prev) => prev + 1)}
                title={'Devcycle Debugger'}
            />
        </div>
    )
}
