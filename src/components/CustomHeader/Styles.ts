import { StyleSheet } from 'react-native'

import CustomColors from '@/utils/CustomColors'
import CustomFonts from '@/utils/CustomFonts'
import CustomValues from '@/utils/CustomValues'

const styles = StyleSheet.create({
  header: {
    backgroundColor: CustomColors.HeaderColor,
  },
  backBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: 170,
  },
  backText: {
    color: CustomColors.DodgerBlue,
    fontSize: CustomFonts.BackText,
    overflow: 'visible',
  },
  headerText: {
    color: CustomColors.DarkBlue,
    fontSize: CustomFonts.NumberFont,
    lineHeight: CustomFonts.CallTextLineHeight,
    fontFamily: 'Roboto-Black',
    textAlign: 'center',
  },
  rightButtonText: {
    fontSize: CustomFonts.BackText,
    color: CustomColors.ActiveBlue,
    paddingLeft: CustomValues.iosAndroid ? 16 : 14,
    paddingRight: CustomValues.iosAndroid ? 16 : 14,
    paddingVertical: 10,
  },
  disabledRightButton: {
    opacity: 0.8,
    color: 'grey',
  },
  subText: {
    color: CustomColors.DarkBlue,
    fontSize: CustomFonts.SmallSubText,
    alignSelf: 'center',
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: CustomValues.iosAndroid ? 10 : 30,
    paddingBottom: 13,
    width: '100%',
  },
})

export default styles
