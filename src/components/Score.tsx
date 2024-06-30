import { Text } from '@shopify/react-native-skia'
import React from 'react'

const Score = ({ width, height, font, score }) => {
  return <Text x={width / 2} y={height / 6} font={font} text={score} />
}

export default Score
