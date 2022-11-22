/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useRef, useState, useEffect } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    TouchableOpacity,
    AppState,
} from 'react-native'

import 'react-native-get-random-values'
import DeviceInfo from 'react-native-device-info'
import { useDVCClient, useIsDVCInitialized, useVariable, withDVCProvider } from '@devcycle/devcycle-react-sdk'

import Checkmark from './icons/checkmark.svg'
import Terminal from './icons/terminal.svg'
import Heart from './icons/heart.svg'

global.DeviceInfo = DeviceInfo

const ENV_KEY = process.env['NX_CLIENT_KEY'] || 'test_token'
const VARIABLE_KEY = 'test_variable_key'
const DEFAULT_VALUE = false

const user = {
    user_id: 'test_id',
    isAnonymous: false
}

const anonUser = {}

export const App = (): JSX.Element => {
    const [whatsNextYCoord, setWhatsNextYCoord] = useState<number>(0)
    const scrollViewRef = useRef<null | ScrollView>(null)

    const dvcReady = useIsDVCInitialized()
    const [variables, setVariables] = useState({})
    const variable = useVariable(VARIABLE_KEY, DEFAULT_VALUE)
    const client = useDVCClient()

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (appState) => {
            if (appState !== 'active' && client) {
                client.flushEvents() // flush events when not active
            }
        })

        return () => {
            subscription.remove()
        }
    }, [client])

    const identifyUser = () => {
        client && client.identifyUser(user)
            .then((variables) => {
                setVariables(variables)
                console.log('Updated variables: ', variables)
            })
            .catch((err) => console.log({ err }))
    }

    const resetUser = () => {
        client && client.resetUser().catch((err) => console.log({ err }))
    }

    const identifyAnonUser = () => {
        client && client.identifyUser(anonUser).catch((err) => console.log({ err }))
    }

    if (!dvcReady) return <SafeAreaView><Text style={styles.textXL}>DVC is not ready!</Text></SafeAreaView>
    
    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                <ScrollView
                    ref={(ref) => {
                        scrollViewRef.current = ref
                    }}
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}
                >
                    <View style={styles.section}>
                        <Text style={styles.textLg}>Hello there,</Text>
                        <Text style={[styles.textXL, styles.appTitleText]} testID="heading">
              React Native Example App 👋
                        </Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.textMd}>
              Update the ENV_KEY and VARIABLE_KEY values in App.tsx and reload. {'\n\n'}
                        </Text>
                        <Text style={styles.textLg}>
              My device: <Text style={styles.textBold}>{DeviceInfo.getModel()}</Text> {'\n'}
              The value for <Text style={styles.textBold}>{VARIABLE_KEY}</Text> is 
                            <Text style={styles.textBold}>{JSON.stringify(variable.value)}</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.whatsNextButton}
                            onPress={() => identifyUser()}
                        >
                            <Text style={[styles.textMd, styles.textCenter]}>
                  Identify new user
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.whatsNextButton}
                            onPress={() => resetUser()}
                        >
                            <Text style={[styles.textMd, styles.textCenter]}>
                  Reset User
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.whatsNextButton}
                            onPress={() => identifyAnonUser()}
                        >
                            <Text style={[styles.textMd, styles.textCenter]}>
                  Identify Anon User
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.textMd}>
                            {JSON.stringify(variables)}
                        </Text>
                    </View>
                    <View style={styles.section}>
                        <View style={styles.hero}>
                            <View style={styles.heroTitle}>
                                <Checkmark
                                    width={32}
                                    height={32}
                                    stroke="hsla(162, 47%, 50%, 1)"
                                />
                                <Text style={[styles.textLg, styles.heroTitleText]}>
                  You're up and running
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.whatsNextButton}
                                onPress={() => {
                                    scrollViewRef.current?.scrollTo({
                                        x: 0,
                                        y: whatsNextYCoord,
                                    })
                                }}
                            >
                                <Text style={[styles.textMd, styles.textCenter]}>
                  What's next?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View
                        style={styles.section}
                        onLayout={(event) => {
                            const layout = event.nativeEvent.layout
                            setWhatsNextYCoord(layout.y)
                        }}
                    >
                        <View style={styles.shadowBox}>
                            <Text style={[styles.textLg, styles.marginBottomMd]}>
                Next steps
                            </Text>
                            <Text
                                style={[styles.textSm, styles.textLight, styles.marginBottomMd]}
                            >
                Here are some things you can do with Nx:
                            </Text>
                            <View style={styles.listItem}>
                                <Terminal width={24} height={24} stroke="#000000" />
                                <View style={styles.listItemTextContainer}>
                                    <Text style={styles.textSm}>Add UI library</Text>
                                </View>
                            </View>
                            <View style={[styles.codeBlock, styles.marginBottomLg]}>
                                <Text style={[styles.textXS, styles.monospace, styles.comment]}>
                  # Generate UI lib
                                </Text>
                                <Text
                                    style={[
                                        styles.textXS,
                                        styles.monospace,
                                        styles.marginBottomMd,
                                    ]}
                                >
                  nx g @nrwl/react-native:lib ui
                                </Text>
                                <Text style={[styles.textXS, styles.monospace, styles.comment]}>
                  # Add a component
                                </Text>
                                <Text style={[styles.textXS, styles.monospace]}>nx g \</Text>
                                <Text style={[styles.textXS, styles.monospace]}>
                  @nrwl/react-native:component \
                                </Text>
                                <Text style={[styles.textXS, styles.monospace]}>
                  button --project ui
                                </Text>
                            </View>
                            <View style={styles.listItem}>
                                <Terminal width={24} height={24} stroke="#000000" />
                                <View style={styles.listItemTextContainer}>
                                    <Text style={styles.textSm}>
                    View interactive project graph
                                    </Text>
                                </View>
                            </View>
                            <View style={[styles.codeBlock, styles.marginBottomLg]}>
                                <Text style={[styles.textXS, styles.monospace]}>
                  nx graph
                                </Text>
                            </View>
                            <View style={styles.listItem}>
                                <Terminal width={24} height={24} stroke="#000000" />
                                <View style={styles.listItemTextContainer}>
                                    <Text style={styles.textSm}>Run affected commands</Text>
                                </View>
                            </View>
                            <View style={styles.codeBlock}>
                                <Text style={[styles.textXS, styles.monospace, styles.comment]}>
                  # See what's affected by changes
                                </Text>
                                <Text
                                    style={[
                                        styles.textXS,
                                        styles.monospace,
                                        styles.marginBottomMd,
                                    ]}
                                >
                  nx affected:graph
                                </Text>
                                <Text style={[styles.textXS, styles.monospace, styles.comment]}>
                  # run tests for current changes
                                </Text>
                                <Text
                                    style={[
                                        styles.textXS,
                                        styles.monospace,
                                        styles.marginBottomMd,
                                    ]}
                                >
                  nx affected:text
                                </Text>
                                <Text style={[styles.textXS, styles.monospace, styles.comment]}>
                  # run e2e tests for current
                                </Text>
                                <Text style={[styles.textXS, styles.monospace, styles.comment]}>
                  # changes
                                </Text>
                                <Text style={[styles.textXS, styles.monospace]}>
                  nx affected:e2e
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.listItem, styles.love]}>
                            <Text style={styles.textSubtle}>Carefully crafted with </Text>
                            <Heart width={24} height={24} fill="rgba(252, 165, 165, 1)" />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#ffffff',
    },
    codeBlock: {
        backgroundColor: 'rgba(55, 65, 81, 1)',
        marginVertical: 12,
        padding: 12,
        borderRadius: 4,
    },
    monospace: {
        color: '#ffffff',
        fontFamily: 'Courier New',
        marginVertical: 4,
    },
    comment: {
        color: '#cccccc',
    },
    marginBottomMd: {
        marginBottom: 18,
    },
    marginBottomLg: {
        marginBottom: 24,
    },
    textLight: {
        fontWeight: '300',
    },
    textBold: {
        fontWeight: '500',
    },
    textCenter: {
        textAlign: 'center',
    },
    textXS: {
        fontSize: 14,
    },
    textSm: {
        fontSize: 16,
    },
    textMd: {
        fontSize: 18,
    },
    textLg: {
        fontSize: 24,
    },
    textXL: {
        fontSize: 48,
    },
    textContainer: {
        marginVertical: 12,
    },
    textSubtle: {
        color: '#6b7280',
    },
    section: {
        marginVertical: 24,
        marginHorizontal: 12,
    },
    shadowBox: {
        backgroundColor: 'white',
        borderRadius: 24,
        shadowColor: 'black',
        shadowOpacity: 0.15,
        shadowOffset: {
            width: 1,
            height: 4,
        },
        shadowRadius: 12,
        padding: 24,
        marginBottom: 24,
    },
    listItem: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    listItemTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    appTitleText: {
        paddingTop: 12,
        fontWeight: '500',
    },
    hero: {
        borderRadius: 12,
        backgroundColor: '#143055',
        padding: 36,
        marginBottom: 24,
    },
    heroTitle: {
        flex: 1,
        flexDirection: 'row',
    },
    heroTitleText: {
        color: '#ffffff',
        marginLeft: 12,
    },
    whatsNextButton: {
        backgroundColor: '#E6B7C9',
        paddingVertical: 16,
        borderRadius: 8,
        width: '50%',
        marginTop: 24,
    },
    love: {
        marginTop: 12,
        justifyContent: 'center',
    },
})

export default withDVCProvider({
    envKey: ENV_KEY,
    user,
    options: {
        reactNative: true
    }
})(App)
