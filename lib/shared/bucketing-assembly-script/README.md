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


### Flags

To toggle between using the release version and debug version of the WASM module - use `DEVCYCLE_USE_DEBUG_WASM=1` as an environment variable. This will
have a small negative impact on performance, but will give better logging for troubleshooting with DevCycle support.