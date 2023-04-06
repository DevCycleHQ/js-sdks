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
    variableForUser                   0.017 ms ±  2.02 %  (91 runs sampled)
    variableForUser_PB                0.019 ms ±  6.43 %  (85 runs sampled)
    variableForUser - large user      0.034 ms ±  3.46 %  (88 runs sampled)
    variableForUser_PB - large user   0.032 ms ±  1.01 %  (96 runs sampled)
    variableForUser - defaulted       0.006 ms ±  1.24 %  (94 runs sampled)
    variableForUser_PB - defaulted    0.006 ms ±  0.47 %  (95 runs sampled)
    variableForUser - unknown key     0.006 ms ±  0.16 %  (94 runs sampled)
    variableForUser_PB - unknown key  0.006 ms ±  0.49 %  (95 runs sampled)
  variableForUser - Large Config
    variableForUser     0.016 ms ±  1.61 %  (94 runs sampled)
    variableForUser_PB  0.015 ms ±  0.28 %  (98 runs sampled)
  generateBucketedConfigForUser
    generateBucketedConfigForUser               0.643 ms ±  0.14 %  (83 runs sampled)
    generateBucketedConfigForUser - large user  0.330 ms ±  0.15 %  (98 runs sampled)
  generateBucketedConfigForUser - Large Config
    generateBucketedConfigForUser               7.43 ms ±  0.17 %  (87 runs sampled)
    generateBucketedConfigForUser - large user  7.57 ms ±  0.40 %  (85 runs sampled)
  initEventQueue
    initEventQueue  0.011 ms ±  32.80 %  (45 runs sampled)
  setPlatformData
    setPlatformData  0.021 ms ±  0.17 %  (101 runs sampled)
  setConfigData
    setConfigData - small   2.16 ms ±  15.89 %  (65 runs sampled)
    setConfigData - large  29.91 ms ±  26.83 %  (42 runs sampled)
  setClientCustomData
    setClientCustomData - small  0.007 ms ±  0.94 %  (97 runs sampled)
Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        125.799 s
```
