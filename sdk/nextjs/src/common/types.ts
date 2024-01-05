import type { getDevCycleServerData } from '../server/devcycleServerData'

export type DevCycleServerData = Awaited<
    ReturnType<typeof getDevCycleServerData>
>
