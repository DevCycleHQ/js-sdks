const std = @import("std");
const json = std.json;
const Allocator = std.mem.Allocator;
const ArrayList = std.ArrayList;
const HashMap = std.HashMap;

// Variable types enum
pub const VariableType = enum(u32) {
    Boolean = 0,
    Number = 1,
    String = 2,
    JSON = 3,

    pub fn fromString(str: []const u8) !VariableType {
        if (std.mem.eql(u8, str, "Boolean")) return .Boolean;
        if (std.mem.eql(u8, str, "Number")) return .Number;
        if (std.mem.eql(u8, str, "String")) return .String;
        if (std.mem.eql(u8, str, "JSON")) return .JSON;
        return error.UnknownVariableType;
    }

    pub fn toString(self: VariableType) []const u8 {
        return switch (self) {
            .Boolean => "Boolean",
            .Number => "Number", 
            .String => "String",
            .JSON => "JSON",
        };
    }
};

// JSON Value type for handling arbitrary JSON data
pub const JsonValue = union(enum) {
    string: []const u8,
    number: f64,
    boolean: bool,
    null_value: void,
    object: JsonObject,
    array: JsonArray,

    pub fn deinit(self: *JsonValue, allocator: Allocator) void {
        switch (self.*) {
            .string => |str| allocator.free(str),
            .object => |*obj| obj.deinit(),
            .array => |*arr| arr.deinit(),
            else => {},
        }
    }

    pub fn clone(self: JsonValue, allocator: Allocator) Allocator.Error!JsonValue {
        return switch (self) {
            .string => |str| JsonValue{ .string = try allocator.dupe(u8, str) },
            .number => |num| JsonValue{ .number = num },
            .boolean => |b| JsonValue{ .boolean = b },
            .null_value => JsonValue{ .null_value = {} },
            .object => |obj| JsonValue{ .object = try cloneJsonObject(obj, allocator) },
            .array => |arr| JsonValue{ .array = try cloneJsonArray(arr, allocator) },
        };
    }
};

pub const JsonObject = HashMap([]const u8, JsonValue, std.hash_map.StringContext, std.hash_map.default_max_load_percentage);
pub const JsonArray = ArrayList(JsonValue);

// Helper functions for cloning JsonObject and JsonArray
fn cloneJsonObject(obj: JsonObject, allocator: Allocator) Allocator.Error!JsonObject {
    var new_obj = JsonObject.init(allocator);
    var iter = obj.iterator();
    while (iter.next()) |entry| {
        const cloned_key = try allocator.dupe(u8, entry.key_ptr.*);
        const cloned_value = try entry.value_ptr.clone(allocator);
        try new_obj.put(cloned_key, cloned_value);
    }
    return new_obj;
}

fn cloneJsonArray(arr: JsonArray, allocator: Allocator) Allocator.Error!JsonArray {
    var new_arr = JsonArray.init(allocator);
    for (arr.items) |item| {
        const cloned_item = try item.clone(allocator);
        try new_arr.append(cloned_item);
    }
    return new_arr;
}

// Bounded hash for bucketing
pub const BoundedHash = struct {
    rollout_hash: f64,
    bucketing_hash: f64,
};

// Evaluation reason
pub const EvalReason = struct {
    reason: []const u8,
    details: []const u8,
    target_id: []const u8,

    pub fn init(reason: []const u8, details: []const u8, target_id: []const u8, allocator: Allocator) !EvalReason {
        return EvalReason{
            .reason = try allocator.dupe(u8, reason),
            .details = try allocator.dupe(u8, details),
            .target_id = try allocator.dupe(u8, target_id),
        };
    }

    pub fn deinit(self: *EvalReason, allocator: Allocator) void {
        allocator.free(self.reason);
        allocator.free(self.details);
        allocator.free(self.target_id);
    }

    pub fn clone(self: EvalReason, allocator: Allocator) !EvalReason {
        return EvalReason.init(self.reason, self.details, self.target_id, allocator);
    }

    pub fn toJsonString(self: EvalReason, allocator: Allocator) ![]const u8 {
        return std.fmt.allocPrint(allocator, 
            "{{\"reason\":\"{s}\",\"details\":\"{s}\",\"target_id\":\"{s}\"}}", 
            .{ self.reason, self.details, self.target_id });
    }
};

// SDK Variable
pub const SDKVariable = struct {
    id: []const u8,
    variable_type: VariableType,
    key: []const u8,
    value: JsonValue,
    feature: ?[]const u8,
    eval_reason: EvalReason,

    pub fn init(
        id: []const u8,
        variable_type: VariableType,
        key: []const u8,
        value: JsonValue,
        feature: ?[]const u8,
        eval_reason: EvalReason,
        allocator: Allocator
    ) !SDKVariable {
        return SDKVariable{
            .id = try allocator.dupe(u8, id),
            .variable_type = variable_type,
            .key = try allocator.dupe(u8, key),
            .value = try value.clone(allocator),
            .feature = if (feature) |f| try allocator.dupe(u8, f) else null,
            .eval_reason = try eval_reason.clone(allocator),
        };
    }

    pub fn deinit(self: *SDKVariable, allocator: Allocator) void {
        allocator.free(self.id);
        allocator.free(self.key);
        self.value.deinit(allocator);
        if (self.feature) |f| allocator.free(f);
        self.eval_reason.deinit(allocator);
    }

    pub fn toJsonString(self: SDKVariable, allocator: Allocator) ![]const u8 {
        const eval_json = try self.eval_reason.toJsonString(allocator);
        defer allocator.free(eval_json);

        const feature_str = if (self.feature) |f| f else "null";
        
        return std.fmt.allocPrint(allocator,
            "{{\"_id\":\"{s}\",\"type\":\"{s}\",\"key\":\"{s}\",\"value\":{},\"_feature\":\"{s}\",\"eval\":{s}}}",
            .{ self.id, self.variable_type.toString(), self.key, self.value, feature_str, eval_json });
    }
};

// Custom data type (for user custom data)
pub const CustomData = struct {
    data: JsonObject,

    pub fn init(allocator: Allocator) CustomData {
        return CustomData{
            .data = JsonObject.init(allocator),
        };
    }

    pub fn deinit(self: *CustomData, allocator: Allocator) void {
        var iter = self.data.iterator();
        while (iter.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            entry.value_ptr.deinit(allocator);
        }
        self.data.deinit();
    }

    pub fn fromJsonString(_: []const u8, allocator: Allocator) !CustomData {
        // TODO: Implement JSON parsing
        const result = CustomData.init(allocator);
        return result;
    }
};

// Platform data
pub const PlatformData = struct {
    platform: []const u8,
    platform_version: []const u8,
    sdk_type: []const u8,
    sdk_version: []const u8,
    sdk_platform: ?[]const u8,
    hostname: ?[]const u8,

    pub fn init(
        platform: []const u8,
        platform_version: []const u8,
        sdk_type: []const u8,
        sdk_version: []const u8,
        sdk_platform: ?[]const u8,
        hostname: ?[]const u8,
        allocator: Allocator
    ) !PlatformData {
        return PlatformData{
            .platform = try allocator.dupe(u8, platform),
            .platform_version = try allocator.dupe(u8, platform_version),
            .sdk_type = try allocator.dupe(u8, sdk_type),
            .sdk_version = try allocator.dupe(u8, sdk_version),
            .sdk_platform = if (sdk_platform) |sp| try allocator.dupe(u8, sp) else null,
            .hostname = if (hostname) |h| try allocator.dupe(u8, h) else null,
        };
    }

    pub fn deinit(self: *PlatformData, allocator: Allocator) void {
        allocator.free(self.platform);
        allocator.free(self.platform_version);
        allocator.free(self.sdk_type);
        allocator.free(self.sdk_version);
        if (self.sdk_platform) |sp| allocator.free(sp);
        if (self.hostname) |h| allocator.free(h);
    }

    pub fn fromJsonString(_: []const u8, allocator: Allocator) !PlatformData {
        // TODO: Implement JSON parsing for platform data
        return PlatformData.init("NodeJS", "16.0", "server", "1.0", null, null, allocator);
    }
};

// DVC User
pub const DVCUser = struct {
    user_id: []const u8,
    email: ?[]const u8,
    name: ?[]const u8,
    language: ?[]const u8,
    country: ?[]const u8,
    app_build: f64,
    app_version: ?[]const u8,
    device_model: ?[]const u8,
    custom_data: ?CustomData,
    private_custom_data: ?CustomData,

    pub fn init(
        user_id: []const u8,
        email: ?[]const u8,
        name: ?[]const u8,
        language: ?[]const u8,
        country: ?[]const u8,
        app_build: f64,
        app_version: ?[]const u8,
        device_model: ?[]const u8,
        custom_data: ?CustomData,
        private_custom_data: ?CustomData,
        allocator: Allocator
    ) !DVCUser {
        return DVCUser{
            .user_id = try allocator.dupe(u8, user_id),
            .email = if (email) |e| try allocator.dupe(u8, e) else null,
            .name = if (name) |n| try allocator.dupe(u8, n) else null,
            .language = if (language) |l| try allocator.dupe(u8, l) else null,
            .country = if (country) |c| try allocator.dupe(u8, c) else null,
            .app_build = app_build,
            .app_version = if (app_version) |av| try allocator.dupe(u8, av) else null,
            .device_model = if (device_model) |dm| try allocator.dupe(u8, dm) else null,
            .custom_data = custom_data,
            .private_custom_data = private_custom_data,
        };
    }

    pub fn deinit(self: *DVCUser, allocator: Allocator) void {
        allocator.free(self.user_id);
        if (self.email) |e| allocator.free(e);
        if (self.name) |n| allocator.free(n);
        if (self.language) |l| allocator.free(l);
        if (self.country) |c| allocator.free(c);
        if (self.app_version) |av| allocator.free(av);
        if (self.device_model) |dm| allocator.free(dm);
        if (self.custom_data) |*cd| cd.deinit(allocator);
        if (self.private_custom_data) |*pcd| pcd.deinit(allocator);
    }

    pub fn fromJsonString(_: []const u8, allocator: Allocator) !DVCUser {
        // TODO: Implement JSON parsing for user data
        // For now, create a basic user with just user_id
        return DVCUser.init("test_user", null, null, null, null, 0.0, null, null, null, null, allocator);
    }
};

// DVC Populated User (user + platform data)
pub const DVCPopulatedUser = struct {
    user: DVCUser,
    platform: []const u8,
    platform_version: []const u8,
    sdk_type: []const u8,
    sdk_version: []const u8,
    sdk_platform: ?[]const u8,
    hostname: ?[]const u8,
    created_date: i64,
    last_seen_date: i64,

    pub fn fromDVCUser(user: DVCUser, allocator: Allocator) !DVCPopulatedUser {
        // Use a default timestamp since WASM doesn't have access to system time
        const default_timestamp: i64 = 1640995200; // 2022-01-01 in seconds since epoch
        return DVCPopulatedUser{
            .user = user,
            .platform = try allocator.dupe(u8, "NodeJS"),
            .platform_version = try allocator.dupe(u8, "16.0"),
            .sdk_type = try allocator.dupe(u8, "server"),
            .sdk_version = try allocator.dupe(u8, "1.0"),
            .sdk_platform = null,
            .hostname = null,
            .created_date = default_timestamp,
            .last_seen_date = default_timestamp,
        };
    }

    pub fn deinit(self: *DVCPopulatedUser, allocator: Allocator) void {
        allocator.free(self.platform);
        allocator.free(self.platform_version);
        allocator.free(self.sdk_type);
        allocator.free(self.sdk_version);
        if (self.sdk_platform) |sp| allocator.free(sp);
        if (self.hostname) |h| allocator.free(h);
        // Note: user is passed by value, so it doesn't need deinitialization here
    }
};

// Basic Feature and Variable structures for configuration
pub const Variable = struct {
    id: []const u8,
    key: []const u8,
    type: VariableType,

    pub fn init(id: []const u8, key: []const u8, variable_type: VariableType, allocator: Allocator) !Variable {
        return Variable{
            .id = try allocator.dupe(u8, id),
            .key = try allocator.dupe(u8, key),
            .type = variable_type,
        };
    }

    pub fn deinit(self: *Variable, allocator: Allocator) void {
        allocator.free(self.id);
        allocator.free(self.key);
    }
};

pub const Feature = struct {
    id: []const u8,
    key: []const u8,
    type: []const u8,
    variations: ArrayList(Variation),

    pub fn init(id: []const u8, key: []const u8, feature_type: []const u8, allocator: Allocator) !Feature {
        return Feature{
            .id = try allocator.dupe(u8, id),
            .key = try allocator.dupe(u8, key),
            .type = try allocator.dupe(u8, feature_type),
            .variations = ArrayList(Variation).init(allocator),
        };
    }

    pub fn deinit(self: *Feature, allocator: Allocator) void {
        allocator.free(self.id);
        allocator.free(self.key);
        allocator.free(self.type);
        for (self.variations.items) |*variation| {
            variation.deinit(allocator);
        }
        self.variations.deinit();
    }
};

pub const Variation = struct {
    id: []const u8,
    name: []const u8,
    key: []const u8,

    pub fn init(id: []const u8, name: []const u8, key: []const u8, allocator: Allocator) !Variation {
        return Variation{
            .id = try allocator.dupe(u8, id),
            .name = try allocator.dupe(u8, name),
            .key = try allocator.dupe(u8, key),
        };
    }

    pub fn deinit(self: *Variation, allocator: Allocator) void {
        allocator.free(self.id);
        allocator.free(self.name);
        allocator.free(self.key);
    }
};

// Project and Environment for configuration
pub const Project = struct {
    id: []const u8,
    key: []const u8,

    pub fn init(id: []const u8, key: []const u8, allocator: Allocator) !Project {
        return Project{
            .id = try allocator.dupe(u8, id),
            .key = try allocator.dupe(u8, key),
        };
    }

    pub fn deinit(self: *Project, allocator: Allocator) void {
        allocator.free(self.id);
        allocator.free(self.key);
    }
};

pub const Environment = struct {
    id: []const u8,
    key: []const u8,

    pub fn init(id: []const u8, key: []const u8, allocator: Allocator) !Environment {
        return Environment{
            .id = try allocator.dupe(u8, id),
            .key = try allocator.dupe(u8, key),
        };
    }

    pub fn deinit(self: *Environment, allocator: Allocator) void {
        allocator.free(self.id);
        allocator.free(self.key);
    }
};

// Configuration body
pub const ConfigBody = struct {
    project: Project,
    environment: Environment,
    features: ArrayList(Feature),
    variables: ArrayList(Variable),
    etag: ?[]const u8,
    client_sdk_key: ?[]const u8,

    pub fn init(project: Project, environment: Environment, allocator: Allocator) ConfigBody {
        return ConfigBody{
            .project = project,
            .environment = environment,
            .features = ArrayList(Feature).init(allocator),
            .variables = ArrayList(Variable).init(allocator),
            .etag = null,
            .client_sdk_key = null,
        };
    }

    pub fn deinit(self: *ConfigBody, allocator: Allocator) void {
        self.project.deinit(allocator);
        self.environment.deinit(allocator);
        for (self.features.items) |*feature| {
            feature.deinit(allocator);
        }
        self.features.deinit();
        for (self.variables.items) |*variable| {
            variable.deinit(allocator);
        }
        self.variables.deinit();
        if (self.etag) |e| allocator.free(e);
        if (self.client_sdk_key) |csk| allocator.free(csk);
    }

    pub fn fromJsonString(_: []const u8, allocator: Allocator) !ConfigBody {
        // TODO: Implement JSON parsing for config data
        const project = try Project.init("test_project", "test_key", allocator);
        const environment = try Environment.init("test_env", "test_env_key", allocator);
        return ConfigBody.init(project, environment, allocator);
    }
};

// Bucketed config result
pub const BucketedUserConfig = struct {
    project: Project,
    environment: Environment,
    features: JsonObject,
    variables: JsonObject,

    pub fn init(project: Project, environment: Environment, allocator: Allocator) BucketedUserConfig {
        return BucketedUserConfig{
            .project = project,
            .environment = environment,
            .features = JsonObject.init(allocator),
            .variables = JsonObject.init(allocator),
        };
    }

    pub fn deinit(self: *BucketedUserConfig, allocator: Allocator) void {
        self.project.deinit(allocator);
        self.environment.deinit(allocator);
        
        var features_iter = self.features.iterator();
        while (features_iter.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            entry.value_ptr.deinit(allocator);
        }
        self.features.deinit();

        var variables_iter = self.variables.iterator();
        while (variables_iter.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            entry.value_ptr.deinit(allocator);
        }
        self.variables.deinit();
    }

    pub fn toJsonString(self: BucketedUserConfig, allocator: Allocator) ![]const u8 {
        // TODO: Implement JSON serialization for bucketed config
        return std.fmt.allocPrint(allocator, "{{\"project\":{{\"_id\":\"{s}\",\"key\":\"{s}\"}},\"environment\":{{\"_id\":\"{s}\",\"key\":\"{s}\"}},\"features\":{{}},\"variables\":{{}}}}", 
            .{ self.project.id, self.project.key, self.environment.id, self.environment.key });
    }
};

// Variable response for bucketing
pub const BucketedVariableResponse = struct {
    variable: SDKVariable,
    variation: Variation,
    feature: Feature,

    pub fn init(variable: SDKVariable, variation: Variation, feature: Feature) BucketedVariableResponse {
        return BucketedVariableResponse{
            .variable = variable,
            .variation = variation,
            .feature = feature,
        };
    }

    pub fn deinit(self: *BucketedVariableResponse, allocator: Allocator) void {
        self.variable.deinit(allocator);
        self.variation.deinit(allocator);
        self.feature.deinit(allocator);
    }
};