import { StyleSheet } from 'react-native'

import CustomColors from '@/utils/CustomColors'
import CustomFonts from '@/utils/CustomFonts'

const styles = StyleSheet.create({
  transferSeparatorText: {
    fontSize: CustomFonts.SmallLabel,
    color: CustomColors.DodgerBlue,
  },
  transferSeparator: {
    backgroundColor: CustomColors.LightBlue,
    paddingLeft: 17,
  },
  scrollViewContainer: {
    marginBottom: 1,
  },
  keyPadContainer: {
    marginTop: 15,
    marginBottom: 30,
  },
  transferKeysPlaceholder: {
    fontSize: CustomFonts.HeaderTitle,
    fontFamily: 'Roboto-Regular',
    padding: 15,
    textAlign: 'left',
    width: '100%',
    marginTop: '5%',
    marginLeft: 65,
  },
  tabView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CustomColors.lightAliceBlue,
  },
  activeTab: {
    borderBottomColor: CustomColors.DodgerBlue,
    borderBottomWidth: 2,
  },
  tabContainer: {
    height: 48,
    flex: 0.5,
  },
})

export default styles
