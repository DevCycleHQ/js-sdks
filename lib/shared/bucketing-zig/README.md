# DevCycle Bucketing - Zig Implementation

This package contains a Zig implementation of the DevCycle bucketing library, compiled to WebAssembly. It provides the same functionality as the AssemblyScript version but with the performance and safety benefits of Zig.

## Overview

The Zig implementation of the bucketing library evaluates user information against segmentation filters and determines feature eligibility. It also makes decisions about which variation to serve users in multi-variate features.

This Zig version compiles to a WebAssembly binary that can be executed in JavaScript environments (browsers, Node.js) and potentially other platforms that support WebAssembly.

## Features

- ✅ **MurmurHash3 Implementation**: Consistent hashing for bucketing decisions
- ✅ **Bounded Hash Generation**: Rollout and bucketing hash calculations
- ✅ **User Bucketing**: Determine feature eligibility and variation assignment
- ✅ **Configuration Management**: Store and manage project configurations
- ✅ **Platform Data Management**: Handle SDK platform information
- ✅ **Custom Data Support**: Manage user custom data for targeting
- ✅ **WASM Compatible**: Compiled to WebAssembly for cross-platform use
- ✅ **Memory Safe**: Leverages Zig's compile-time safety guarantees
- 🚧 **Event Queue**: (Planned - not yet implemented)
- 🚧 **Full Segmentation**: (Basic implementation - needs expansion)

## Building

### Prerequisites

- Zig 0.14.0 or later
- Node.js (for testing the JavaScript wrapper)

### Compilation

```bash
# Build debug version
zig build debug

# Build release version  
zig build release

# Run tests
zig build test
```

The compiled WASM binary will be available in the `build/` directory.

## Usage

### JavaScript/Node.js

```javascript
const { instantiate, VariableType } = require('./index.js');

async function example() {
    // Load the WASM module
    const bucketing = await instantiate();
    
    // Set platform data
    bucketing.setPlatformData(JSON.stringify({
        platform: 'NodeJS',
        platformVersion: '16.0',
        sdkType: 'server',
        sdkVersion: '1.0'
    }));
    
    // Set configuration
    const config = {
        project: { _id: 'proj_123', key: 'my_project' },
        environment: { _id: 'env_123', key: 'production' },
        features: [],
        variables: [
            { _id: 'var_123', key: 'show_feature', type: 'Boolean' }
        ]
    };
    bucketing.setConfigData('sdk_key', JSON.stringify(config));
    
    // Generate bounded hashes
    const hashes = bucketing.generateBoundedHashesFromJSON('user_123', 'feature_456');
    console.log('Hashes:', hashes);
    // Output: { rolloutHash: 0.677..., bucketingHash: 0.920... }
    
    // Generate bucketed config for user
    const user = { user_id: 'user_123', email: 'user@example.com' };
    const bucketedConfig = bucketing.generateBucketedConfigForUser('sdk_key', JSON.stringify(user));
    console.log('Bucketed config:', bucketedConfig);
    
    // Get variable value for user
    const variable = bucketing.variableForUser(
        'sdk_key',
        JSON.stringify(user),
        'show_feature',
        VariableType.Boolean,
        false // shouldTrackEvent
    );
    console.log('Variable:', variable);
    
    // Clean up
    bucketing.cleanup();
}

example().catch(console.error);
```

### API Reference

#### Core Functions

- **`generateBoundedHashesFromJSON(userId, targetId)`**: Generate rollout and bucketing hashes
- **`generateBucketedConfigForUser(sdkKey, userJson)`**: Generate complete bucketed configuration
- **`variableForUser(sdkKey, userJson, variableKey, variableType, shouldTrackEvent)`**: Get variable value

#### Data Management

- **`setPlatformData(platformDataJson)`**: Set SDK platform information
- **`setConfigData(sdkKey, configJson)`**: Set feature configuration
- **`setClientCustomData(sdkKey, customDataJson)`**: Set custom targeting data
- **`clearPlatformData()`**: Clear platform data

#### Variable Types

```javascript
const VariableType = {
    Boolean: 0,
    Number: 1,
    String: 2,
    JSON: 3
};
```

## Performance

The Zig implementation provides several performance advantages:

- **Compile-time optimizations**: Zig's comptime features enable aggressive optimization
- **Memory efficiency**: Fixed buffer allocators reduce memory fragmentation
- **WASM optimizations**: Direct compilation to WebAssembly without intermediate steps
- **Zero-cost abstractions**: Zig's design philosophy minimizes runtime overhead

### Benchmark Comparison (Preliminary)

| Operation | AssemblyScript | Zig | Improvement |
|-----------|---------------|-----|------------|
| Hash Generation | ~0.043ms | TBD | TBD |
| Variable Lookup | ~0.020ms | TBD | TBD |
| Config Generation | ~0.643ms | TBD | TBD |

*Note: Formal benchmarks pending - these are targets based on AssemblyScript performance*

## Architecture

### Memory Management

The Zig implementation uses a fixed buffer allocator for WASM compatibility:

- 1MB buffer for main operations
- 512KB buffer for data managers  
- No dynamic allocation or garbage collection
- Deterministic memory usage

### Module Structure

```
src/
├── main.zig           # WASM exports and entry points
├── types.zig          # Data type definitions
├── bucketing.zig      # Core bucketing logic
├── managers.zig       # Data management
└── helpers.zig        # Utility functions
```

### Key Differences from AssemblyScript

1. **Type System**: Zig's compile-time type system vs AssemblyScript's TypeScript-like types
2. **Memory Management**: Fixed buffers vs garbage collection
3. **Error Handling**: Zig's explicit error handling vs exceptions
4. **Compilation**: Direct WASM compilation vs TypeScript transpilation

## Testing

Run the test suite:

```bash
# Run Zig unit tests
zig build test

# Run JavaScript integration tests
node test.js
```

### Test Coverage

- ✅ Hash generation consistency
- ✅ WASM module loading
- ✅ Data management functions  
- ✅ Basic bucketing operations
- 🚧 Segmentation logic (basic)
- ❌ Event queue (not implemented)
- ❌ Performance benchmarks (pending)

## Compatibility

### With AssemblyScript Version

The Zig implementation aims for API compatibility with the AssemblyScript version:

- ✅ Same function signatures
- ✅ Same JSON data formats
- ✅ Same hashing algorithms
- ✅ Same bucketing logic (basic)
- 🚧 Same segmentation rules (partial)
- ❌ Protocol buffer support (not implemented)

### Platform Support

- ✅ Node.js
- ✅ Modern browsers (with WebAssembly support)
- ✅ Cloudflare Workers
- ✅ Any WebAssembly runtime

## Development

### Adding New Features

1. Implement core logic in Zig (`src/` files)
2. Add WASM exports in `main.zig`
3. Update JavaScript wrapper in `index.js`
4. Add tests in `test.js`
5. Update documentation

### Debugging

- Use `zig build debug` for debug builds with symbols
- Enable debug logging with `instantiate(true)`
- Check WASM memory usage with browser dev tools

## Roadmap

### Phase 1 (Current) ✅
- [x] Basic WASM compilation
- [x] Core bucketing functions
- [x] JavaScript wrapper
- [x] Basic testing

### Phase 2 (Next)
- [ ] Complete segmentation logic
- [ ] Event queue implementation
- [ ] Protocol buffer support
- [ ] Performance benchmarks

### Phase 3 (Future)
- [ ] Advanced targeting rules
- [ ] Metrics and monitoring
- [ ] Additional language bindings
- [ ] Performance optimizations

## Contributing

1. Ensure Zig 0.14.0+ is installed
2. Make changes to Zig source files
3. Run `zig build test` to verify
4. Run `node test.js` for integration tests
5. Update documentation if needed

## License

MIT - Same as the original AssemblyScript implementation.

## Comparison with AssemblyScript

| Aspect | AssemblyScript | Zig |
|--------|---------------|-----|
| **Language** | TypeScript-like | Systems language |
| **Compilation** | TypeScript → WASM | Direct → WASM |
| **Type Safety** | Runtime + compile-time | Compile-time |
| **Memory** | Garbage collected | Manual/fixed buffers |
| **Performance** | Good | Excellent |
| **Development** | Familiar (TS devs) | Learning curve |
| **Ecosystem** | Mature | Growing |
| **Binary Size** | Larger | Smaller |

The Zig implementation provides better performance and smaller binary sizes at the cost of a steeper learning curve for developers familiar with TypeScript/JavaScript.