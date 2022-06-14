import stringify from 'json-stable-stringify'
import debounce from 'lodash/debounce'
import uniqBy from 'lodash/uniqBy'
import { action, computed, observable, runInAction } from 'mobx'
import { Platform } from 'react-native'
import { v4 as newUuid } from 'uuid'

import { UcBuddy, UcBuddyGroup } from '../api/brekekejs'
import { SyncPnToken } from '../api/syncPnToken'
import { RnAsyncStorage } from '../components/Rn'
import { arrToMap } from '../utils/toMap'
import { intlDebug } from './intl'
import { RnAlert } from './RnAlert'

let resolveFn: Function | undefined
const profilesLoaded = new Promise(resolve => {
  resolveFn = resolve
})

export type Account = {
  id: string
  pbxHostname: string
  pbxPort: string
  pbxTenant: string
  pbxUsername: string
  pbxPassword: string
  pbxPhoneIndex: string // '' | '1' | '2' | '3' | '4'
  pbxTurnEnabled: boolean
  pbxLocalAllUsers?: boolean
  pushNotificationEnabled: boolean
  pushNotificationEnabledSynced?: boolean
  parks?: string[]
  parkNames?: string[]
  ucEnabled: boolean
  displaySharedContacts?: boolean
  displayOfflineUsers?: boolean
  navIndex: number
  navSubMenus: string[]
}
export type AccountData = {
  id: string
  accessToken: string
  recentCalls: {
    id: string
    incoming: boolean
    answered: boolean
    partyName: string
    partyNumber: string
    created: string
  }[]
  recentChats: {
    id: string // thread id
    name: string
    text: string
    type: number
    group: boolean
    unread: boolean
    created: string
  }[]
  pbxBuddyList?: {
    screened: boolean
    users: (UcBuddy | UcBuddyGroup)[]
  }
}

class AccountStore {
  @observable pnSyncLoadingMap: { [k: string]: boolean } = {}

  @observable accounts: Account[] = []
  @computed get profilesMap() {
    return arrToMap(this.accounts, 'id', (p: Account) => p) as {
      [k: string]: Account
    }
  }
  @observable accountData: AccountData[] = []
  @observable storageLoadedObservable = false
  waitStorageLoaded = () => profilesLoaded
  genEmptyAccount = (): Account => ({
    id: newUuid(),
    pbxTenant: '',
    pbxUsername: '',
    pbxHostname: '',
    pbxPort: '',
    pbxPassword: '',
    pbxPhoneIndex: '',
    pbxTurnEnabled: false,
    pushNotificationEnabled: Platform.OS === 'web' ? false : true,
    parks: [] as string[],
    parkNames: [] as string[],
    ucEnabled: false,
    navIndex: -1,
    navSubMenus: [],
  })
  loadAccountsFromLocalStorage = async () => {
    const arr = await RnAsyncStorage.getItem('_api_profiles')
    let x: TAccountDataInStorage | undefined
    if (arr && !Array.isArray(arr)) {
      try {
        x = JSON.parse(arr)
      } catch (err) {
        x = undefined
      }
    }
    if (x) {
      let { profileData, profiles } = x
      if (Array.isArray(x)) {
        // Lower version compatible
        profiles = x
        profileData = []
      }
      runInAction(() => {
        this.accounts = profiles
        this.accountData = uniqBy(profileData, 'id') as unknown as AccountData[]
      })
    }
    resolveFn?.()
    resolveFn = undefined
    this.storageLoadedObservable = true
  }
  saveAccountsToLocalStorage = async () => {
    try {
      await RnAsyncStorage.setItem(
        '_api_profiles',
        JSON.stringify({
          profiles: this.accounts,
          profileData: this.accountData,
        }),
      )
    } catch (err) {
      RnAlert.error({
        message: intlDebug`Failed to save accounts to local storage`,
        err: err as Error,
      })
    }
  }
  @action upsertAccount = (p: Partial<Account>) => {
    const p1 = this.accounts.find(p0 => p0.id === p.id)
    if (!p1) {
      this.accounts.push(p as Account)
    } else {
      const p0 = { ...p1 } // Clone before assign
      Object.assign(p1, p)
      if (getAccountUniqueId(p0) !== getAccountUniqueId(p1)) {
        p0.pushNotificationEnabled = false
        SyncPnToken().sync(p0, {
          noUpsert: true,
        })
      } else if (
        typeof p.pushNotificationEnabled === 'boolean' &&
        p.pushNotificationEnabled !== p0.pushNotificationEnabled
      ) {
        p1.pushNotificationEnabledSynced = false
        SyncPnToken().sync(p1, {
          onError: err => {
            RnAlert.error({
              message: intlDebug`Failed to sync Push Notification settings for ${p1.pbxUsername}`,
              err,
            })
            p1.pushNotificationEnabled = p0.pushNotificationEnabled
            p1.pushNotificationEnabledSynced = p0.pushNotificationEnabledSynced
            this.saveAccountsToLocalStorage()
          },
        })
      }
    }
    this.saveAccountsToLocalStorage()
  }
  @action removeAccount = (id: string) => {
    const p0 = this.accounts.find(p => p.id === id)
    this.accounts = this.accounts.filter(p => p.id !== id)
    this.saveAccountsToLocalStorage()
    if (p0) {
      p0.pushNotificationEnabled = false
      SyncPnToken().sync(p0, {
        noUpsert: true,
      })
    }
  }
  getAccountData = (p?: Account) => {
    if (!p || !p.pbxUsername || !p.pbxTenant || !p.pbxHostname || !p.pbxPort) {
      return {
        id: '',
        accessToken: '',
        recentCalls: [],
        recentChats: [],
        pbxBuddyList: undefined,
      }
    }
    const id = getAccountUniqueId(p)
    const d = this.accountData.find(_ => _.id === id) || {
      id,
      accessToken: '',
      recentCalls: [],
      recentChats: [],
      pbxBuddyList: undefined,
    }
    this.updateAccountDataDebounced(d)
    return d
  }
  updateAccountDataDebounced = debounce(
    (d: AccountData) => {
      if (d.id === this.accountData[0]?.id) {
        return
      }
      const arr = [d, ...this.accountData.filter(d2 => d2.id !== d.id)]
      if (arr.length > 20) {
        arr.pop()
      }
      runInAction(() => {
        this.accountData = arr
      })
      this.saveAccountsToLocalStorage()
    },
    300,
    { maxWait: 3000 },
  )
}

export const getAccountUniqueId = (p: Account) =>
  stringify({
    u: p.pbxUsername,
    t: p.pbxTenant,
    h: p.pbxHostname,
    p: p.pbxPort,
  })

export const accountStore = new AccountStore()

type TAccountDataInStorage = {
  profiles: Account[]
  profileData: AccountData[]
}