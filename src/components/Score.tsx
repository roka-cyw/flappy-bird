import { Text, matchFont } from '@shopify/react-native-skia'
import React from 'react'
import { Platform } from 'react-native'

const Score = ({ width, height, score }) => {
  const fontFamily = Platform.select({ ios: 'Helvetica', default: 'serif' })
  const fontStyle = {
    fontFamily,
    fontSize: 40
    // fontWeight: 'bold'
  }
  const font = matchFont(fontStyle)

  return <Text x={width / 2} y={height / 6} font={font} text={score} />
}

export default Score
