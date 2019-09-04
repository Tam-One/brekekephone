import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { createModelView } from 'redux-model';

import routerStore from '../../mobx/routerStore';
import toast from '../../shared/Toast';
import UI from './ui';

@observer
@createModelView(
  getter => (state, props) => ({
    group: getter.chatGroups.detailMapById(state)[props.match.params.group],
    buddyIds: getter.ucUsers.idsByOrder(state),
    buddyById: getter.ucUsers.detailMapById(state),
  }),
  action => emit => ({
    //
  }),
)
@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  static defaultProps = {
    group: {
      members: [],
    },

    buddyIds: [],
    buddyById: {},
  };

  state = {
    selectedBuddy: {},
  };

  render = () => (
    <UI
      groupName={this.props.group.name}
      buddies={this.props.buddyIds.filter(this.isNotMember)}
      selectedBuddy={this.state.selectedBuddy}
      resolveBuddy={this.resolveBuddy}
      toggleBuddy={this.toggleBuddy}
      invite={this.invite}
      back={this.back}
    />
  );

  isNotMember = buddy => !this.props.group.members.includes(buddy);
  resolveBuddy = buddy => this.props.buddyById[buddy];

  toggleBuddy = buddy => {
    let { selectedBuddy } = this.state;

    selectedBuddy = {
      ...selectedBuddy,
      [buddy]: !selectedBuddy[buddy],
    };

    this.setState({
      selectedBuddy,
    });
  };

  invite = () => {
    const { group } = this.props;

    const { selectedBuddy } = this.state;

    const members = Object.keys(selectedBuddy);

    if (!members.length) {
      toast.error('No buddy selectedBuddy');
      return;
    }

    const { uc } = this.context;

    uc.inviteChatGroupMembers(group.id, members)
      .catch(this.onInviteFailure)
      .then(this.back);
  };

  onInviteFailure = err => {
    console.error(err);
    toast.error(err.message || 'Failed with unknown error');
  };

  back = () => {
    routerStore.goToChatGroupsRecent(this.props.group.id);
  };
}

export default View;
