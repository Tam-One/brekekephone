import { mdiCheck, mdiClose } from '@mdi/js'
import uc from 'api/uc'
import ButtonIcon from 'components/ButtonIcon'
import { formatDateTimeSemantic } from 'components/chatConfig'
import styles from 'components/ChatGroupInvite/Styles'
import UserItem from 'components/ContactUserItem/ContactUserItem'
import { RnText, RnTouchableOpacity } from 'components/Rn'
import g from 'components/variables'
import sortBy from 'lodash/sortBy'
import { action, computed, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { View } from 'react-native'
import Call from 'stores/Call'
import chatStore from 'stores/chatStore'
import contactStore from 'stores/contactStore'
import intl, { intlDebug } from 'stores/intl'
import Nav from 'stores/Nav'
import RnAlert from 'stores/RnAlert'
import RnStacker from 'stores/RnStacker'
import { filterTextOnly } from 'utils/formatChatContent'

const Notify: FC<{
  id: string
  call?: Call
  type: string
  name: string
  inviter: string
  reject: Function
  accept: Function
  loading: boolean
}> = observer(p0 => {
  const { call: c, ...p } = p0
  return (
    <View style={styles.notify}>
      {!!p.type && (
        <>
          <View style={styles.notifyInfo}>
            <RnText bold>{p.name}</RnText>
            <RnText>{intl`Group chat invited by ${p.inviter}`}</RnText>
          </View>
          <ButtonIcon
            bdcolor={g.colors.danger}
            color={g.colors.danger}
            onPress={() => p.reject(p.id)}
            path={mdiClose}
            size={20}
            style={styles.notifyBtnReject}
          />
          <ButtonIcon
            bdcolor={g.colors.primary}
            color={g.colors.primary}
            onPress={() => p.accept(p.id)}
            path={mdiCheck}
            size={20}
            style={styles.notifyBtnAccept}
            disabled={p.loading}
          />
        </>
      )}
    </View>
  )
})

@observer
class ChatGroupInvite extends React.Component {
  @observable loading = false
  @computed get groupIds() {
    return chatStore.groups.filter(g => !g.jointed).map(g => g.id)
  }

  formatGroup = (group: string) => {
    const { id, inviter, name } = chatStore.getGroup(group) || {}
    const inviterName = contactStore.getUCUser(inviter)?.name
    return {
      id: id,
      name,
      inviter: inviterName || inviter,
    }
  }
  // TODO: rejected but existed in chat home => error when click.
  reject = (group: string) => {
    uc.leaveChatGroup(group)
      .then(this.onRejectSuccess)
      .catch(this.onRejectFailure)
  }
  onRejectSuccess = (res: { id: string }) => {
    chatStore.removeGroup(res.id)
  }
  onRejectFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to reject the group chat`,
      err,
    })
  }
  accept = (group: string) => {
    this.loading = true
    uc.joinChatGroup(group)
      .then(this.onAcceptSuccess)
      .catch(this.onAcceptFailure)
  }
  onAcceptSuccess = () => {
    this.loading = false
  }
  onAcceptFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to accept the group chat`,
      err,
    })
  }

  render() {
    return this.groupIds.map(group => (
      <Notify
        key={group}
        {...this.formatGroup(group)}
        accept={this.accept}
        reject={this.reject}
        type='inviteChat'
        loading={this.loading}
      />
    ))
  }
}

@observer
class UnreadChatNoti extends React.Component {
  @observable unreadChat: null | {
    id: string
    isGroup: boolean
    lastMessage: {
      text?: string
      created: number
    }
  } = null
  alreadyShowNoti: { [k: string]: boolean } = {}
  prevLastMessageId = ''
  prevUnreadChatTimeoutId = 0

  componentDidMount() {
    this.updateLatestUnreadChat()
  }

  componentDidUpdate() {
    this.updateLatestUnreadChat()
  }

  updateLatestUnreadChat = () => {
    if (this.unreadChat) {
      return
    }
    let unreadChats = Object.entries(chatStore.threadConfig)
      .filter(
        ([k, v]) =>
          v.isUnread && filterTextOnly(chatStore.messagesByThreadId[k])?.length,
      )
      .map(([k, v]) => {
        const arr = filterTextOnly(chatStore.messagesByThreadId[k])
        return {
          ...v,
          lastMessage: arr[arr.length - 1],
        }
      })
      .filter(
        c =>
          !this.alreadyShowNoti[c.lastMessage.id] &&
          c.lastMessage.id !== this.prevLastMessageId,
      )
    unreadChats.forEach(c => {
      this.alreadyShowNoti[c.lastMessage.id] = true
    })
    //
    unreadChats = unreadChats.filter(c => {
      const s = (RnStacker.stacks[RnStacker.stacks.length - 1] as unknown) as {
        name: string
        buddy: string
        groupId: string
      }
      if (!s) {
        return true
      }
      const { name, buddy, groupId } = s
      if (name === 'PageChatRecents') {
        return false
      }
      if (name === 'PageChatDetail' && !c.isGroup && buddy === c.id) {
        return false
      }
      if (name === 'PageChatGroupDetail' && c.isGroup && groupId === c.id) {
        return false
      }
      return true
    })
    //
    unreadChats = sortBy(unreadChats, 'lastMessage.created')
    const latestUnreadChat = unreadChats[unreadChats.length - 1]
    if (!latestUnreadChat) {
      return
    }
    //
    this.unreadChat = latestUnreadChat
    this.prevLastMessageId = latestUnreadChat.lastMessage.id
    this.prevUnreadChatTimeoutId = window.setTimeout(this.clear, 5000)
  }
  @action clear = () => {
    if (this.prevUnreadChatTimeoutId) {
      window.clearTimeout(this.prevUnreadChatTimeoutId)
      this.prevUnreadChatTimeoutId = 0
    }
    this.unreadChat = null
  }
  onUnreadPress = () => {
    if (!this.unreadChat) {
      return
    }
    const { id, isGroup } = this.unreadChat
    this.clear()
    return isGroup
      ? Nav().goToPageChatGroupDetail({ groupId: id })
      : Nav().goToPageChatDetail({ buddy: id })
  }

  componentWillUnmount() {
    this.clear()
  }

  render() {
    Object.values(chatStore.threadConfig).forEach(v => {
      Object.values(v).forEach(v2 => {
        void v2
      })
    })
    Object.values(chatStore.messagesByThreadId).forEach(v => {
      v.forEach(v2 => {
        void v2.id
      })
    })
    void RnStacker.stacks[RnStacker.stacks.length - 1]
    if (!this.unreadChat) {
      return null
    }
    const {
      id,
      lastMessage: { text, created },
      isGroup,
    } = this.unreadChat
    return (
      <View style={[styles.notify, styles.notifyUnread]}>
        <RnTouchableOpacity
          style={styles.notifyUnreadBtn}
          onPress={this.onUnreadPress}
        >
          <UserItem
            key={id}
            {...(isGroup
              ? chatStore.groups.find(g => g.id === id)
              : contactStore.ucUsers.find(u => u.id === id))}
            lastMessage={text}
            isRecentChat
            lastMessageDate={formatDateTimeSemantic(created)}
          />
        </RnTouchableOpacity>
      </View>
    )
  }
}

export { UnreadChatNoti }
export default ChatGroupInvite
