const SDK_KEY =
    process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY || '<DEVCYCLE_CLIENT_SDK_KEY>'
console.log('[E2E JS-CDN] SDK_KEY being used:', SDK_KEY)

export class AppElement extends HTMLElement {
    constructor() {
        super()
    }

    public static observedAttributes = []

    updateInnerHTML(): void {
        if (!window.devcycleClient) {
            console.error(
                '[E2E JS-CDN] devcycleClient not initialized in updateInnerHTML',
            )
            this.innerHTML = '<p>Error: Devcycle Client not initialized</p>'
            return
        }
        const enabledVariable = window.devcycleClient.variableValue(
            'enabled-feature',
            false,
        )
        const disabledVariable = window.devcycleClient.variableValue(
            'disabled-feature',
            true,
        )
        const defaultVariable = window.devcycleClient.variableValue(
            'default-feature',
            true,
        )
        this.innerHTML = `
          <div class="wrapper">
            <div class="container">
              <!--  WELCOME  -->
              <div id="welcome">
                <h1>
                  <span> Hello there </span>
                </h1>
              </div>
              <div id="variableKey">
                <h1>
                  <span> JS Web Elements</span>
                </h1>
              </div>
              <div id="enabledVariableKey">
              <h1>
                <span>variable enabled-feature = </span>
                ${enabledVariable}
              </h1>
            </div>
              <div id="disabledVariableKey">
                <h1>
                  <span>variable disabled-feature = </span>
                  ${disabledVariable}
                </h1>
              </div>
              <div id="defaultVariableKey">
                <h1>
                  <span>variable default-feature = </span>
                  ${defaultVariable}
                </h1>
              </div>
            </div>
          </div>`
    }

    connectedCallback(): void {
        if (window.devcycleClient && window.devcycleClient.isInitialized) {
            this.updateInnerHTML()
        }
        if (window.devcycleClient) {
            window.devcycleClient.subscribe('configUpdated', () => {
                this.updateInnerHTML()
            })
        } else {
            console.error(
                '[E2E JS-CDN] devcycleClient not available for configUpdated subscription',
            )
        }
    }
}

const user = {
    user_id: 'userId1',
    email: 'auto@taplytics.com',
    customData: {
        cps: 'Matthew',
        cpn: 777,
        cpb: true,
    },
    isAnonymous: false,
}

declare global {
    interface Window {
        devcycleClient: any
    }
}

try {
    console.log('[E2E JS-CDN] Attempting to initialize DevCycle SDK...')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.devcycleClient = DevCycle.initializeDevCycle(SDK_KEY, user, {
        enableEdgeDB: false,
        logLevel: 'debug',
        eventFlushIntervalMS: 1000,
        deferInitialization: false,
    })
    console.log('[E2E JS-CDN] DevCycle.initializeDevCycle called successfully.')

    window.devcycleClient.on('error', (error: Error) => {
        console.error('[E2E JS-CDN] DevCycle SDK Error Event:', error)
    })

    window.devcycleClient.onClientInitialized((error?: Error | null) => {
        if (error) {
            console.error(
                '[E2E JS-CDN] onClientInitialized callback with error:',
                error,
            )
            const appRoot = document.querySelector('devcycle-root')
            if (appRoot) {
                appRoot.innerHTML =
                    '<p>DevCycle SDK Initialization Error. Check console.</p>'
            }
            return
        }
        console.log(
            '[E2E JS-CDN] onClientInitialized callback successful. Defining custom element.',
        )
        if (!customElements.get('devcycle-root')) {
            customElements.define('devcycle-root', AppElement)
        } else {
            console.log(
                '[E2E JS-CDN] devcycle-root already defined. Forcing update.',
            )
            const appRoot = document.querySelector(
                'devcycle-root',
            ) as AppElement
            if (appRoot && typeof appRoot.updateInnerHTML === 'function') {
                appRoot.updateInnerHTML()
            }
        }
    })
} catch (e: any) {
    console.error('[E2E JS-CDN] Critical error during DevCycle SDK setup:', e)
    const appRoot = document.querySelector('devcycle-root')
    if (appRoot) {
        appRoot.innerHTML =
            '<p>Critical Error Initializing DevCycle. Check console.</p>'
    }
}
