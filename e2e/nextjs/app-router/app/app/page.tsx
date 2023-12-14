import { ClientComponent } from '@/app/ClientComponent'
import { ServerComponent } from '@/app/ServerComponent'

export default function Home() {
    return (
        <main>
            <ClientComponent />
            <ServerComponent />
        </main>
    )
}
