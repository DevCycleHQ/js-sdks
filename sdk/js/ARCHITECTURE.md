# DevCycle JS Client SDK - Architecture & API Diagrams

This document provides visual diagrams describing the functionality of each public-facing function in the DevCycle JS Client SDK.

## Table of Contents

1. [Initialization](#initialization)
   - [initializeDevCycle](#initializedevcyclesdkkey-user-options)
   - [onClientInitialized](#onclientinitializedcallback)
2. [Variable Evaluation](#variable-evaluation)
   - [variable](#variablekey-defaultvalue)
   - [variableValue](#variablevaluekey-defaultvalue)
3. [User Management](#user-management)
   - [identifyUser](#identifyuseruser-callback)
   - [resetUser](#resetusercallback)
4. [Data Retrieval](#data-retrieval)
   - [allFeatures](#allfeatures)
   - [allVariables](#allvariables)
5. [Event Tracking](#event-tracking)
   - [track](#trackevent)
   - [flushEvents](#flusheventscallback)
6. [Event Subscription](#event-subscription)
   - [subscribe](#subscribekey-handler)
   - [unsubscribe](#unsubscribekey-handler)
7. [Hooks](#hooks)
   - [addHook](#addhookhook)
   - [clearHooks](#clearhooks)
8. [Lifecycle](#lifecycle)
   - [close](#close)
9. [DVCVariable Class](#dvcvariable-class)
   - [onUpdate](#onupdatecallback)

---

## Initialization

### `initializeDevCycle(sdkKey, user, options)`

Primary function to initialize the DevCycle SDK. Creates and returns a `DevCycleClient` instance that can be used to evaluate feature flags and track events.

```mermaid
sequenceDiagram
    participant App
    participant SDK as DevCycleClient
    participant Cache as CacheStore
    participant API as DevCycle API
    participant SSE as Streaming Connection

    App->>SDK: initializeDevCycle(sdkKey, user, options)
    SDK->>Cache: Load cached config
    Cache-->>SDK: Cached config (if available)
    SDK->>API: Fetch latest config
    API-->>SDK: Bucketed config
    SDK->>SSE: Establish real-time connection
    SDK-->>App: DevCycleClient (ready)
```

---

### `onClientInitialized(callback?)`

Wait for the SDK to finish initializing. Can be used with either a callback or as a Promise.

```mermaid
flowchart TD
    A[onClientInitialized] --> B{Callback provided?}
    B -->|Yes| C[Execute callback when ready]
    B -->|No| D[Return Promise]
    C --> E[callback error, client]
    D --> F[Resolves with DevCycleClient]
```

---

## Variable Evaluation

### `variable(key, defaultValue)`

Get a variable object for a feature flag. Returns a `DVCVariable` instance that contains the current value and supports reactive updates via `onUpdate()`.

```mermaid
flowchart TD
    A[variable key, defaultValue] --> B{Config has variable?}
    B -->|Yes| C{Type matches?}
    B -->|No| E[Return DVCVariable with default]
    C -->|Yes| D[Return DVCVariable with config value]
    C -->|No| F[Log type mismatch warning]
    F --> E
```

---

### `variableValue(key, defaultValue)`

Get the value of a variable directly. This is a convenience method that calls `variable()` and returns just the value.

```mermaid
flowchart TD
    A[variableValue key, defaultValue] --> B[Call variable key, defaultValue]
    B --> C[Get DVCVariable instance]
    C --> D[Return variable.value]
```

---

## User Management

### `identifyUser(user, callback?)`

Update the current user or identify a new user. This triggers a config refresh from the DevCycle API.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant API as DevCycle API

    App->>Client: identifyUser(user)
    Client->>Client: Flush pending events
    Client->>API: Fetch config for new user
    API-->>Client: Updated config
    Client-->>App: Updated variables
```

---

### `resetUser(callback?)`

Reset the current user to an anonymous user. Generates a new anonymous ID and fetches fresh config.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant Store as CacheStore
    participant API as DevCycle API

    App->>Client: resetUser()
    Client->>Client: Flush pending events
    Client->>Store: Remove old anonymous ID
    Client->>Client: Create new anonymous user
    Client->>API: Fetch config for new user
    API-->>Client: Updated config
    Client-->>App: Updated variables
```

---

## Data Retrieval

### `allFeatures()`

Get all features for the current user. Returns an object mapping feature keys to feature data.

```mermaid
flowchart TD
    A[allFeatures] --> B{Config loaded?}
    B -->|Yes| C[Return config.features]
    B -->|No| D[Return empty object]
```

---

### `allVariables()`

Get all variables for the current user. Returns an object mapping variable keys to variable data.

```mermaid
flowchart TD
    A[allVariables] --> B{Config loaded?}
    B -->|Yes| C[Return config.variables]
    B -->|No| D[Return empty object]
```

---

## Event Tracking

### `track(event)`

Track a custom event. Events are queued and sent to DevCycle in batches.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant Queue as EventQueue

    App->>Client: track(event)
    Client->>Client: Validate event.type
    Client->>Queue: queueEvent(event)
    Note over Queue: Event added to batch
```

---

### `flushEvents(callback?)`

Manually flush all queued events to DevCycle. Useful before page unload or when immediate delivery is needed.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant Queue as EventQueue
    participant API as DevCycle API

    App->>Client: flushEvents()
    Client->>Queue: flushEvents()
    Queue->>API: POST /v1/events
    API-->>Queue: Acknowledged
    Queue-->>Client: Complete
    Client-->>App: Promise resolved
```

---

## Event Subscription

### `subscribe(key, handler)`

Subscribe to SDK events. The handler is called whenever the specified event is emitted.

```mermaid
flowchart TD
    A[subscribe key, handler] --> B{Event Type}
    B --> C[initialized]
    B --> D[error]
    B --> E[configUpdated]
    B --> F[variableUpdated:*]
    B --> G[featureUpdated:*]
    B --> H[variableEvaluated:*]
    
    C --> I[handler success: boolean]
    D --> J[handler error: Error]
    E --> K[handler variables: DVCVariableSet]
    F --> L[handler key, variable]
    G --> M[handler key, feature]
    H --> N[handler key, variable]
```

---

### `unsubscribe(key, handler?)`

Remove an event subscription. If no handler is provided, removes all handlers for the given key.

```mermaid
flowchart TD
    A[unsubscribe key, handler?] --> B{Handler provided?}
    B -->|Yes| C[Remove specific handler]
    B -->|No| D[Remove all handlers for key]
    C --> E[EventEmitter.unsubscribe]
    D --> E
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

### `clearHooks()`

Remove all registered evaluation hooks.

```mermaid
flowchart TD
    A[clearHooks] --> B[EvalHooksRunner.clear]
    B --> C[All hooks removed]
```

---

## Lifecycle

### `close()`

Close the SDK client. Flushes pending events, closes connections, and removes event listeners. Call this when the client is no longer needed.

```mermaid
sequenceDiagram
    participant App
    participant Client as DevCycleClient
    participant SSE as StreamingConnection
    participant Queue as EventQueue

    App->>Client: close()
    Client->>Client: Set closing = true
    Client->>Client: Remove event listeners
    Client->>SSE: close()
    Client->>Queue: close()
    Note over Queue: Flush remaining events
    Client-->>App: Promise resolved
```

---

## DVCVariable Class

### `onUpdate(callback)`

Register a callback that is called whenever the variable's value changes due to a config update.

```mermaid
flowchart TD
    A[variable.onUpdate callback] --> B[Store callback on variable]
    B --> C[Return variable for chaining]
    
    D[Config update received] --> E{Variable value changed?}
    E -->|Yes| F[Call stored callback with new value]
    E -->|No| G[No action]
```

---

## Additional Notes

### Error Handling Summary

| Function | Consumer-Relevant Error Scenarios |
|----------|-----------------------------------|
| `initializeDevCycle` | Invalid SDK key throws `UserError`. Missing user throws `Error`. |
| `identifyUser` | Config fetch failure falls back to cached config if available, otherwise throws. |
| `resetUser` | Config fetch failure rolls back to previous anonymous ID and throws. |
| `variable` | Type mismatch logs warning and returns default value (does not throw). |

### Real-time Updates

The SDK establishes a Server-Sent Events (SSE) connection after initialization to receive real-time config updates. This connection:
- Automatically reconnects when the page becomes visible
- Closes after a period of inactivity when the page is hidden
- Can be disabled via `options.disableRealtimeUpdates`
