import { DVCClient } from './Client'
import { DVCUser, DVCVariableSet, ErrorCallback } from './types'

type IdentifyCall = {
    type: 'identify',
    user: DVCUser,
    callback?: ErrorCallback<DVCVariableSet>
}

type ResetCall = {
    type: 'reset',
    callback?: ErrorCallback<DVCVariableSet>
}

type UserChangeCall = IdentifyCall | ResetCall

export class UserQueue {
    client: DVCClient
    userChangeCall?: UserChangeCall

    constructor(client: DVCClient) {
        client.onClientInitialized()
            .then((client) => {
                if (this.userChangeCall?.type === 'identify') {
                    client.identifyUser(this.userChangeCall.user, this.userChangeCall.callback)
                } else if (this.userChangeCall?.type === 'reset') {
                    client.resetUser(this.userChangeCall.callback)
                }
            })
    }

    queueIdentify(user: DVCUser, callback?: ErrorCallback<DVCVariableSet>): void {
        this.userChangeCall = {
            type: 'identify',
            user,
            callback
        }
    }

    queueReset(callback?: ErrorCallback<DVCVariableSet>): void {
        this.userChangeCall = {
            type: 'reset',
            callback
        }
    }
}
