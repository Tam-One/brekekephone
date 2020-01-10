import { observer } from 'mobx-react';
import React from 'react';
import { View } from 'react-native';

import CallBar from '../-notify/CallBar';
import CallNotify from '../-notify/CallNotify';
import ChatGroupInvite from '../-notify/ChatGroupInvite';
import authStore from '../global/authStore';
import AuthPBX from '../shared/AuthPBX';
import AuthSIP from '../shared/AuthSIP';
import AuthUC from '../shared/AuthUC';
import CallVideos from '../shared/CallVideos';
import CallVoices from '../shared/CallVoices';

const RootAuth = observer(() => {
  if (!authStore.signedInId) {
    return null;
  }
  return (
    <React.Fragment>
      <AuthPBX />
      <AuthSIP />
      <AuthUC />
      <CallNotify />
      <View />
      <CallBar />
      <CallVideos />
      <CallVoices />
      <ChatGroupInvite />
    </React.Fragment>
  );
});

export default RootAuth;
