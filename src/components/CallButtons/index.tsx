import styles from 'components/CallButtons/Styles'
import { RnText } from 'components/Rn'
import React, { FC, useEffect, useState } from 'react'
import {
  Image,
  ImageSourcePropType,
  TouchableOpacity,
  View,
} from 'react-native'

const CallButtons: FC<{
  onPress(): void
  image: ImageSourcePropType
  lable: string
  showAnimation?: boolean
  containerStyle?: object
}> = ({ onPress, image, lable, showAnimation, containerStyle }) => {
  const [animationTrigger, setAnimationTrigger] = useState(showAnimation)
  const animationTime = 1000

  useEffect(() => {
    let timer: any = null
    if (showAnimation) {
      timer = setInterval(() => {
        setAnimationTrigger(prevAnimationTrigger => !prevAnimationTrigger)
      }, animationTime)
    }
    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <View style={[styles.actionBtnContainer, containerStyle && containerStyle]}>
      <TouchableOpacity
        onPress={onPress}
        style={animationTrigger && styles.animationContainer}
      >
        <Image
          source={image}
          style={[styles.actionBtn, animationTrigger && styles.animationImage]}
        ></Image>
      </TouchableOpacity>
      <RnText style={styles.actionBtnText}>{lable}</RnText>
    </View>
  )
}

export default CallButtons