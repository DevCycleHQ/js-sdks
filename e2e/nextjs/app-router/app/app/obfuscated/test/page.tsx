import { ClientComponent } from './ClientComponent'
import { ServerComponent } from './ServerComponent'

export default async function Page() {
    return (
        <div>
            <ClientComponent />
            <ServerComponent />
        </div>
    )
}
