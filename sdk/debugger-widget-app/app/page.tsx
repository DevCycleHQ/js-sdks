import PageClient from './page.client'
import { SelfTargeting } from './SelfTargeting'
export default function Index({
    searchParams,
}: {
    searchParams?: {
        project_id?: string
        org_id?: string
        environment_id?: string
        user_id?: string
    }
}) {
    const { project_id, org_id, environment_id, user_id } = searchParams || {}
    return (
        <>
            <PageClient
                selfTargeting={
                    <SelfTargeting
                        project_id={project_id ?? ''}
                        org_id={org_id ?? ''}
                        environment_id={environment_id ?? ''}
                        user_id={user_id ?? ''}
                    />
                }
            />
        </>
    )
}
