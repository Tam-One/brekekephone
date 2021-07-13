import RnText from 'components/RnText'
import styles from 'pages/PageCallManage/Styles'
import React, { FC } from 'react'
import { TouchableOpacity, View } from 'react-native'
import CustomStrings from 'utils/CustomStrings'

const VideoPopup: FC<{
  header: string
  onOkPress?(): void
  showOk: boolean
  onCancel(): void
}> = ({ header, onOkPress, showOk, onCancel }) => {
  return (
    <View style={styles.videoPopupContainer}>
      <View style={styles.videoPopupView}>
        <RnText style={styles.videoPopupHeading}>{header}</RnText>
        <View style={styles.videoPopupFooter}>
          <TouchableOpacity onPress={onCancel}>
            <RnText style={styles.videoPopupCancel}>
              {CustomStrings.Cancel}
            </RnText>
          </TouchableOpacity>
          {showOk && (
            <TouchableOpacity onPress={onOkPress}>
              <RnText style={styles.videoPopupSwitch}>
                {CustomStrings.Switch}
              </RnText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  )
}

export default VideoPopup
