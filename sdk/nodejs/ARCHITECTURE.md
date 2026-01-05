# DevCycle Node.js Server SDK - Architecture & API Diagrams (Local Bucketing)

This document provides visual diagrams describing the functionality of each public-facing function in the DevCycle Node.js Server SDK using **Local Bucketing** mode (the default).

Local Bucketing uses a WebAssembly library to evaluate flags locally. Configuration is fetched from the DevCycle CDN and cached. All evaluations are synchronous.

For Cloud Bucketing mode documentation, see [ARCHITECTURE-CLOUD.md](./ARCHITECTURE-CLOUD.md).

## Table of Contents

1. [Initialization](#initialization)
   - [initializeDevCycle](#initializedevcyclesdkkey-options)
   - [onClientInitialized](#onclientinitializedcallback)
2. [Variable Evaluation](#variable-evaluation)
   - [variable](#variableuser-key-defaultvalue)
   - [variableValue](#variablevalueuser-key-defaultvalue)
3. [Data Retrieval](#data-retrieval)
   - [allVariables](#allvariablesuser)
   - [allFeatures](#allfeaturesuser)
4. [Event Tracking](#event-tracking)
   - [track](#trackuser-event)
   - [flushEvents](#flusheventscallback)
5. [Hooks](#hooks)
   - [addHook](#addhookhook)
6. [Client Bootstrapping](#client-bootstrapping)
   - [getClientBootstrapConfig](#getclientbootstrapconfiguser-useragent)
7. [Custom Data](#custom-data)
   - [setClientCustomData](#setclientcustomdatacustomdata)
8. [Lifecycle](#lifecycle)
   - [close](#close)

---

## Initialization

### `initializeDevCycle(sdkKey, options)`

Creates and returns a `DevCycleClient` for local bucketing. The client initializes asynchronously by fetching configuration from the DevCycle CDN.

```mermaid
sequenceDiagram
    participant App
    participant Init as initializeDevCycle
    participant Client as DevCycleClient
    participant WASM as Bucketing Library
    participant CDN as DevCycle CDN

    App->>Init: initializeDevCycle(sdkKey, options)
    Init->>Client: new DevCycleClient(sdkKey, options)
    Client->>WASM: Import WASM bucketing library
    Client->>CDN: Fetch project config
    CDN-->>Client: Project config
    Client->>WASM: Load config into WASM
    Client-->>App: DevCycleClient
```

---

### `onClientInitialized(callback?)`

Wait for the SDK to finish initializing. The client fetches configuration from the CDN before it's ready.

```mermaid
flowchart TD
    A[onClientInitialized] --> B{Callback provided?}
    B -->|Yes| C[Execute callback when ready]
    B -->|No| D[Return Promise]
    C --> E[callback err?]
    D --> F[Resolves with DevCycleClient]
```

---

## Variable Evaluation

### `variable(user, key, defaultValue)`

Get a variable object for a feature flag. Returns a `DVCVariable` instance containing the value and evaluation metadata. Evaluations are **synchronous** using the WASM bucketing library.

```mermaid
flowchart TD
    A[variable user, key, defaultValue] --> B{Config loaded?}
    B -->|No| C[Log warning<br/>Return DVCVariable with default]
    B -->|Yes| D[Populate user with platform data]
    D --> E[WASM: variableForUser_PB]
    E --> F{Variable found?}
    F -->|Yes| G{Type matches?}
    F -->|No| H[Return DVCVariable with default]
    G -->|Yes| I[Return DVCVariable with config value]
    G -->|No| J[Log type mismatch error]
    J --> H
```

---

### `variableValue(user, key, defaultValue)`

Get the value of a variable directly. Convenience method that calls `variable()` and returns just the value.

```mermaid
flowchart TD
    A[variableValue user, key, defaultValue] --> B[Call variable user, key, defaultValue]
    B --> C[Get DVCVariable instance]
    C --> D[Return variable.value]
```

---

## Data Retrieval

### `allVariables(user)`

Get all variables for a user. Returns an object mapping variable keys to variable data.

```mermaid
flowchart TD
    A[allVariables user] --> B{Config loaded?}
    B -->|No| C[Log warning<br/>Return empty object]
    B -->|Yes| D[Populate user with platform data]
    D --> E[WASM: bucketUserForConfig]
    E --> F[Return config.variables]
```

---

### `allFeatures(user)`

Get all features for a user. Returns an object mapping feature keys to feature data.

```mermaid
flowchart TD
    A[allFeatures user] --> B{Config loaded?}
    B -->|No| C[Log warning<br/>Return empty object]
    B -->|Yes| D[Populate user with platform data]
    D --> E[WASM: bucketUserForConfig]
    E --> F[Return config.features]
```

---

## Event Tracking

### `track(user, event)`

Track a custom event. Events are queued and batched for efficient delivery.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant Queue as EventQueue

    App->>Client: track(user, event)
    Client->>Client: Validate event.type
    
    alt Not initialized
        Client-->>App: Log warning, return
    end
    
    Client->>Client: Populate user with platform data
    Client->>Queue: queueEvent(user, event)
    Note over Queue: Event added to batch<br/>Flushed on interval or manually
```

---

### `flushEvents(callback?)`

Manually flush all queued events to DevCycle. Useful before process exit or when immediate delivery is needed.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant Queue as EventQueue
    participant API as DevCycle API

    App->>Client: flushEvents()
    Client->>Queue: flushEvents()
    Queue->>API: POST /v1/events (batched)
    API-->>Queue: Acknowledged
    Queue-->>Client: Complete
    Client-->>App: Promise resolved
```

---

## Hooks

### `addHook(hook)`

Add an evaluation hook that runs before and/or after variable evaluations. Hooks can be used for logging, analytics, or custom processing.

```mermaid
flowchart TD
    A[addHook hook] --> B[EvalHooksRunner.enqueue]
    B --> C[Hook stored in runner]
    
    D[variable called] --> E[Run beforeEvaluate hooks]
    E --> F[Evaluate variable]
    F --> G[Run afterEvaluate hooks]
```

---

## Client Bootstrapping

### `getClientBootstrapConfig(user, userAgent)`

Generate a configuration object suitable for bootstrapping a client-side SDK. This enables server-side rendering scenarios where the server provides initial flag values to the client.

Requires `enableClientBootstrapping: true` in initialization options.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant WASM as Bucketing Library

    App->>Client: getClientBootstrapConfig(user, userAgent)
    Client->>Client: await onInitialized
    
    alt enableClientBootstrapping not set
        Client-->>App: Throw Error
    end
    
    Client->>WASM: getSDKKeyFromConfig (get client SDK key)
    WASM-->>Client: clientSDKKey
    
    alt No client SDK key found
        Client-->>App: Throw Error
    end
    
    Client->>Client: Generate client populated user
    Client->>WASM: bucketUserForConfig (using client config)
    WASM-->>Client: BucketedUserConfig
    Client-->>App: BucketedUserConfig + clientSDKKey
```

---

## Custom Data

### `setClientCustomData(customData)`

Set custom data that will be used for all subsequent bucketing operations. Useful for setting global context that applies to all users.

```mermaid
flowchart TD
    A[setClientCustomData customData] --> B{Bucketing lib loaded?}
    B -->|No| C[Return silently]
    B -->|Yes| D[bucketingLib.setClientCustomData]
    D --> E[Custom data stored in WASM<br/>Used for all evaluations]
```

---

## Lifecycle

### `close()`

Close the SDK client. Flushes pending events, stops config polling, and cleans up resources. Should be called before process exit.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant Config as ConfigManager
    participant Queue as EventQueue

    App->>Client: close()
    Client->>Client: await onInitialized
    Client->>Queue: flushEvents()
    Queue-->>Client: Events flushed
    Client->>Config: cleanup()
    Note over Config: Stop polling<br/>Close SSE connection
    Client->>Queue: cleanup()
    Note over Queue: Stop flush interval
    Client->>Client: Clear bucketing tracker interval
    Client-->>App: Promise resolved
```

---

## Additional Notes

### Error Handling Summary

| Function | Consumer-Relevant Error Scenarios |
|----------|-----------------------------------|
| `initializeDevCycle` | Invalid SDK key throws `Error`. |
| `variable` | Returns default value if config not loaded or type mismatch (does not throw). |
| `allVariables` / `allFeatures` | Returns empty object if config not loaded (does not throw). |
| `track` | Logs warning if not initialized (does not throw). |
| `getClientBootstrapConfig` | Throws if `enableClientBootstrapping` option not set. |
