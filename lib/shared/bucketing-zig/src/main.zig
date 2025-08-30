const std = @import("std");
const Allocator = std.mem.Allocator;

// Re-exports from modules
pub const types = @import("types.zig");
pub const bucketing = @import("bucketing.zig");
pub const managers = @import("managers.zig");
pub const helpers = @import("helpers.zig");

// Import core types
const DVCUser = types.DVCUser;
const DVCPopulatedUser = types.DVCPopulatedUser;
const ConfigBody = types.ConfigBody;
const SDKVariable = types.SDKVariable;
const VariableType = types.VariableType;
const BoundedHash = types.BoundedHash;

// Simple memory pool for WASM
var memory_buffer: [1024 * 1024]u8 = undefined; // 1MB buffer
var fba = std.heap.FixedBufferAllocator.init(&memory_buffer);
const allocator = fba.allocator();

// String allocator for WASM - using same allocator
const string_allocator = allocator;

// Initialize/cleanup functions
export fn wasmInit() void {
    // Initialize any global state needed
}

export fn wasmCleanup() void {
    // Reset the fixed buffer allocator
    fba.reset();
}

// Core exported functions matching AssemblyScript API

/// Generate bounded hashes from user_id and target_id, returns JSON string
export fn generateBoundedHashesFromJSON(user_id_ptr: [*]const u8, user_id_len: u32, target_id_ptr: [*]const u8, target_id_len: u32) [*]const u8 {
    const user_id = user_id_ptr[0..user_id_len];
    const target_id = target_id_ptr[0..target_id_len];
    
    const bounded_hash = bucketing.generateBoundedHashes(user_id, target_id);
    
    // Create JSON response
    const json_str = std.fmt.allocPrint(string_allocator, 
        "{{\"rolloutHash\":{d},\"bucketingHash\":{d}}}", 
        .{ bounded_hash.rollout_hash, bounded_hash.bucketing_hash }
    ) catch return allocateString("");
    
    return allocateString(json_str);
}

/// Generate bucketed config for user (main function)
export fn generateBucketedConfigForUser(sdk_key_ptr: [*]const u8, sdk_key_len: u32, user_json_ptr: [*]const u8, user_json_len: u32) [*]const u8 {
    const sdk_key = sdk_key_ptr[0..sdk_key_len];
    const user_json = user_json_ptr[0..user_json_len];
    
    const config = managers.getConfigData(sdk_key) catch return allocateString("");
    var user = DVCUser.fromJsonString(user_json, allocator) catch return allocateString("");
    defer user.deinit(allocator);
    
    var populated_user = DVCPopulatedUser.fromDVCUser(user, allocator) catch return allocateString("");
    defer populated_user.deinit(allocator);
    
    var client_custom_data = managers.getClientCustomData(sdk_key) catch return allocateString("");
    defer client_custom_data.deinit(allocator);
    
    var bucketed_config = bucketing.generateBucketedConfig(config, populated_user, client_custom_data, null, allocator) catch return allocateString("");
    defer bucketed_config.deinit(allocator);
    
    const json_str = bucketed_config.toJsonString(allocator) catch return allocateString("");
    
    return allocateString(json_str);
}

/// Get variable for user (main variable evaluation function)
export fn variableForUser(
    sdk_key_ptr: [*]const u8, sdk_key_len: u32,
    user_json_ptr: [*]const u8, user_json_len: u32,
    variable_key_ptr: [*]const u8, variable_key_len: u32,
    variable_type: u32,
    should_track_event: bool
) [*]const u8 {
    const sdk_key = sdk_key_ptr[0..sdk_key_len];
    const user_json = user_json_ptr[0..user_json_len];
    const variable_key = variable_key_ptr[0..variable_key_len];
    
    const var_type = @as(VariableType, @enumFromInt(variable_type));
    
    const config = managers.getConfigData(sdk_key) catch return allocateString("");
    var user = DVCUser.fromJsonString(user_json, allocator) catch return allocateString("");
    defer user.deinit(allocator);
    
    var populated_user = DVCPopulatedUser.fromDVCUser(user, allocator) catch return allocateString("");
    defer populated_user.deinit(allocator);
    
    var client_custom_data = managers.getClientCustomData(sdk_key) catch return allocateString("");
    defer client_custom_data.deinit(allocator);
    
    const variable = bucketing.generateBucketedVariableForUser(config, populated_user, variable_key, client_custom_data, allocator) catch return allocateString("");
    
    if (variable) |var_result| {
        var mut_var_result = var_result;
        defer mut_var_result.deinit(allocator);
        
        // Check if variable type matches requested type
        if (var_result.variable.variable_type != var_type) {
            return allocateString("");
        }
        
        // Track event if requested
        if (should_track_event) {
            // TODO: Implement event tracking
        }
        
        const json_str = var_result.variable.toJsonString(allocator) catch return allocateString("");
        return allocateString(json_str);
    }
    
    return allocateString("");
}

/// Set platform data
export fn setPlatformData(platform_data_ptr: [*]const u8, platform_data_len: u32) void {
    const platform_data_json = platform_data_ptr[0..platform_data_len];
    
    var platform_data = types.PlatformData.fromJsonString(platform_data_json, allocator) catch return;
    defer platform_data.deinit(allocator);
    
    managers.setPlatformData(platform_data) catch return;
}

/// Set config data for SDK key
export fn setConfigData(sdk_key_ptr: [*]const u8, sdk_key_len: u32, config_data_ptr: [*]const u8, config_data_len: u32) void {
    const sdk_key = sdk_key_ptr[0..sdk_key_len];
    const config_data_json = config_data_ptr[0..config_data_len];
    
    var config = ConfigBody.fromJsonString(config_data_json, allocator) catch return;
    defer config.deinit(allocator);
    
    managers.setConfigData(sdk_key, config) catch return;
}

/// Set client custom data for SDK key  
export fn setClientCustomData(sdk_key_ptr: [*]const u8, sdk_key_len: u32, custom_data_ptr: [*]const u8, custom_data_len: u32) void {
    const sdk_key = sdk_key_ptr[0..sdk_key_len];
    const custom_data_json = custom_data_ptr[0..custom_data_len];
    
    var custom_data = types.CustomData.fromJsonString(custom_data_json, allocator) catch return;
    defer custom_data.deinit(allocator);
    
    managers.setClientCustomData(sdk_key, custom_data) catch return;
}

/// Clear platform data
export fn clearPlatformData() void {
    managers.clearPlatformData() catch return;
}

// Helper function to allocate string in WASM linear memory
fn allocateString(str: []const u8) [*]const u8 {
    const allocated = string_allocator.alloc(u8, str.len + 1) catch return @ptrCast(@constCast(""));
    @memcpy(allocated[0..str.len], str);
    allocated[str.len] = 0; // null terminate
    return allocated.ptr;
}

// Memory allocation exports for WASM
export fn wasmAlloc(size: u32) [*]u8 {
    const slice = allocator.alloc(u8, size) catch return @ptrCast(@alignCast(@constCast("")));
    return slice.ptr;
}

export fn wasmFree(ptr: [*]u8, size: u32) void {
    const slice = ptr[0..size];
    allocator.free(slice);
}