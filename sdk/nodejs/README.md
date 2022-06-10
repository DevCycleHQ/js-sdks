# DevCycle NodeJS Server SDK

The NodeJS Server SDK for DevCycle.

This SDK uses local bucketing to perform all user segmentation and bucketing locally in the SDK, 
providing immediate responses to variable and feature requests for a user. 
The SDK will download the latest version of your DevCycle environments configuration from a CDN on initialization,
and will periodically poll the CDN for configuration changes.

### Installation

Our library can be found on npm and installed by the following:

```
npm install @devcycle/nodejs-server-sdk
```

### Usage

To find usage documentation, visit our [docs](https://docs.devcycle.com/docs/sdk/server-side-sdks/node#usage).