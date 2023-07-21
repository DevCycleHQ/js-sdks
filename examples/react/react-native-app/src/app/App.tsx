/* eslint-disable jsx-a11y/accessible-emoji */
import React, { ReactElement, useRef } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Button,
} from 'react-native'
import 'react-native-get-random-values'
import DeviceInfo from 'react-native-device-info'
import '@react-native-async-storage/async-storage'
import {
    useDevCycleClient,
    useVariableValue,
    withDevCycleProvider,
} from '@devcycle/react-native-client-sdk'

global.DeviceInfo = DeviceInfo

const SDK_KEY = process.env.DEVCYCKE_CLIENT_KEY || '<DEVCYCLE_CLIENT_SDK_KEY>'
const user = {
    user_id: 'user-id',
    email: 'auto@devcycle.com',
    customData: {
        cps: 'Matthew',
        cpn: 777,
        cpb: true,
    },
    isAnonymous: false,
}

const Separator = () => <View style={styles.separator} />

export const App = (): ReactElement => {
    const devcycleClient = useDevCycleClient()

    const scrollViewRef = useRef<null | ScrollView>(null)
    const boolVar = useVariableValue('bool-var', false)
    const stringVar = useVariableValue('string-var', 'default string')
    const numberVar = useVariableValue('number-var', 0)
    const jsonVar = useVariableValue('json-var', { foo: 'bar' })

    const allFeatures = devcycleClient.allFeatures()
    const allVariables = devcycleClient.allVariables()

    const identifyUser = () => {
        devcycleClient.identifyUser({ user_id: 'new-user-id' })
    }

    const resetUser = () => {
        devcycleClient.resetUser()
    }

    const event = {
        type: 'my_event_type',
        date: Date.now(),
        target: 'my_target',
        value: 5,
        metaData: {
            key: 'value',
        },
    }
    const trackEvent = () => {
        devcycleClient.track(event)
    }

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
                        <Text
                            style={[
                                styles.textLg,
                                styles.appTitleText,
                                styles.textCenter,
                            ]}
                        >
                            Welcome 🤖
                        </Text>
                    </View>
                    <View style={[styles.section, styles.flexContainer]}>
                        <Button
                            color="#1e4ed2"
                            onPress={identifyUser}
                            title="Identify User"
                        />
                        <Button
                            color="#1e4ed2"
                            onPress={resetUser}
                            title="Reset User"
                        />
                        <Button
                            color="#1e4ed2"
                            onPress={trackEvent}
                            title="Track Event"
                        />
                    </View>
                    <Separator />
                    <View style={styles.section}>
                        <Text style={[styles.textLg, styles.textBold]}>
                            Variable Values
                        </Text>
                        <Text style={[styles.textMd, styles.textLight]}>
                            {`bool-var: ${boolVar}`}
                        </Text>
                        <Text style={[styles.textMd, styles.textLight]}>
                            {`string-var: ${stringVar}`}
                        </Text>
                        <Text style={[styles.textMd, styles.textLight]}>
                            {`number-var: ${numberVar}`}
                        </Text>
                        <Text style={[styles.textMd, styles.textLight]}>
                            {`json-var: ${JSON.stringify(jsonVar)}`}
                        </Text>
                    </View>
                    <Separator />
                    <View style={styles.section}>
                        <Text style={[styles.textLg, styles.textBold]}>
                            All Features
                        </Text>
                        <Text style={[styles.textMd, styles.textLight]}>
                            {`${JSON.stringify(allFeatures, null, 2)}`}
                        </Text>
                    </View>
                    <Separator />
                    <View style={styles.section}>
                        <Text style={[styles.textLg, styles.textBold]}>
                            All Variables
                        </Text>
                        <Text style={[styles.textMd, styles.textLight]}>
                            {`${JSON.stringify(allVariables, null, 2)}`}
                        </Text>
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
    marginBottomSm: {
        marginBottom: 6,
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
    text2XS: {
        fontSize: 12,
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
    section: {
        marginVertical: 12,
        marginHorizontal: 12,
    },
    appTitleText: {
        paddingTop: 8,
        fontWeight: '500',
    },
    separator: {
        marginVertical: 8,
        borderBottomColor: '#737373',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    flexContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
    },
})

export default withDevCycleProvider({
    sdkKey: SDK_KEY,
    user: user,
    options: { logLevel: 'debug' },
})(App)
