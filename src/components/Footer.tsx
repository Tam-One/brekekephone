import { observer } from 'mobx-react'
import React, { FC } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { getBottomSpace } from 'react-native-iphone-x-helper'

import CustomValues from '@/utils/CustomValues'

import RnKeyboard from '../stores/RnKeyboard'
import { toLowerCaseFirstChar } from '../utils/string'
import { arrToMap } from '../utils/toMap'
import Actions from './FooterActions'
import Navigation from './FooterNavigation'
import ToggleKeyboard from './FooterToggleKeyboard'
import g from './variables'

const css = StyleSheet.create({
  Footer: {
    bottom: CustomValues.iosAndroid ? 0 : 60,
    right: 0,
    zIndex: 99999,
  },
  Footer__noKeyboard: {
    left: 0,
    backgroundColor: g.bg,
  },
  //
  // Fix bug margin auto can not be used
  ActionsOuter: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginVertical: 8,
  },
  ActionsSpacing: {
    flex: 1,
  },
  //
  ActionsInner: {
    flexDirection: 'row',
    width: '100%',
    minWidth: 260,
    maxWidth: g.maxModalWidth,
  },
})

const Footer: FC<{
  menu: string
}> = observer(props => {
  const fabProps: {
    onNext?(): void
    render: Function
    onShowKeyboard(): void
  } = arrToMap(
    Object.keys(props).filter(k => k.startsWith('fab')),
    (k: string) => toLowerCaseFirstChar(k.replace('fab', '')),
    (k: string) => props[k as keyof typeof props],
  ) as any
  const { menu } = props
  const { onNext, render } = fabProps
  if (
    !render &&
    ((!menu && !onNext && !RnKeyboard.isKeyboardShowing) ||
      RnKeyboard.isKeyboardAnimating)
  ) {
    return null
  }
  return (
    <View
      style={[
        css.Footer,
        (render || !RnKeyboard.isKeyboardShowing) && css.Footer__noKeyboard,
      ]}
    >
      {render ? (
        render()
      ) : RnKeyboard.isKeyboardShowing ? (
        <ToggleKeyboard {...fabProps} />
      ) : onNext ? (
        <View style={css.ActionsOuter}>
          <View style={css.ActionsSpacing} />
          <View style={css.ActionsInner}>
            <Actions {...fabProps} />
          </View>
          <View style={css.ActionsSpacing} />
        </View>
      ) : null}
      {!RnKeyboard.isKeyboardShowing && menu && <Navigation menu={menu} />}
    </View>
  )
})

export default Footer
