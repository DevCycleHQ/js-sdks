const std = @import("std");
const types = @import("types.zig");
const Allocator = std.mem.Allocator;

// Re-export key types
const BoundedHash = types.BoundedHash;
const DVCPopulatedUser = types.DVCPopulatedUser;
const ConfigBody = types.ConfigBody;
const CustomData = types.CustomData;
const BucketedUserConfig = types.BucketedUserConfig;
const BucketedVariableResponse = types.BucketedVariableResponse;
const SDKVariable = types.SDKVariable;
const VariableType = types.VariableType;
const EvalReason = types.EvalReason;
const JsonValue = types.JsonValue;
const Project = types.Project;
const Environment = types.Environment;

// Constants
const BASE_SEED: u32 = 0x12345678;
const MAX_HASH_VALUE: f64 = 4294967295.0; // 2^32 - 1

/// MurmurHash3 implementation for 32-bit hashes
pub fn murmurhash3(key: []const u8, seed: u32) u32 {
    const c1: u32 = 0xcc9e2d51;
    const c2: u32 = 0x1b873593;
    const r1: u32 = 15;
    const r2: u32 = 13;
    const m: u32 = 5;
    const n: u32 = 0xe6546b64;

    const len = key.len;
    var hash = seed;
    var i: usize = 0;

    // Process 4-byte chunks
    while (i + 4 <= len) {
        var k: u32 = 0;
        k |= @as(u32, key[i]);
        k |= @as(u32, key[i + 1]) << 8;
        k |= @as(u32, key[i + 2]) << 16;
        k |= @as(u32, key[i + 3]) << 24;

        k = std.math.rotl(u32, k *% c1, r1) *% c2;
        hash ^= k;
        hash = std.math.rotl(u32, hash, r2) *% m +% n;

        i += 4;
    }

    // Process remaining bytes
    var k1: u32 = 0;
    switch (len & 3) {
        3 => {
            k1 ^= @as(u32, key[i + 2]) << 16;
            k1 ^= @as(u32, key[i + 1]) << 8;
            k1 ^= @as(u32, key[i]);
        },
        2 => {
            k1 ^= @as(u32, key[i + 1]) << 8;
            k1 ^= @as(u32, key[i]);
        },
        1 => {
            k1 ^= @as(u32, key[i]);
        },
        else => {},
    }

    if (k1 != 0) {
        k1 = std.math.rotl(u32, k1 *% c1, r1) *% c2;
        hash ^= k1;
    }

    // Finalization
    hash ^= @as(u32, @intCast(len));
    hash ^= hash >> 16;
    hash = hash *% 0x85ebca6b;
    hash ^= hash >> 13;
    hash = hash *% 0xc2b2ae35;
    hash ^= hash >> 16;

    return hash;
}

/// Generate a bounded hash value between 0 and 1
pub fn generateBoundedHashValue(input: []const u8, hash_seed: u32) f64 {
    const hash = murmurhash3(input, hash_seed);
    return @as(f64, @floatFromInt(hash)) / MAX_HASH_VALUE;
}

/// Generate bounded hashes for rollout and bucketing
pub fn generateBoundedHashes(user_id: []const u8, target_id: []const u8) BoundedHash {
    // Hash the target_id with base seed to get target hash
    const target_hash = murmurhash3(target_id, BASE_SEED);
    
    // Create rollout input by concatenating user_id + "_rollout"
    var rollout_buffer: [256]u8 = undefined;
    const rollout_input = std.fmt.bufPrint(&rollout_buffer, "{s}_rollout", .{user_id}) catch user_id;
    
    const rollout_hash = generateBoundedHashValue(rollout_input, target_hash);
    const bucketing_hash = generateBoundedHashValue(user_id, target_hash);
    
    return BoundedHash{
        .rollout_hash = rollout_hash,
        .bucketing_hash = bucketing_hash,
    };
}

/// Generate bucketed configuration for a user
pub fn generateBucketedConfig(
    config: ConfigBody,
    _: DVCPopulatedUser,
    _: CustomData,
    _: ?CustomData,
    allocator: Allocator
) !BucketedUserConfig {
    // Create a bucketed config based on the user and configuration
    const bucketed_config = types.BucketedUserConfig.init(
        try Project.init(config.project.id, config.project.key, allocator),
        try Environment.init(config.environment.id, config.environment.key, allocator),
        allocator
    );
    
    // For now, return a basic config
    // TODO: Implement full bucketing logic for features and variables
    
    return bucketed_config;
}

/// Generate a bucketed variable for a specific user and variable key
pub fn generateBucketedVariableForUser(
    config: ConfigBody,
    _: DVCPopulatedUser,
    variable_key: []const u8,
    _: CustomData,
    allocator: Allocator
) !?BucketedVariableResponse {
    // Find the variable in the config
    for (config.variables.items) |variable| {
        if (std.mem.eql(u8, variable.key, variable_key)) {
            // Found the variable, now we need to determine its value based on bucketing
            
            // For now, create a basic variable with default values
            const eval_reason = try EvalReason.init("default", "Variable default", "", allocator);
            const default_value = JsonValue{ .string = try allocator.dupe(u8, "default_value") };
            
            const sdk_variable = try SDKVariable.init(
                variable.id,
                variable.type,
                variable.key,
                default_value,
                null, // feature
                eval_reason,
                allocator
            );
            
            // Create a default variation and feature
            const variation = try types.Variation.init("default_variation", "Default", "default", allocator);
            const feature = try types.Feature.init("default_feature", "default_feature_key", "release", allocator);
            
            const response = types.BucketedVariableResponse.init(sdk_variable, variation, feature);
            return response;
        }
    }
    
    // Variable not found
    return null;
}

/// Evaluate if a user passes segmentation for a feature (stub implementation)
pub fn evaluateSegmentationForFeature(
    _: ConfigBody,
    _: types.Feature,
    _: DVCPopulatedUser,
    _: CustomData
) bool {
    // TODO: Implement segmentation evaluation logic
    // For now, always return true
    return true;
}

/// Determine which variation a user should receive for a feature
pub fn bucketUserForVariation(
    feature: types.Feature,
    _: DVCPopulatedUser
) ?types.Variation {
    // TODO: Implement variation bucketing logic
    // For now, return the first variation if available
    if (feature.variations.items.len > 0) {
        return feature.variations.items[0];
    }
    return null;
}

/// Check if user passes rollout percentage
pub fn doesUserPassRollout(
    rollout_percentage: f64,
    bounded_hash: f64
) bool {
    return bounded_hash <= rollout_percentage;
}

/// Get current rollout percentage based on date and rollout configuration
pub fn getCurrentRolloutPercentage(
    start_percentage: f64,
    start_date: i64,
    current_date: i64,
    _: []const u8
) f64 {
    // TODO: Implement full rollout logic with stages
    // For now, return start percentage if current date >= start date
    if (current_date >= start_date) {
        return start_percentage;
    }
    return 0.0;
}

// Test functions for validation
test "murmurhash3 basic functionality" {
    const input = "hello";
    const seed: u32 = 0;
    const hash = murmurhash3(input, seed);
    
    // MurmurHash3 should produce consistent results
    const hash2 = murmurhash3(input, seed);
    try std.testing.expect(hash == hash2);
}

test "bounded hash generation" {
    const user_id = "test_user";
    const target_id = "test_target";
    
    const bounded_hash = generateBoundedHashes(user_id, target_id);
    
    // Hash values should be between 0 and 1
    try std.testing.expect(bounded_hash.rollout_hash >= 0.0 and bounded_hash.rollout_hash <= 1.0);
    try std.testing.expect(bounded_hash.bucketing_hash >= 0.0 and bounded_hash.bucketing_hash <= 1.0);
}

test "consistent hashing" {
    const user_id = "consistent_user";
    const target_id = "consistent_target";
    
    const hash1 = generateBoundedHashes(user_id, target_id);
    const hash2 = generateBoundedHashes(user_id, target_id);
    
    // Same inputs should produce same outputs
    try std.testing.expect(hash1.rollout_hash == hash2.rollout_hash);
    try std.testing.expect(hash1.bucketing_hash == hash2.bucketing_hash);
}