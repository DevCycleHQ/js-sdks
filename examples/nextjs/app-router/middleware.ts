import { middleware } from '@devcycle/next-sdk/server'

export default middleware(process.env.DEVCYCLE_CLIENT_SDK_KEY ?? '')
