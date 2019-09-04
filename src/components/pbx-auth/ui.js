import React from 'react';
import { StyleSheet, Text, TouchableOpacity as Btn, View } from 'react-native';

import { std } from '../../-/styleguide';

export const st = StyleSheet.create({
  main: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.shade2,
    backgroundColor: std.color.shade0,
  },

  message: {
    fontFamily: std.font.text,
    fontSize: std.textSize.sm,
    lineHeight: std.textSize.sm + std.gap.lg * 2,
    color: std.color.shade5,
    margin: std.gap.sm,
  },

  buttons: {
    position: 'absolute',
    top: 0,
    right: 0,
    margin: std.gap.sm,
    flexDirection: 'row',
  },

  abort: {
    marginHorizontal: std.gap.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.danger,
    borderRadius: std.gap.sm,
    paddingLeft: std.gap.lg,
    paddingRight: std.gap.lg,
  },

  abortText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.danger,
  },

  retry: {
    marginHorizontal: std.gap.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: std.color.action,
    borderRadius: std.gap.sm,
    paddingLeft: std.gap.lg,
    paddingRight: std.gap.lg,
  },

  retryText: {
    fontFamily: std.font.text,
    fontSize: std.textSize.md,
    lineHeight: std.textSize.md + std.gap.md * 2,
    color: std.color.action,
  },
});

const PBXAuth = p => (
  <View style={st.main}>
    {p.failure || <Text style={st.message}>CONNECTING TO PBX</Text>}
    {p.failure && <Text style={st.message}>PBX CONNECTION FAILED</Text>}
    <View style={st.buttons}>
      {p.failure && p.retryable && (
        <Btn style={st.retry} onPress={p.retry}>
          <Text style={st.retryText}>Retry</Text>
        </Btn>
      )}
      <Btn style={st.abort} onPress={p.abort}>
        <Text style={st.abortText}>Abort</Text>
      </Btn>
    </View>
  </View>
);

export default PBXAuth;
