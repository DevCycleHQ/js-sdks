import {
    ExistingProvider,
    Injectable,
    Provider,
    Scope,
} from '@nestjs/common/interfaces'
import { DevCycleClient } from '@devcycle/nodejs-server-sdk'
import { ClsService } from 'nestjs-cls'
import {
    isClassProvider,
    isFactoryProvider,
    isValueProvider,
} from '@nestjs/core/injector/helpers/provider-classifier'

const isExistingProvider = <T = any>(
    provider: Provider,
): provider is ExistingProvider<T> => {
    return 'useExisting' in provider
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface Type<T = any> extends Function {
    new (...args: any[]): T
}

const GetInjectionTokens = <T extends Provider>(provider: T) => {
    if (isFactoryProvider(provider)) {
        return provider.inject ?? []
    } else if (isClassProvider(provider)) {
        return []
    } else if (isValueProvider(provider)) {
        return []
    } else if (isExistingProvider(provider)) {
        return []
    }
    return Reflect.getMetadata('design:paramtypes', provider) ?? []
}

export const BranchByVariable = <T extends Provider, K extends Provider, Token>(
    key: string,
    Token: Token,
    OldProvider: T,
    NewProvider: K,
) => {
    // get injection token metadata nest uses for injection
    const oldInjectionTokens = GetInjectionTokens(OldProvider)
    const newInjectionTokens = GetInjectionTokens(NewProvider)

    return {
        provide: OldProvider,
        useFactory: async (
            devcycleClient: DevCycleClient,
            clsService: ClsService,
            ...injectedProviders: any[]
        ) => {
            // if (!clsService.get('dvc_user')) {
            //     throw new Error(
            //         'Missing user context. Is the DevCycleModule imported?',
            //     )
            // }
            const enabled = devcycleClient.variableValue(
                { user_id: 'test' },
                key,
                false,
            )
            const ProviderToUse = enabled ? NewProvider : OldProvider

            const injectedProvidersToUse = enabled
                ? injectedProviders.slice(oldInjectionTokens.length)
                : injectedProviders.slice(0, oldInjectionTokens.length)

            if (isFactoryProvider(ProviderToUse)) {
                return ProviderToUse.useFactory(...injectedProvidersToUse)
            } else if (
                isClassProvider(ProviderToUse) ||
                isValueProvider(ProviderToUse) ||
                isExistingProvider(ProviderToUse)
            ) {
                return ProviderToUse
            } else {
                return new (ProviderToUse as Type)(...injectedProvidersToUse)
            }
        },
        scope: Scope.REQUEST,
        inject: [
            DevCycleClient,
            ClsService,
            ...oldInjectionTokens,
            ...newInjectionTokens,
        ],
    }
}
