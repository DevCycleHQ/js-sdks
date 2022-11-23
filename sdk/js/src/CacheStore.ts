import { BucketedUserConfig, DVCLogger } from '@devcycle/types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DVCPopulatedUser } from './User'

export const StoreKey = {
  Config: 'dvc:config',
  User: 'dvc:user',
  AnonUserId: 'dvc:anonymous_user_id'
}

export abstract class CacheStore {
  store?: Storage | typeof AsyncStorage
  logger?: DVCLogger

  constructor(localStorage?: Storage | typeof AsyncStorage, logger?: DVCLogger) {
      this.store = localStorage
      this.logger = logger
  }

  save(storeKey: string, data: unknown): void {
      this.store?.setItem(storeKey, JSON.stringify(data))
  }

  load(storeKey: string): string | null | undefined | any {
      return this.store?.getItem(storeKey)
  }

  remove(storeKey: string): void {
      this.store?.removeItem(storeKey)
  }

  saveConfig(data: BucketedUserConfig): void {
      this.save(StoreKey.Config, data)
      this.logger?.info('Successfully saved config to local storage')
  }

  loadConfig(): string | null | undefined {
      return this.load(StoreKey.Config)
  }

  saveUser(user: DVCPopulatedUser): void {
      if (!user) {
          throw new Error('No user to save')
      }
      this.save(StoreKey.User, user)
      this.logger?.info('Successfully saved user to local storage')
  }

  loadUser(): string | null | undefined {
      return this.load(StoreKey.User)
  }
}

export default CacheStore