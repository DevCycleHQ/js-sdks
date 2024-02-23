import { getAccessToken } from '@auth0/nextjs-auth0'

const getUserProfile = async (project_id: string) => {
    const { accessToken } = await getAccessToken()

    const userProfile = await fetch(
        `https://api.devcycle.com/v1/projects/${project_id}/userProfile/current`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    )

    if (userProfile.ok) {
        return userProfile.json()
    } else {
        return null
    }
}

const getOverrides = async (project_id: string) => {
    const { accessToken } = await getAccessToken()

    const overrides = await fetch(
        `https://api.devcycle.com/v1/projects/${project_id}/overrides/current`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            next: {
                tags: ['overrides'],
            },
        },
    )

    if (overrides.ok) {
        return overrides.json()
    } else {
        return []
    }
}

export const SelfTargeting = async ({
    project_id,
    org_id,
    environment_id,
    user_id,
}: {
    project_id: string
    org_id: string
    environment_id: string
    user_id: string
}) => {
    const userProfile = await getUserProfile(project_id)

    if (!userProfile.dvcUserId) {
        return <div>No Self-Targeting User Set Up!</div>
    }

    if (userProfile.dvcUserId != user_id) {
        return (
            <div className={'flex flex-col mt-3 gap-3'}>
                <div>Not Using Self-Targeting User on this Page</div>
                <div className={'grid grid-cols-2 gap-3'}>
                    <div>Current User Id</div>
                    <div>{user_id}</div>
                    <div>Self-Targeting Id</div>
                    <div>{userProfile.dvcUserId}</div>
                </div>
            </div>
        )
    }

    const overrides = await getOverrides(project_id)
    const filteredOverrides = overrides.filter(
        (override: any) => override._environment === environment_id,
    )
    return (
        <div className={'mt-5'}>
            <h2 className={'font-bold'}>Self Targeting Overrides</h2>
            {filteredOverrides.map((override) => {
                return (
                    <div key={override._feature} className={'grid grid-cols-2'}>
                        <div>{override.featureName}</div>
                        <div>{override.variationName}</div>
                    </div>
                )
            })}
        </div>
    )
}
