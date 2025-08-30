const std = @import("std");
const Allocator = std.mem.Allocator;
const types = @import("types.zig");

// JSON Value utilities
const JsonValue = types.JsonValue;
const JsonObject = types.JsonObject;
const JsonArray = types.JsonArray;

/// String utilities
pub const StringUtils = struct {
    /// Check if a string starts with a prefix
    pub fn startsWith(str: []const u8, prefix: []const u8) bool {
        if (prefix.len > str.len) return false;
        return std.mem.eql(u8, str[0..prefix.len], prefix);
    }
    
    /// Check if a string ends with a suffix
    pub fn endsWith(str: []const u8, suffix: []const u8) bool {
        if (suffix.len > str.len) return false;
        return std.mem.eql(u8, str[str.len - suffix.len..], suffix);
    }
    
    /// Check if a string contains a substring
    pub fn contains(str: []const u8, needle: []const u8) bool {
        return std.mem.indexOf(u8, str, needle) != null;
    }
    
    /// Convert string to lowercase (allocates new string)
    pub fn toLowercase(str: []const u8, allocator: Allocator) ![]u8 {
        const result = try allocator.alloc(u8, str.len);
        for (str, 0..) |c, i| {
            result[i] = std.ascii.toLower(c);
        }
        return result;
    }
    
    /// Trim whitespace from both ends of string
    pub fn trim(str: []const u8) []const u8 {
        return std.mem.trim(u8, str, " \t\n\r");
    }
};

/// Array utilities
pub const ArrayUtils = struct {
    /// Find first element matching predicate
    pub fn find(comptime T: type, array: []const T, predicate: fn(T) bool) ?T {
        for (array) |item| {
            if (predicate(item)) return item;
        }
        return null;
    }
    
    /// Check if array contains element
    pub fn contains(comptime T: type, array: []const T, element: T) bool {
        for (array) |item| {
            if (std.meta.eql(item, element)) return true;
        }
        return false;
    }
    
    /// Get first element or null
    pub fn first(comptime T: type, array: []const T) ?T {
        if (array.len > 0) return array[0];
        return null;
    }
    
    /// Get last element or null
    pub fn last(comptime T: type, array: []const T) ?T {
        if (array.len > 0) return array[array.len - 1];
        return null;
    }
};

/// Version comparison utilities
pub const VersionUtils = struct {
    /// Compare two version strings
    /// Returns: -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
    pub fn compare(v1: []const u8, v2: []const u8) i32 {
        var v1_parts = std.mem.split(u8, v1, ".");
        var v2_parts = std.mem.split(u8, v2, ".");
        
        while (true) {
            const v1_part = v1_parts.next();
            const v2_part = v2_parts.next();
            
            if (v1_part == null and v2_part == null) return 0;
            if (v1_part == null) return -1;
            if (v2_part == null) return 1;
            
            const v1_num = std.fmt.parseInt(u32, v1_part.?, 10) catch 0;
            const v2_num = std.fmt.parseInt(u32, v2_part.?, 10) catch 0;
            
            if (v1_num < v2_num) return -1;
            if (v1_num > v2_num) return 1;
        }
    }
    
    /// Check if version v1 is greater than v2
    pub fn isGreaterThan(v1: []const u8, v2: []const u8) bool {
        return compare(v1, v2) > 0;
    }
    
    /// Check if version v1 is less than v2
    pub fn isLessThan(v1: []const u8, v2: []const u8) bool {
        return compare(v1, v2) < 0;
    }
    
    /// Check if version v1 equals v2
    pub fn isEqual(v1: []const u8, v2: []const u8) bool {
        return compare(v1, v2) == 0;
    }
};

/// JSON utilities for parsing and serialization
pub const JsonUtils = struct {
    /// Parse a simple JSON string into a JsonValue
    /// This is a basic parser for essential JSON types
    pub fn parseSimple(json_str: []const u8, allocator: Allocator) !JsonValue {
        const trimmed = StringUtils.trim(json_str);
        
        if (trimmed.len == 0) {
            return JsonValue{ .null_value = {} };
        }
        
        // Handle null
        if (std.mem.eql(u8, trimmed, "null")) {
            return JsonValue{ .null_value = {} };
        }
        
        // Handle boolean
        if (std.mem.eql(u8, trimmed, "true")) {
            return JsonValue{ .boolean = true };
        }
        if (std.mem.eql(u8, trimmed, "false")) {
            return JsonValue{ .boolean = false };
        }
        
        // Handle string
        if (trimmed[0] == '"' and trimmed[trimmed.len - 1] == '"') {
            const str_content = trimmed[1..trimmed.len - 1];
            return JsonValue{ .string = try allocator.dupe(u8, str_content) };
        }
        
        // Handle number
        if (std.fmt.parseFloat(f64, trimmed)) |num| {
            return JsonValue{ .number = num };
        } else |_| {
            // If not a valid number, treat as string
            return JsonValue{ .string = try allocator.dupe(u8, trimmed) };
        }
    }
    
    /// Serialize a JsonValue to string
    pub fn stringify(value: JsonValue, allocator: Allocator) ![]u8 {
        return switch (value) {
            .null_value => try allocator.dupe(u8, "null"),
            .boolean => |b| if (b) try allocator.dupe(u8, "true") else try allocator.dupe(u8, "false"),
            .number => |n| try std.fmt.allocPrint(allocator, "{d}", .{n}),
            .string => |s| try std.fmt.allocPrint(allocator, "\"{s}\"", .{s}),
            .object => |obj| try stringifyObject(obj, allocator),
            .array => |arr| try stringifyArray(arr, allocator),
        };
    }
    
    fn stringifyObject(obj: JsonObject, allocator: Allocator) ![]u8 {
        var result = std.ArrayList(u8).init(allocator);
        defer result.deinit();
        
        try result.append('{');
        
        var iter = obj.iterator();
        var first = true;
        while (iter.next()) |entry| {
            if (!first) try result.appendSlice(", ");
            first = false;
            
            try result.appendSlice("\"");
            try result.appendSlice(entry.key_ptr.*);
            try result.appendSlice("\": ");
            
            const value_str = try stringify(entry.value_ptr.*, allocator);
            defer allocator.free(value_str);
            try result.appendSlice(value_str);
        }
        
        try result.append('}');
        return result.toOwnedSlice();
    }
    
    fn stringifyArray(arr: JsonArray, allocator: Allocator) ![]u8 {
        var result = std.ArrayList(u8).init(allocator);
        defer result.deinit();
        
        try result.append('[');
        
        for (arr.items, 0..) |item, i| {
            if (i > 0) try result.appendSlice(", ");
            
            const item_str = try stringify(item, allocator);
            defer allocator.free(item_str);
            try result.appendSlice(item_str);
        }
        
        try result.append(']');
        return result.toOwnedSlice();
    }
};

/// Date and time utilities
pub const DateUtils = struct {
    // Default timestamp for WASM environment without system time access
    const DEFAULT_TIMESTAMP: i64 = 1640995200; // 2022-01-01 in seconds since epoch
    
    /// Get current timestamp in seconds since epoch (returns default in WASM)
    pub fn getCurrentTimestamp() i64 {
        return DEFAULT_TIMESTAMP;
    }
    
    /// Get current timestamp in milliseconds since epoch (returns default in WASM)
    pub fn getCurrentTimestampMs() i64 {
        return DEFAULT_TIMESTAMP * 1000;
    }
    
    /// Check if a timestamp is in the past
    pub fn isPast(timestamp: i64) bool {
        return timestamp < getCurrentTimestamp();
    }
    
    /// Check if a timestamp is in the future
    pub fn isFuture(timestamp: i64) bool {
        return timestamp > getCurrentTimestamp();
    }
};

/// Hash utilities beyond MurmurHash
pub const HashUtils = struct {
    /// Simple FNV-1a hash for strings
    pub fn fnv1a(str: []const u8) u32 {
        var hash: u32 = 2166136261;
        for (str) |byte| {
            hash ^= byte;
            hash = hash *% 16777619;
        }
        return hash;
    }
    
    /// Simple djb2 hash for strings
    pub fn djb2(str: []const u8) u32 {
        var hash: u32 = 5381;
        for (str) |byte| {
            hash = ((hash << 5) +% hash) +% byte;
        }
        return hash;
    }
};

/// Validation utilities
pub const ValidationUtils = struct {
    /// Check if a string is a valid email format (basic)
    pub fn isValidEmail(email: []const u8) bool {
        return StringUtils.contains(email, "@") and email.len > 3;
    }
    
    /// Check if a string is numeric
    pub fn isNumeric(str: []const u8) bool {
        if (str.len == 0) return false;
        for (str) |c| {
            if (!std.ascii.isDigit(c) and c != '.' and c != '-') return false;
        }
        return true;
    }
    
    /// Check if a string is alphanumeric
    pub fn isAlphanumeric(str: []const u8) bool {
        if (str.len == 0) return false;
        for (str) |c| {
            if (!std.ascii.isAlphanumeric(c)) return false;
        }
        return true;
    }
};

// Test functions
test "string utilities" {
    try std.testing.expect(StringUtils.startsWith("hello world", "hello"));
    try std.testing.expect(!StringUtils.startsWith("hello world", "world"));
    
    try std.testing.expect(StringUtils.endsWith("hello world", "world"));
    try std.testing.expect(!StringUtils.endsWith("hello world", "hello"));
    
    try std.testing.expect(StringUtils.contains("hello world", "lo wo"));
    try std.testing.expect(!StringUtils.contains("hello world", "xyz"));
}

test "version comparison" {
    try std.testing.expect(VersionUtils.compare("1.0.0", "1.0.0") == 0);
    try std.testing.expect(VersionUtils.compare("1.0.0", "1.0.1") == -1);
    try std.testing.expect(VersionUtils.compare("1.0.1", "1.0.0") == 1);
    try std.testing.expect(VersionUtils.compare("2.0.0", "1.9.9") == 1);
}

test "json utilities" {
    const allocator = std.testing.allocator;
    
    // Test parsing simple values
    const null_val = try JsonUtils.parseSimple("null", allocator);
    try std.testing.expect(null_val == .null_value);
    
    const bool_val = try JsonUtils.parseSimple("true", allocator);
    try std.testing.expect(bool_val.boolean == true);
    
    const str_val = try JsonUtils.parseSimple("\"hello\"", allocator);
    defer allocator.free(str_val.string);
    try std.testing.expectEqualStrings("hello", str_val.string);
    
    const num_val = try JsonUtils.parseSimple("42.5", allocator);
    try std.testing.expect(num_val.number == 42.5);
}

test "validation utilities" {
    try std.testing.expect(ValidationUtils.isValidEmail("test@example.com"));
    try std.testing.expect(!ValidationUtils.isValidEmail("invalid"));
    
    try std.testing.expect(ValidationUtils.isNumeric("123"));
    try std.testing.expect(ValidationUtils.isNumeric("123.45"));
    try std.testing.expect(!ValidationUtils.isNumeric("abc"));
    
    try std.testing.expect(ValidationUtils.isAlphanumeric("abc123"));
    try std.testing.expect(!ValidationUtils.isAlphanumeric("abc-123"));
}