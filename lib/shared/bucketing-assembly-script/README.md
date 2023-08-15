# DevCycle Bucketing - Assembly Script Lib

This package contains the shared logic used by DevCycle products to evaluate a user's information
against a set of segmentation filters and determine eligibility for a given feature. It also makes decisions about
which variation to serve a user in a multi-variate feature.

This Assembly Script version of the Bucketing library is designed to be used in a cross-platform manner as it
builds a WebAssembly output that can be executed in various JavaScript Web / NodeJS environments and other
server-side SDK environments. WebAssembly is a binary format that can be executed in a 
Web browser, NodeJS, or any other environment that supports it.

See the AssemblyScript Documentation for further details: https://www.assemblyscript.org/introduction.html


## Usage

### Building WebAssembly

```yarn nx build shared-bucketing-as```

See WebAssembly output in `/build` folder.

### Compile Protobuf Files

When working on the Protobuf types you will need to compile those types into JS and AssemblyScript files. To do this:

```yarn nx run shared-bucketing-as:compile-pb```

### Testing

```yarn nx test shared-bucketing-as```

### Benchmarking

```yarn nx run shared-bucketing-as:benchmark```

Current benchmark results on M1 Pro Macbook Pro:

```
Benchmarks:
  variableForUser
    variableForUser                   0.043 ms ±  0.84 %  (81 runs sampled)
    variableForUser_PB                0.020 ms ±  2.56 %  (93 runs sampled)
    variableForUser - large user      0.106 ms ±  0.21 %  (90 runs sampled)
    variableForUser_PB - large user   0.045 ms ±  1.07 %  (95 runs sampled)
    variableForUser - defaulted       0.011 ms ±  0.36 %  (98 runs sampled)
    variableForUser_PB - defaulted    0.008 ms ±  0.65 %  (95 runs sampled)
    variableForUser - unknown key     0.010 ms ±  0.45 %  (95 runs sampled)
    variableForUser_PB - unknown key  0.008 ms ±  1.92 %  (94 runs sampled)
  variableForUser - Large Config
    variableForUser     0.037 ms ±  0.79 %  (79 runs sampled)
    variableForUser_PB  0.017 ms ±  0.48 %  (91 runs sampled)
  generateBucketedConfigForUser
    generateBucketedConfigForUser               0.643 ms ±  0.73 %  (70 runs sampled)
    generateBucketedConfigForUser - large user  0.323 ms ±  0.18 %  (99 runs sampled)
  generateBucketedConfigForUser - Large Config
    generateBucketedConfigForUser               7.37 ms ±  0.79 %  (61 runs sampled)
    generateBucketedConfigForUser - large user  7.36 ms ±  0.36 %  (88 runs sampled)
  initEventQueue
    initEventQueue  0.009 ms ±  40.90 %  (46 runs sampled)
  setPlatformData
    setPlatformData  0.020 ms ±  0.79 %  (82 runs sampled)
  setConfigData
    setConfigData - small   2.15 ms ±  21.54 %  (61 runs sampled)
    setConfigData - large  25.16 ms ±  38.69 %  (42 runs sampled)
  setClientCustomData
    setClientCustomData - small  0.019 ms ±  0.96 %  (87 runs sampled)
Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        114.611 s, estimated 115 s
```
