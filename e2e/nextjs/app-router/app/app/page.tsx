import styles from './page.module.css'
import { ClientComponent } from '@/app/ClientComponent'
import { ServerComponent } from '@/app/ServerComponent'

export default function Home() {
    return (
        <main className={styles.main}>
            <div className={styles.description}></div>
            <ClientComponent />
            <ServerComponent />
        </main>
    )
}
