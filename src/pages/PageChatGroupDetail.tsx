import { computed } from 'mobx'
import { observer } from 'mobx-react'
import React from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
} from 'react-native'

import uc from '@/api/uc'
import { numberOfChatsPerLoad } from '@/components/chatConfig'
import MessageList from '@/components/ChatMessageList'
import ChatInput from '@/components/FooterChatInput'
import Layout from '@/components/Layout'
import callStore from '@/stores/callStore'
import chatStore, { ChatMessage } from '@/stores/chatStore'
import contactStore from '@/stores/contactStore'
import intl, { intlDebug } from '@/stores/intl'
import Nav from '@/stores/Nav'
import RnAlert from '@/stores/RnAlert'
import pickFile from '@/utils/pickFile'
import saveBlob from '@/utils/saveBlob'
import { arrToMap } from '@/utils/toMap'

@observer
class PageChatGroupDetail extends React.Component<{
  groupId: string
}> {
  @computed get chatIds() {
    return (chatStore.messagesByThreadId[this.props.groupId] || []).map(
      m => m.id,
    )
  }
  @computed get chatById() {
    return arrToMap(
      chatStore.messagesByThreadId[this.props.groupId] || [],
      'id',
      (m: ChatMessage) => m,
    ) as { [k: string]: ChatMessage }
  }

  state = {
    target: '',
    loadingRecent: false,
    loadingMore: false,
    editingText: '',
    blobFile: {
      url: '',
      fileType: '',
    },
  }
  componentDidMount() {
    const noChat = !this.chatIds.length
    if (noChat) {
      this.loadRecent()
    } else {
      window.setTimeout(this.onContentSizeChange, 170)
    }
  }

  renderChatInput = () => {
    return (
      <ChatInput
        onTextChange={this.setEditingText}
        onTextSubmit={this.submitEditingText}
        openFileRnPicker={() => pickFile(this.sendFile)}
        text={this.state.editingText}
      />
    )
  }
  render() {
    const gr = chatStore.getGroup(this.props.groupId)
    return (
      <Layout
        compact
        containerOnContentSizeChange={this.onContentSizeChange}
        containerOnScroll={this.onScroll}
        containerRef={this.setViewRef}
        dropdown={[
          {
            label: intl`Invite more people`,
            onPress: this.invite,
          },
          {
            label: intl`Start voice call`,
            onPress: this.callVoiceConference,
          },
          {
            label: intl`Start video call`,
            onPress: this.callVideoConference,
          },
          {
            label: intl`Leave group`,
            onPress: this.leave,
            danger: true,
          },
        ]}
        fabRender={this.renderChatInput}
        onBack={Nav().backToPageChatRecents}
        title={gr?.name}
      >
        <MessageList
          acceptFile={this.acceptFile}
          isGroupChat
          list={chatStore.messagesByThreadId[this.props.groupId]}
          loadMore={this.loadMore}
          rejectFile={this.rejectFile}
          resolveChat={this.resolveChat}
        />
      </Layout>
    )
  }

  view?: ScrollView
  setViewRef = (ref: ScrollView) => {
    this.view = ref
  }

  _justMounted = true
  _closeToBottom = true
  onContentSizeChange = () => {
    if (this._closeToBottom) {
      this.view?.scrollToEnd({ animated: !this._justMounted })
      if (this._justMounted) {
        this._justMounted = false
      }
    }
  }
  onScroll = (ev: NativeSyntheticEvent<NativeScrollEvent>) => {
    const layoutSize = ev.nativeEvent.layoutMeasurement
    const layoutHeight = layoutSize.height
    const contentOffset = ev.nativeEvent.contentOffset
    const contentSize = ev.nativeEvent.contentSize
    const contentHeight = contentSize.height
    const paddingToBottom = 20
    this._closeToBottom =
      layoutHeight + contentOffset.y >= contentHeight - paddingToBottom
  }

  me = uc.me()
  resolveBuddy = (creator: string) => {
    if (creator === this.me.id) {
      return this.me
    }
    return contactStore.getUCUser(creator) || {}
  }
  resolveChat = (id: string) => {
    const chat = this.chatById[id] as ChatMessage
    const text = chat.text
    const file = chatStore.filesMap[chat.file || '']
    const creator = this.resolveBuddy(chat.creator)
    return {
      id,
      creatorId: creator.id,
      creatorName: creator.name || creator.id,
      creatorAvatar: creator.avatar,
      file,
      text,
      type: chat.type,
      created: chat.created,
      createdByMe: creator.id === this.me.id,
    }
  }

  loadRecent() {
    this.setState({ loadingRecent: true })
    uc.getGroupChats(this.props.groupId, {
      max: numberOfChatsPerLoad,
    })
      .then(chats => {
        chatStore.pushMessages(this.props.groupId, chats)
        window.setTimeout(this.onContentSizeChange, 170)
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to get recent chats`,
          err,
        })
      })
      .then(() => {
        this.setState({ loadingRecent: false })
      })
  }

  loadMore = () => {
    this.setState({ loadingMore: true })
    const oldestChat = (this.chatById[this.chatIds[0]] || {}) as ChatMessage
    const oldestCreated = oldestChat.created || 0
    const max = numberOfChatsPerLoad
    const end = oldestCreated
    const query = {
      max,
      end,
    }
    uc.getGroupChats(this.props.groupId, query)
      .then(chats => {
        chatStore.pushMessages(this.props.groupId, chats)
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to get more chats`,
          err,
        })
      })
      .then(() => {
        this.setState({ loadingMore: false })
      })
  }

  setEditingText = (editingText: string) => {
    this.setState({
      editingText,
    })
  }

  submitting = false
  submitEditingText = () => {
    if (this.submitting) {
      return
    }
    const txt = this.state.editingText.trim()
    if (!txt) {
      return
    }
    this.submitting = true
    uc.sendGroupChatText(this.props.groupId, txt)
      .then(chat => {
        chatStore.pushMessages(this.props.groupId, [chat as ChatMessage])
        this.setState({ editingText: '' })
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to send the message`,
          err,
        })
      })
      .then(() => {
        this.submitting = false
      })
  }

  leave = () => {
    uc.leaveChatGroup(this.props.groupId)
      .then(() => {
        chatStore.removeGroup(this.props.groupId)
        Nav().goToPageChatRecents()
      })
      .catch((err: Error) => {
        RnAlert.error({
          message: intlDebug`Failed to leave the group`,
          err,
        })
      })
  }

  invite = () => {
    Nav().goToPageChatGroupInvite({ groupId: this.props.groupId })
  }
  call = (target: string, bVideoEnabled: boolean) => {
    callStore.startCall(target, {
      videoEnabled: bVideoEnabled,
    })
  }
  callVoiceConference = () => {
    let target = this.props.groupId
    if (!target.startsWith('uc')) {
      target = 'uc' + this.props.groupId
    }
    this.call(target, false)
  }
  callVideoConference = () => {
    let target = this.props.groupId
    if (!target.startsWith('uc')) {
      target = 'uc' + this.props.groupId
    }
    this.call(target, true)
  }

  readFile = (file: { type: string; name: string; uri: string }) => {
    if (Platform.OS === 'web') {
      const reader = new FileReader()

      const fileType = file.type ? file.type.split('/')[0] : ''
      reader.onload = async event => {
        const url = event.target?.result
        this.setState({ blobFile: { url: url, fileType: fileType } })
      }
      reader.readAsDataURL((file as unknown) as Blob)
    } else {
      const type = ['PNG', 'JPG', 'JPEG', 'GIF']
      const fileType = type.includes(
        file.name.split('.').pop()?.toUpperCase() || '',
      )
        ? 'image'
        : 'other'
      this.setState({ blobFile: { url: file.uri, fileType: fileType } })
    }
  }

  sendFile = (file: { type: string; name: string; uri: string }) => {
    this.readFile(file)
    const groupId = this.props.groupId
    uc.sendFiles(groupId, (file as unknown) as Blob)
      .then(this.onSendFileSuccess)
      .catch(this.onSendFileFailure)
  }
  onSendFileSuccess = (res: {
    file: {
      id: string
    }
    chat: ChatMessage
  }) => {
    const groupId = this.props.groupId
    Object.assign(res.file, this.state.blobFile)
    chatStore.upsertFile(res.file)
    chatStore.pushMessages(groupId, res.chat)
  }
  onSendFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to send file`,
      err,
    })
  }
  acceptFile = (file: { id: string; name: string }) => {
    uc.acceptFile(file.id)
      .then(blob => this.onAcceptFileSuccess(blob as Blob, file))
      .catch(this.onAcceptFileFailure)
  }

  onAcceptFileSuccess = (
    blob: Blob,
    file: {
      id: string
      name: string
    },
  ) => {
    const type = ['PNG', 'JPG', 'JPEG', 'GIF']
    const fileType = type.includes(
      file.name.split('.').pop()?.toUpperCase() || '',
    )
      ? 'image'
      : 'other'
    const reader = new FileReader()
    reader.onload = async event => {
      const url = event.target?.result
      Object.assign(chatStore.filesMap[file.id], {
        url: url,
        fileType: fileType,
      })
    }

    reader.readAsDataURL(blob)

    saveBlob(blob, file.name)
  }

  onAcceptFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to accept file`,
      err,
    })
  }
  rejectFile = (file: { id: string }) => {
    uc.rejectFile(file).catch(this.onRejectFileFailure)
  }
  onRejectFileFailure = (err: Error) => {
    RnAlert.error({
      message: intlDebug`Failed to reject file`,
      err,
    })
  }
}

export default PageChatGroupDetail
