import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';
import createId from 'shortid';

import authStore from '../../mobx/authStore';
import * as routerUtils from '../../mobx/routerStore';
import UI from './ui';

@observer
@createModelView(
  getter => state => ({
    //
  }),
  action => emit => ({
    showToast(message) {
      emit(
        action.toasts.create({
          id: createId(),
          message,
        }),
      );
    },
  }),
)
class View extends React.Component {
  static contextTypes = {
    pbx: PropTypes.object.isRequired,
  };

  componentDidMount() {
    if (this.needToAuth()) {
      this.auth();
    }
  }

  componentDidUpdate() {
    if (this.needToAuth()) {
      this.auth();
    }
  }

  componentWillUnmount() {
    authStore.set('pbxState', 'stopped');
    this.context.pbx.disconnect();
  }

  needToAuth = () =>
    authStore.profile &&
    authStore.pbxState !== 'started' &&
    authStore.pbxState !== 'success' &&
    authStore.pbxState !== 'failure';

  auth = () => {
    this.context.pbx.disconnect();
    authStore.set('pbxState', 'started');

    this.context.pbx
      .connect(authStore.profile)
      .then(() => {
        authStore.set('pbxState', 'success');
      })
      .catch(err => {
        if (err && err.message) {
          this.props.showToast(err.message);
        }

        authStore.set('pbxState', 'failure');
      });
  };

  render() {
    return authStore.pbxState === 'success' ? null : (
      <UI
        retryable={!!authStore.profile}
        failure={this.props.failure}
        abort={routerUtils.goToProfilesManage}
        retry={this.auth}
      />
    );
  }
}

export default View;