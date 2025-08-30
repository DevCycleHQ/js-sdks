const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.resolveTargetQuery(.{
        .cpu_arch = .wasm32,
        .os_tag = .freestanding,
        .cpu_features_add = std.Target.wasm.featureSet(&[_]std.Target.wasm.Feature{}),
    });

    const optimize = b.standardOptimizeOption(.{});

    // Main bucketing library
    const lib = b.addExecutable(.{
        .name = "bucketing-lib",
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    // Configure for WASM
    lib.entry = .disabled;
    lib.rdynamic = true;
    lib.import_memory = true;
    lib.stack_size = std.wasm.page_size;

    // Export memory
    lib.export_memory = true;

    // Install artifacts
    b.installArtifact(lib);

    // Tests
    const lib_unit_tests = b.addTest(.{
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    const run_lib_unit_tests = b.addRunArtifact(lib_unit_tests);

    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_lib_unit_tests.step);

    // Build step for different optimization levels
    const debug_step = b.step("debug", "Build debug version");
    const release_step = b.step("release", "Build release version");
    const worker_step = b.step("worker", "Build worker version");

    debug_step.dependOn(&lib.step);
    release_step.dependOn(&lib.step);  
    worker_step.dependOn(&lib.step);
}