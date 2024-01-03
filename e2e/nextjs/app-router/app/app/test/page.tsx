import { ClientComponent } from '@/app/test/ClientComponent'
import { ServerComponent } from '@/app/test/ServerComponent'

export default async function Page() {
    return (
        <div>
            <ClientComponent />
            <ServerComponent />
        </div>
    )
}
