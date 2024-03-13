const SDK_KEY =
    process.env.NEXT_PUBLIC_E2E_NEXTJS_KEY || '<DEVCYCLE_CLIENT_SDK_KEY>'
export class AppElement extends HTMLElement {
    constructor() {
        super()
    }

    public static observedAttributes = []

    updateInnerHTML(): void {
        const enabledVariable = devcycleClient.variableValue(
            'enabled-feature',
            false,
        )

        const disabledVariable = devcycleClient.variableValue(
            'disabled-feature',
            true,
        )

        const defaultVariable = devcycleClient.variableValue(
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
    `
    }

    connectedCallback(): void {
        this.updateInnerHTML()
        devcycleClient.subscribe('configUpdated', () => {
            this.updateInnerHTML()
        })
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const devcycleClient = DevCycle.initializeDevCycle(SDK_KEY, user, {
    enableEdgeDB: false,
    logLevel: 'error',
})
devcycleClient.onClientInitialized(() =>
    customElements.define('devcycle-root', AppElement),
)
