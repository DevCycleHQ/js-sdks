const SDK_KEY =
    process.env.NEXT_PUBLIC_E2E_NEXTJS_CLIENT_KEY || '<DEVCYCLE_CLIENT_SDK_KEY>'
import { initializeDevCycle } from '@devcycle/js-client-sdk'

export default class HomeComponent extends HTMLElement {
    constructor() {
        super()
    }
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
              <span>JS Web Elements</span>
            </h1>
          </div>
          <div id="enabledVariableKey">
          <h1>
            <span>variable enabled-feature = </span>
            <span data-testid="variable-enabled">${enabledVariable}</span>
          </h1>
        </div>
          <div id="disabledVariableKey">
            <h1>
              <span>variable disabled-feature = </span>
              <span data-testid="variable-disabled">${disabledVariable}</span>
            </h1>
          </div>
          <div id="defaultVariableKey">
            <h1>
              <span>variable default-feature = </span>
              <span data-testid="variable-default">${defaultVariable}</span>
            </h1>
          </div>
`
    }
    connectedCallback(): void {
        this.updateInnerHTML()
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

const devcycleClient = initializeDevCycle(SDK_KEY, user, {
    enableEdgeDB: false,
    logLevel: 'error',
})
devcycleClient.onClientInitialized(() =>
    customElements.define('devcycle-root', HomeComponent),
)
