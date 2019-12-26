import * as UCClient from 'brekekejs/lib/ucclient';
import { observe } from 'mobx';
import { observer } from 'mobx-react';
import React from 'react';

import uc from '../api/uc';
import g from '../global';
import authStore from '../global/authStore';
import chatStore from '../global/chatStore';
import contactStore from '../global/contactStore';

@observer
class AuthUC extends React.Component {
  componentDidMount() {
    uc.on(`connection-stopped`, this.onConnectionStopped);
    this.autoAuth();
    this.clearObserve = observe(authStore, `ucShouldAuth`, this.autoAuth);
  }
  componentWillUnmount() {
    this.clearObserve();
    uc.off(`connection-stopped`, this.onConnectionStopped);
    uc.disconnect();
    authStore.set(`ucState`, `stopped`);
  }

  auth = () => {
    uc.disconnect();
    authStore.set(`ucState`, `connecting`);
    authStore.set(`ucLoginFromAnotherPlace`, false);
    uc.connect(authStore.currentProfile)
      .then(this.onAuthSuccess)
      .catch(this.onAuthFailure);
  };
  autoAuth = () => {
    if (authStore.ucShouldAuth) {
      this.auth();
    }
  };
  onAuthSuccess = () => {
    this.loadUsers();
    this.loadUnreadChats().then(() => {
      authStore.set(`ucState`, `success`);
    });
  };
  onAuthFailure = err => {
    authStore.set(`ucState`, `failure`);
    g.showError({ message: `connect to UC` });
    console.error(err);
  };
  onConnectionStopped = e => {
    authStore.set(`ucState`, `failure`);
    authStore.set(
      `ucLoginFromAnotherPlace`,
      e.code === UCClient.Errors.PLEONASTIC_LOGIN,
    );
  };
  loadUsers = () => {
    const users = uc.getUsers();
    contactStore.set(`ucUsers`, users);
  };
  loadUnreadChats = () =>
    uc
      .getUnreadChats()
      .then(this.onLoadUnreadChatsSuccess)
      .catch(this.onLoadUnreadChatsFailure);
  onLoadUnreadChatsSuccess = chats => {
    chats.forEach(chat => {
      chatStore.pushMessages(chat.creator, [chat]);
    });
  };
  onLoadUnreadChatsFailure = err => {
    g.showError({ message: `load unread chats` });
    if (err && err.message) {
      g.showError(err.message);
    }
  };
  render() {
    return null;
  }
}

export default AuthUC;