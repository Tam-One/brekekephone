import { Dimensions, Platform, StyleSheet } from 'react-native'

import CustomValues from '@/utils/CustomValues'

import CustomColors from '../../utils/CustomColors'
import CustomFonts from '../../utils/CustomFonts'

const screenHeight = Dimensions.get('window').height
const keyButtonSize = screenHeight * 0.097
const keyMargin = screenHeight * 0.02
const footerMargin = screenHeight * 0.01
const footerImage = screenHeight * 0.1

const isIos = Platform.OS === 'ios'
const symbolFont = isIos ? CustomFonts.BigFont : CustomFonts.MediumFont

const styles = StyleSheet.create({
  btn: {
    borderRadius: 40,
    width: CustomValues.iosAndroid ? 80 : 65,
    height: CustomValues.iosAndroid ? 80 : 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CustomColors.Green,
  },
  keyPadNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 24,
    alignContent: 'center',
  },
  KeyPadNumberText: {
    fontSize: CustomFonts.DialNumberFont,
    fontFamily: 'Roboto-Medium',
    lineHeight: 35,
    color: CustomColors.DarkBlue,
  },
  KeyPadNumberButton: {
    width: keyButtonSize,
    height: keyButtonSize,
    backgroundColor: CustomColors.White,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    textAlign: 'center',
    marginBottom: 13,
  },
  actionButtons: {
    width: keyButtonSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 24,
    textAlign: 'center',
  },
  transferButtonText: {
    color: CustomColors.Black,
    marginTop: 8,
    width: 90,
    textAlign: 'center',
    overflow: 'visible',
  },
  keyPadSubText: {
    fontSize: CustomFonts.SmallFooterText,
    color: CustomColors.DarkBlue,
    letterSpacing: 2,
    fontFamily: 'Nunito-SemiBold',
    lineHeight: 14,
    marginLeft: 5,
  },
  symbolText: {
    fontSize: symbolFont,
    lineHeight: isIos ? 100 : 75,
    justifyContent: 'center',
    textAlignVertical: 'center',
    fontFamily: 'Roboto-Regular',
  },
  triangle: {
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: CustomColors.White,
    transform: [{ rotate: '-90deg' }],
    marginRight: -15,
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: CustomFonts.IconFont,
    lineHeight: 25,
  },
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: 50,
    height: 36,
    alignItems: 'center',
    marginRight: 24,
    marginBottom: 13,
  },
  removeTextButton: {
    alignItems: 'center',
    marginBottom: 13,
    flexDirection: 'row',
  },
  rectangle: {
    width: 50,
    backgroundColor: CustomColors.White,
    margin: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    borderRadius: 10,
  },
  footerButtons: {
    marginTop: footerMargin,
  },
  callButtonContainer: {
    marginTop: 1,
    marginBottom: 0,
    paddingBottom: 0,
    width: keyButtonSize,
    height: keyButtonSize,
  },
  callButtonImage: {
    width: keyButtonSize,
    height: keyButtonSize,
  },
  hideWrapper: {
    alignItems: 'center',
    fontSize: CustomFonts.HeaderTitle,
    color: CustomColors.DarkBlue,
    textDecorationLine: 'underline',
    fontFamily: 'Roboto-Medium',
  },
  transferButtonContainer: {
    width: CustomValues.iosAndroid ? 80 : 60,
    height: CustomValues.iosAndroid ? 80 : 60,
    marginTop: 0,
    backgroundColor: CustomColors.Green,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    marginBottom: 5,
    paddingTop: CustomValues.iosAndroid ? 35 : 10,
  },
})

export default styles
