const std = @import("std");
const types = @import("types.zig");
const Allocator = std.mem.Allocator;
const HashMap = std.HashMap;

// Re-export key types
const PlatformData = types.PlatformData;
const ConfigBody = types.ConfigBody;
const CustomData = types.CustomData;

// Simple memory pool for WASM
var global_memory_buffer: [512 * 1024]u8 = undefined; // 512KB buffer for managers
var global_fba = std.heap.FixedBufferAllocator.init(&global_memory_buffer);
const global_allocator = global_fba.allocator();

// Global storage maps
var platform_data: ?PlatformData = null;
var config_storage: HashMap([]const u8, ConfigBody, std.hash_map.StringContext, std.hash_map.default_max_load_percentage) = undefined;
var custom_data_storage: HashMap([]const u8, CustomData, std.hash_map.StringContext, std.hash_map.default_max_load_percentage) = undefined;

var managers_initialized = false;

// Initialize the managers - must be called before using any manager functions
pub fn init() !void {
    if (!managers_initialized) {
        config_storage = HashMap([]const u8, ConfigBody, std.hash_map.StringContext, std.hash_map.default_max_load_percentage).init(global_allocator);
        custom_data_storage = HashMap([]const u8, CustomData, std.hash_map.StringContext, std.hash_map.default_max_load_percentage).init(global_allocator);
        managers_initialized = true;
    }
}

// Clean up managers
pub fn deinit() void {
    if (managers_initialized) {
        // Clean up platform data
        if (platform_data) |*pd| {
            pd.deinit(global_allocator);
            platform_data = null;
        }
        
        // Clean up config storage
        var config_iter = config_storage.iterator();
        while (config_iter.next()) |entry| {
            global_allocator.free(entry.key_ptr.*);
            entry.value_ptr.deinit(global_allocator);
        }
        config_storage.deinit();
        
        // Clean up custom data storage
        var custom_iter = custom_data_storage.iterator();
        while (custom_iter.next()) |entry| {
            global_allocator.free(entry.key_ptr.*);
            entry.value_ptr.deinit(global_allocator);
        }
        custom_data_storage.deinit();
        
        managers_initialized = false;
    }
}

// Platform Data Manager

/// Set global platform data
pub fn setPlatformData(data: PlatformData) !void {
    try init();
    
    // Clear existing platform data
    if (platform_data) |*pd| {
        pd.deinit(global_allocator);
    }
    
    // Clone the new platform data
    platform_data = try PlatformData.init(
        data.platform,
        data.platform_version,
        data.sdk_type,
        data.sdk_version,
        data.sdk_platform,
        data.hostname,
        global_allocator
    );
}

/// Get global platform data
pub fn getPlatformData() !PlatformData {
    try init();
    
    if (platform_data) |pd| {
        return try PlatformData.init(
            pd.platform,
            pd.platform_version,
            pd.sdk_type,
            pd.sdk_version,
            pd.sdk_platform,
            pd.hostname,
            global_allocator
        );
    }
    
    // Return default platform data if none set
    return PlatformData.init("NodeJS", "16.0", "server", "1.0", null, null, global_allocator);
}

/// Clear platform data
pub fn clearPlatformData() !void {
    try init();
    
    if (platform_data) |*pd| {
        pd.deinit(global_allocator);
        platform_data = null;
    }
}

// Config Data Manager

/// Set configuration data for a specific SDK key
pub fn setConfigData(sdk_key: []const u8, config: ConfigBody) !void {
    try init();
    
    // Make a copy of the SDK key for storage
    const key_copy = try global_allocator.dupe(u8, sdk_key);
    
    // If key already exists, clean up old data
    if (config_storage.getPtr(key_copy)) |existing_config| {
        existing_config.deinit(global_allocator);
        _ = config_storage.remove(key_copy);
        global_allocator.free(key_copy);
    }
    
    // Clone the config for storage
    const project = try types.Project.init(config.project.id, config.project.key, global_allocator);
    const environment = try types.Environment.init(config.environment.id, config.environment.key, global_allocator);
    
    var cloned_config = types.ConfigBody.init(project, environment, global_allocator);
    
    // Clone features
    for (config.features.items) |feature| {
        var cloned_feature = try types.Feature.init(feature.id, feature.key, feature.type, global_allocator);
        
        // Clone variations
        for (feature.variations.items) |variation| {
            const cloned_variation = try types.Variation.init(variation.id, variation.name, variation.key, global_allocator);
            try cloned_feature.variations.append(cloned_variation);
        }
        
        try cloned_config.features.append(cloned_feature);
    }
    
    // Clone variables
    for (config.variables.items) |variable| {
        const cloned_variable = try types.Variable.init(variable.id, variable.key, variable.type, global_allocator);
        try cloned_config.variables.append(cloned_variable);
    }
    
    // Clone etag and client SDK key if they exist
    if (config.etag) |etag| {
        cloned_config.etag = try global_allocator.dupe(u8, etag);
    }
    if (config.client_sdk_key) |csk| {
        cloned_config.client_sdk_key = try global_allocator.dupe(u8, csk);
    }
    
    // Store the cloned config
    try config_storage.put(key_copy, cloned_config);
}

/// Get configuration data for a specific SDK key
pub fn getConfigData(sdk_key: []const u8) !ConfigBody {
    try init();
    
    if (config_storage.get(sdk_key)) |config| {
        // Return a clone of the stored config
        const project = try types.Project.init(config.project.id, config.project.key, global_allocator);
        const environment = try types.Environment.init(config.environment.id, config.environment.key, global_allocator);
        
        var cloned_config = types.ConfigBody.init(project, environment, global_allocator);
        
        // Clone features and variables
        for (config.features.items) |feature| {
            var cloned_feature = try types.Feature.init(feature.id, feature.key, feature.type, global_allocator);
            
            for (feature.variations.items) |variation| {
                const cloned_variation = try types.Variation.init(variation.id, variation.name, variation.key, global_allocator);
                try cloned_feature.variations.append(cloned_variation);
            }
            
            try cloned_config.features.append(cloned_feature);
        }
        
        for (config.variables.items) |variable| {
            const cloned_variable = try types.Variable.init(variable.id, variable.key, variable.type, global_allocator);
            try cloned_config.variables.append(cloned_variable);
        }
        
        if (config.etag) |etag| {
            cloned_config.etag = try global_allocator.dupe(u8, etag);
        }
        if (config.client_sdk_key) |csk| {
            cloned_config.client_sdk_key = try global_allocator.dupe(u8, csk);
        }
        
        return cloned_config;
    }
    
    return error.ConfigNotFound;
}

/// Check if configuration data exists for SDK key
pub fn hasConfigData(sdk_key: []const u8) !bool {
    try init();
    return config_storage.contains(sdk_key);
}

/// Get configuration metadata for SDK key (project/environment info)
pub fn getConfigMetadata(sdk_key: []const u8) ![]const u8 {
    try init();
    
    if (config_storage.get(sdk_key)) |config| {
        return std.fmt.allocPrint(global_allocator,
            "{{\"project\":{{\"id\":\"{s}\",\"key\":\"{s}\"}},\"environment\":{{\"id\":\"{s}\",\"key\":\"{s}\"}}}}",
            .{ config.project.id, config.project.key, config.environment.id, config.environment.key });
    }
    
    return error.ConfigNotFound;
}

// Client Custom Data Manager

/// Set client custom data for a specific SDK key
pub fn setClientCustomData(sdk_key: []const u8, custom_data: CustomData) !void {
    try init();
    
    // Make a copy of the SDK key for storage
    const key_copy = try global_allocator.dupe(u8, sdk_key);
    
    // If key already exists, clean up old data
    if (custom_data_storage.getPtr(key_copy)) |existing_data| {
        existing_data.deinit(global_allocator);
        _ = custom_data_storage.remove(key_copy);
        global_allocator.free(key_copy);
    }
    
    // Clone the custom data for storage
    var cloned_data = types.CustomData.init(global_allocator);
    
    // Clone each entry in the custom data
    var iter = custom_data.data.iterator();
    while (iter.next()) |entry| {
        const cloned_key = try global_allocator.dupe(u8, entry.key_ptr.*);
        const cloned_value = try entry.value_ptr.clone(global_allocator);
        try cloned_data.data.put(cloned_key, cloned_value);
    }
    
    try custom_data_storage.put(key_copy, cloned_data);
}

/// Get client custom data for a specific SDK key
pub fn getClientCustomData(sdk_key: []const u8) !CustomData {
    try init();
    
    if (custom_data_storage.get(sdk_key)) |custom_data| {
        // Return a clone of the stored data
        var cloned_data = types.CustomData.init(global_allocator);
        
        var iter = custom_data.data.iterator();
        while (iter.next()) |entry| {
            const cloned_key = try global_allocator.dupe(u8, entry.key_ptr.*);
            const cloned_value = try entry.value_ptr.clone(global_allocator);
            try cloned_data.data.put(cloned_key, cloned_value);
        }
        
        return cloned_data;
    }
    
    // Return empty custom data if none exists
    return types.CustomData.init(global_allocator);
}

/// Clear client custom data for a specific SDK key
pub fn clearClientCustomData(sdk_key: []const u8) !void {
    try init();
    
    if (custom_data_storage.getPtr(sdk_key)) |custom_data| {
        custom_data.deinit(global_allocator);
        _ = custom_data_storage.remove(sdk_key);
    }
}

// Test functions
test "platform data management" {
    const allocator = std.testing.allocator;
    
    // Test setting and getting platform data
    const pd = try PlatformData.init("Test", "1.0", "server", "2.0", null, null, allocator);
    defer {
        var mut_pd = pd;
        mut_pd.deinit(allocator);
    }
    
    try setPlatformData(pd);
    
    const retrieved_pd = try getPlatformData();
    defer {
        var mut_retrieved = retrieved_pd;
        mut_retrieved.deinit(allocator);
    }
    
    try std.testing.expectEqualStrings("Test", retrieved_pd.platform);
    try std.testing.expectEqualStrings("1.0", retrieved_pd.platform_version);
    
    // Clean up
    try clearPlatformData();
    deinit();
}

test "config data management" {
    const allocator = std.testing.allocator;
    
    // Create test config
    const project = try types.Project.init("test_project", "test_key", allocator);
    defer {
        var mut_project = project;
        mut_project.deinit(allocator);
    }
    
    const environment = try types.Environment.init("test_env", "test_env_key", allocator);
    defer {
        var mut_env = environment;
        mut_env.deinit(allocator);
    }
    
    const config = types.ConfigBody.init(project, environment, allocator);
    defer {
        var mut_config = config;
        mut_config.deinit(allocator);
    }
    
    const sdk_key = "test_sdk_key";
    
    // Test setting and getting config
    try setConfigData(sdk_key, config);
    try std.testing.expect(try hasConfigData(sdk_key));
    
    const retrieved_config = try getConfigData(sdk_key);
    defer {
        var mut_retrieved = retrieved_config;
        mut_retrieved.deinit(allocator);
    }
    
    try std.testing.expectEqualStrings("test_project", retrieved_config.project.id);
    try std.testing.expectEqualStrings("test_env", retrieved_config.environment.id);
    
    // Clean up
    deinit();
}