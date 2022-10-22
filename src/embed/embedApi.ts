import EventEmitter from 'eventemitter3'
import { unmountComponentAtNode } from 'react-dom'

import { MakeCallFn } from '../api/brekekejs'
import {
  Account,
  accountStore,
  getAccountUniqueId,
} from '../stores/accountStore'
import { getAuthStore } from '../stores/authStore'
import { getCallStore } from '../stores/cancelRecentPn'
import { promptBrowserPermission } from '../utils/promptBrowserPermission'
import { arrToMap } from '../utils/toMap'
import { waitTimeout } from '../utils/waitTimeout'

export type EmbedSignInOptions = {
  auto_login?: boolean
  clear_existing_account?: boolean
  accounts: EmbedAccount[]
} & { [k: string]: string }

export class EmbedApi extends EventEmitter {
  getRunningCalls = () => getCallStore().calls
  call: MakeCallFn = (...args) => getCallStore().startCall(...args)
  promptBrowserPermission = promptBrowserPermission

  restart = async (o: EmbedSignInOptions) => {
    getAuthStore().signOutWithoutSaving()
    await waitTimeout()
    await this._signIn(o)
  }

  cleanup = () => {
    getAuthStore().signOutWithoutSaving()
    if (this._rootTag) {
      unmountComponentAtNode(this._rootTag)
    }
  }

  _rootTag?: HTMLElement
  _palParams?: { [k: string]: string }

  _signIn = async (o: EmbedSignInOptions) => {
    await accountStore.waitStorageLoaded()
    if (o.clear_existing_account) {
      accountStore.accounts = []
      accountStore.accountData = []
    }
    const accountsMap = arrToMap(
      accountStore.accounts,
      getAccountUniqueId,
      (p: Account) => p,
    ) as { [k: string]: Account }
    let firstAccountInOptions: Account | undefined
    o.accounts.forEach(a => {
      const fr = convertToStorage(a)
      const to = accountsMap[getAccountUniqueId(fr)]
      if (to) {
        copyToStorage(fr, to)
        firstAccountInOptions = firstAccountInOptions || to
      } else {
        accountStore.accounts.push(fr)
        firstAccountInOptions = firstAccountInOptions || fr
      }
    })
    await accountStore.saveAccountsToLocalStorageDebounced()
    if (!o.auto_login) {
      return
    }
    const as = getAuthStore()
    if (firstAccountInOptions) {
      as.signIn(firstAccountInOptions)
      return
    }
    await as.autoSignInEmbed()
  }
}

export const embedApi = new EmbedApi()

type EmbedAccount = {
  hostname: string
  port: string
  tenant?: string
  username: string
  password?: string
  uc?: boolean
  parks?: string[]
  parkNames?: string[]
}
const convertToStorage = (a: EmbedAccount): Account => {
  const p = accountStore.genEmptyAccount()
  p.pbxHostname = a.hostname || ''
  p.pbxPort = a.port || ''
  p.pbxTenant = a.tenant || ''
  p.pbxUsername = a.username || ''
  p.pbxPassword = a.password || ''
  p.ucEnabled = a.uc || false
  p.parks = a.parks || []
  p.parkNames = a.parkNames || []
  return p
}
const copyToStorage = (fr: Account, to: Account) => {
  to.pbxHostname = fr.pbxHostname
  to.pbxPort = fr.pbxPort
  to.pbxTenant = fr.pbxTenant
  to.pbxUsername = fr.pbxUsername
  to.pbxPassword = fr.pbxPassword
  to.ucEnabled = fr.ucEnabled
  to.parks = fr.parks
  to.parkNames = fr.parkNames
}