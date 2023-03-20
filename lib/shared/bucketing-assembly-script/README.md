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

### Testing

```yarn nx test shared-bucketing-as```

### Benchmarking

```yarn nx run shared-bucketing-as:benchmark```

Current benchmark results on M1 Pro Macbook Pro:

```
Benchmarks:
  variableForUser
    variableForUser                   0.046 ms ±  0.95 %  (79 runs sampled)
    variableForUser_PB                0.024 ms ±  2.47 %  (91 runs sampled)
    variableForUser - large user      0.124 ms ±  6.59 %  (87 runs sampled)
    variableForUser_PB - large user   0.049 ms ±  0.38 %  (95 runs sampled)
    variableForUser - defaulted       0.011 ms ±  0.50 %  (97 runs sampled)
    variableForUser_PB - defaulted    0.009 ms ±  0.37 %  (95 runs sampled)
    variableForUser - unknown key     0.011 ms ±  0.32 %  (97 runs sampled)
    variableForUser_PB - unknown key  0.009 ms ±  2.37 %  (93 runs sampled)
  variableForUser - Large Config
    variableForUser     0.042 ms ±  1.08 %  (79 runs sampled)
    variableForUser_PB  0.022 ms ±  1.20 %  (93 runs sampled)
  generateBucketedConfigForUser
    generateBucketedConfigForUser               0.701 ms ±  1.66 %  (67 runs sampled)
    generateBucketedConfigForUser - large user  0.343 ms ±  0.58 %  (96 runs sampled)
  generateBucketedConfigForUser - Large Config
    generateBucketedConfigForUser               7.67 ms ±  1.10 %  (63 runs sampled)
    generateBucketedConfigForUser - large user  7.78 ms ±  0.41 %  (84 runs sampled)
  initEventQueue
    initEventQueue  0.009 ms ±  40.68 %  (50 runs sampled)
  setPlatformData
    setPlatformData  0.021 ms ±  0.78 %  (80 runs sampled)
  setConfigData
    setConfigData - small   2.24 ms ±  21.92 %  (61 runs sampled)
    setConfigData - large  22.65 ms ±  34.44 %  (43 runs sampled)
  setClientCustomData
    setClientCustomData - small  0.019 ms ±  1.72 %  (82 runs sampled)
Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        114.675 s, estimated 115 s
Ran all test suites.
```
