# Config Metadata Implementation

This document describes the implementation of config metadata functionality for the Node.js SDK, based on the Java SDK implementation.

## Overview

The config metadata feature adds project information, environment details, and config versioning to the local SDK evaluation context, making it accessible to evaluation hooks for enhanced debugging and monitoring capabilities.

## Implementation Details

### New Data Models

#### ConfigMetadata
- **Location**: `src/models/ConfigMetadata.ts`
- **Purpose**: Stores configuration metadata including ETag, Last-Modified timestamp, and project/environment information
- **Key Methods**:
  - `fromConfigResponse()`: Creates metadata from HTTP headers and config response
  - `createDefault()`: Creates metadata with default values for testing/fallback
  - `toString()`: String representation for debugging

#### ProjectMetadata
- **Location**: `src/models/ProjectMetadata.ts`
- **Purpose**: Stores project information (ID and key)

#### EnvironmentMetadata
- **Location**: `src/models/EnvironmentMetadata.ts`
- **Purpose**: Stores environment information (ID and key)

### Updated Components

#### HookContext
- **Location**: `src/hooks/HookContext.ts`
- **Changes**:
  - Added `configMetadata: ConfigMetadata | null` parameter to constructor
  - Added `getConfigMetadata()` method to access metadata
  - Maintains backward compatibility with existing hook implementations

#### EvalHooksRunner
- **Location**: `src/hooks/EvalHooksRunner.ts`
- **Changes**:
  - Updated `runHooksForEvaluation()` to accept optional `configMetadata` parameter
  - Passes metadata to HookContext constructor
  - Maintains backward compatibility (metadata defaults to null)

#### DevCycleClient
- **Location**: `src/client.ts`
- **Changes**:
  - Added `getMetadata()` method to expose config metadata
  - Updated variable evaluation to pass metadata to hooks
  - Uses `ConfigManagerWrapper` to manage metadata

#### ConfigManagerWrapper
- **Location**: `src/models/ConfigManagerWrapper.ts`
- **Purpose**: Wrapper around `EnvironmentConfigManager` that adds metadata functionality
- **Key Features**:
  - Captures ETag and Last-Modified headers from config responses
  - Extracts project and environment data from config
  - Provides `getConfigMetadata()` method
  - Delegates all other operations to underlying config manager

## Usage

### Accessing Config Metadata

```typescript
import { DevCycleClient } from '@devcycle/nodejs-server-sdk'

const client = new DevCycleClient('your-sdk-key')
await client.onClientInitialized()

// Get current config metadata
const metadata = client.getMetadata()
if (metadata) {
    console.log('Project:', metadata.project.key)
    console.log('Environment:', metadata.environment.key)
    console.log('Config ETag:', metadata.configETag)
    console.log('Last Modified:', metadata.configLastModified)
}
```

### Using Metadata in Hooks

```typescript
import { EvalHook } from '@devcycle/nodejs-server-sdk'

const hook = new EvalHook(
    (context) => {
        // Access config metadata in before hook
        const metadata = context.getConfigMetadata()
        if (metadata) {
            console.log('Evaluating variable with config:', metadata.project.key)
        }
        return context
    },
    (context, variable) => {
        // Access config metadata in after hook
        const metadata = context.getConfigMetadata()
        if (metadata) {
            console.log('Variable evaluated with config version:', metadata.configETag)
        }
    },
    (context, variable) => {
        // Access config metadata in finally hook
        const metadata = context.getConfigMetadata()
        if (metadata) {
            console.log('Hook completed for environment:', metadata.environment.key)
        }
    },
    (context, error) => {
        // Access config metadata in error hook
        const metadata = context.getConfigMetadata()
        if (metadata) {
            console.error('Error in evaluation for project:', metadata.project.key)
        }
    }
)

client.addHook(hook)
```

## Testing

### Unit Tests
- **ConfigMetadata.test.ts**: Tests for ConfigMetadata class
- **HookContext.test.ts**: Tests for HookContext with metadata
- **EvalHooksRunner.test.ts**: Tests for EvalHooksRunner with metadata
- **client-metadata.test.ts**: Integration tests for client metadata functionality

### Test Coverage
- ✅ Metadata creation and validation
- ✅ Hook context metadata access
- ✅ Hook execution with metadata
- ✅ Client metadata exposure
- ✅ Null safety and error handling

## Backward Compatibility

The implementation maintains full backward compatibility:
- Existing hooks continue to work without modification
- Config metadata defaults to `null` when not provided
- All existing client methods remain unchanged
- No breaking changes to public APIs

## Local vs Cloud Distinction

- **Local SDK**: Config metadata is populated and accessible via `getMetadata()`
- **Cloud SDK**: Config metadata is `null` (maintains separation of concerns)

## Success Criteria

- ✅ Config metadata accessible via `client.getMetadata()`
- ✅ Metadata available in all evaluation hooks
- ✅ Local client populates metadata, cloud client uses null
- ✅ Robust error handling and null safety
- ✅ Comprehensive test coverage
- ✅ Backward compatibility maintained

## Future Enhancements

1. **Enhanced Logging**: Integrate metadata into structured logging
2. **Metrics**: Add metadata to performance metrics
3. **Debugging Tools**: Use metadata in debugging interfaces
4. **Configuration Validation**: Validate metadata consistency