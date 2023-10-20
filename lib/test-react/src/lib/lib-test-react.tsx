'use client'
import styles from './lib-test-react.module.css'

/* eslint-disable-next-line */
export interface LibTestReactProps {}

export function LibTestReact(props: LibTestReactProps) {
    return (
        <div className={styles['container']}>
            <h1>Welcome to LibTestReact!</h1>
        </div>
    )
}

export default LibTestReact
