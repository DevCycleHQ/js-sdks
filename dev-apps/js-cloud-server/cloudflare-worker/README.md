# DevCycle JS Cloud Bucketing Server SDK - Cloudflare Worker Example App

Example app for using the DevCycle JS Cloud Bucketing Server SDK with Cloudflare Workers.

## Serve Worker Locally

1. Run `yarn` in the root of this repo to install all dependencies.
2. Set up a `.dev.vars` file in this folder containing your DevCycle Server SDK Key for your project:
    - ```DEVCYCLE_SERVER_SDK_KEY=<YOUR SERVER SDK KEY>```
3. Run this worker locally using: `yarn nx serve example-js-cloud-server-sdk-cf-worker`

## Deploy Worker to Cloudflare

1. Run `yarn` in the root of this repo to install all dependencies.
2. Set a `DEVCYCLE_SERVER_SDK_KEY` secret in Cloudflare using the wrangler CLI from the root:
   - ```yarn wrangler secret put DEVCYCLE_SERVER_SDK_KEY -c dev-apps/js-cloud-server/cloudflare-worker/wrangler.toml```
   - you may be prompted to login to Wrangler with your Cloudflare account
3. Set your Cloudflare account ID in `wrangler.toml`:
   - you can find this under your account's profile on the Cloudflare dashboard
4. Deploy this worker to Cloudflare using: `yarn nx deploy example-js-cloud-server-sdk-cf-worker`

