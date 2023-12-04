import type { getDevCycleServerData } from '../server/devcycleServerData'

export type DevCycleServerData = Awaited<
    ReturnType<typeof getDevCycleServerData>
>

export type DevCycleServerDataForClient = Omit<
    DevCycleServerData,
    'populatedUser'
>
