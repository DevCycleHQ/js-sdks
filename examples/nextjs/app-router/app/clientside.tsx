'use client'

import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { ClientIdentity } from './ClientIdentity'
import { ReactNode } from 'react'

const ClientSide = ({ children }: { children: ReactNode }) => {
    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                {children}
                <ClientIdentity />
                <br />
            </main>
        </div>
    )
}

export default ClientSide
