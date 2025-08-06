const fs = require('fs');
const path = require('path');

/**
 * WASM Bucketing Library - Zig Implementation
 * JavaScript wrapper for the Zig-compiled WASM bucketing library
 */
class WASMBucketingExports {
    constructor(wasmInstance) {
        this.instance = wasmInstance;
        this.memory = wasmInstance.exports.memory;
        this.exports = wasmInstance.exports;
        
        // Initialize the WASM module
        this.exports.wasmInit();
    }

    /**
     * Helper function to allocate string in WASM memory
     */
    allocateString(str) {
        const bytes = new TextEncoder().encode(str);
        const ptr = this.exports.wasmAlloc(bytes.length);
        const wasmArray = new Uint8Array(this.memory.buffer, ptr, bytes.length);
        wasmArray.set(bytes);
        return { ptr, len: bytes.length };
    }

    /**
     * Helper function to read string from WASM memory
     */
    readString(ptr) {
        if (ptr === 0) return '';
        
        // Find null terminator
        const buffer = new Uint8Array(this.memory.buffer);
        let len = 0;
        while (buffer[ptr + len] !== 0) {
            len++;
        }
        
        const stringBytes = new Uint8Array(this.memory.buffer, ptr, len);
        return new TextDecoder().decode(stringBytes);
    }

    /**
     * Free allocated WASM memory
     */
    freeString(ptr, len) {
        this.exports.wasmFree(ptr, len);
    }

    /**
     * Generate bounded hashes from user ID and target ID
     */
    generateBoundedHashesFromJSON(userId, targetId) {
        const userIdAlloc = this.allocateString(userId);
        const targetIdAlloc = this.allocateString(targetId);
        
        try {
            const resultPtr = this.exports.generateBoundedHashesFromJSON(
                userIdAlloc.ptr, userIdAlloc.len,
                targetIdAlloc.ptr, targetIdAlloc.len
            );
            
            const result = this.readString(resultPtr);
            return JSON.parse(result);
        } finally {
            this.freeString(userIdAlloc.ptr, userIdAlloc.len);
            this.freeString(targetIdAlloc.ptr, targetIdAlloc.len);
        }
    }

    /**
     * Generate bucketed configuration for a user
     */
    generateBucketedConfigForUser(sdkKey, userJsonStr) {
        const sdkKeyAlloc = this.allocateString(sdkKey);
        const userJsonAlloc = this.allocateString(userJsonStr);
        
        try {
            const resultPtr = this.exports.generateBucketedConfigForUser(
                sdkKeyAlloc.ptr, sdkKeyAlloc.len,
                userJsonAlloc.ptr, userJsonAlloc.len
            );
            
            const result = this.readString(resultPtr);
            return result ? JSON.parse(result) : null;
        } finally {
            this.freeString(sdkKeyAlloc.ptr, sdkKeyAlloc.len);
            this.freeString(userJsonAlloc.ptr, userJsonAlloc.len);
        }
    }

    /**
     * Get variable value for user
     */
    variableForUser(sdkKey, userJsonStr, variableKey, variableType, shouldTrackEvent = false) {
        const sdkKeyAlloc = this.allocateString(sdkKey);
        const userJsonAlloc = this.allocateString(userJsonStr);
        const variableKeyAlloc = this.allocateString(variableKey);
        
        try {
            const resultPtr = this.exports.variableForUser(
                sdkKeyAlloc.ptr, sdkKeyAlloc.len,
                userJsonAlloc.ptr, userJsonAlloc.len,
                variableKeyAlloc.ptr, variableKeyAlloc.len,
                variableType,
                shouldTrackEvent
            );
            
            const result = this.readString(resultPtr);
            return result ? JSON.parse(result) : null;
        } finally {
            this.freeString(sdkKeyAlloc.ptr, sdkKeyAlloc.len);
            this.freeString(userJsonAlloc.ptr, userJsonAlloc.len);
            this.freeString(variableKeyAlloc.ptr, variableKeyAlloc.len);
        }
    }

    /**
     * Set platform data
     */
    setPlatformData(platformDataJsonStr) {
        const platformDataAlloc = this.allocateString(platformDataJsonStr);
        
        try {
            this.exports.setPlatformData(platformDataAlloc.ptr, platformDataAlloc.len);
        } finally {
            this.freeString(platformDataAlloc.ptr, platformDataAlloc.len);
        }
    }

    /**
     * Set configuration data for SDK key
     */
    setConfigData(sdkKey, configDataJsonStr) {
        const sdkKeyAlloc = this.allocateString(sdkKey);
        const configDataAlloc = this.allocateString(configDataJsonStr);
        
        try {
            this.exports.setConfigData(
                sdkKeyAlloc.ptr, sdkKeyAlloc.len,
                configDataAlloc.ptr, configDataAlloc.len
            );
        } finally {
            this.freeString(sdkKeyAlloc.ptr, sdkKeyAlloc.len);
            this.freeString(configDataAlloc.ptr, configDataAlloc.len);
        }
    }

    /**
     * Set client custom data for SDK key
     */
    setClientCustomData(sdkKey, customDataJsonStr) {
        const sdkKeyAlloc = this.allocateString(sdkKey);
        const customDataAlloc = this.allocateString(customDataJsonStr);
        
        try {
            this.exports.setClientCustomData(
                sdkKeyAlloc.ptr, sdkKeyAlloc.len,
                customDataAlloc.ptr, customDataAlloc.len
            );
        } finally {
            this.freeString(sdkKeyAlloc.ptr, sdkKeyAlloc.len);
            this.freeString(customDataAlloc.ptr, customDataAlloc.len);
        }
    }

    /**
     * Clear platform data
     */
    clearPlatformData() {
        this.exports.clearPlatformData();
    }

    /**
     * Cleanup WASM resources
     */
    cleanup() {
        this.exports.wasmCleanup();
    }
}

/**
 * Load the WASM module and create exports wrapper
 */
async function instantiate(debug = false, imports = {}) {
    const wasmPath = path.join(__dirname, 'build/bucketing-lib.wasm');
    
    if (!fs.existsSync(wasmPath)) {
        throw new Error(`WASM file not found at ${wasmPath}`);
    }
    
    // Default imports for WASM environment
    const defaultImports = {
        env: {
            // Math functions
            sin: Math.sin,
            cos: Math.cos,
            exp: Math.exp,
            log: Math.log,
            pow: Math.pow,
            sqrt: Math.sqrt,
            
            // Debug functions
            __assert_fail: (condition, file, line, func) => {
                throw new Error(`Assertion failed at ${file}:${line} in ${func}`);
            },
            
            // Memory functions (if needed)
            memory: imports.memory || new WebAssembly.Memory({ initial: 256, maximum: 512 }),
        },
        ...imports
    };
    
    const wasmBytes = fs.readFileSync(wasmPath);
    const wasmModule = await WebAssembly.compile(wasmBytes);
    const wasmInstance = await WebAssembly.instantiate(wasmModule, defaultImports);
    
    return new WASMBucketingExports(wasmInstance);
}

// Variable type enum matching the Zig implementation
const VariableType = {
    Boolean: 0,
    Number: 1,
    String: 2,
    JSON: 3,
};

module.exports = {
    instantiate,
    VariableType,
};

// For ES6 modules
if (typeof exports !== 'undefined' && exports.instantiate) {
    exports.instantiate = instantiate;
    exports.VariableType = VariableType;
}