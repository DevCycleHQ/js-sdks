# DevCycle EdgeWorker Server SDK

This SDK supports EdgeWorker environments like CloudFlare Worker WebWorker environments.
It acts as a server-side SDK for EdgeWorker environments, either in local or cloud bucketing mode. 
Local bucketing mode will make all variable evaluations locally in the SDK after fetching the latest 
project configuration from our CDN. Whereas cloud bucketing mode will make a request to the DevCycle bucketing API, 
hosted on a Cloudflare Worker, for all variable evaluations. See the docs for more information.

### Installation

Our library can be found on npm and installed by the following:

```
npm install @devcycle/edge-worker-server-sdk
```

### Usage

To find usage documentation, visit our [docs](https://docs.devcycle.com/docs/sdk/server-side-sdks/node#usage).
