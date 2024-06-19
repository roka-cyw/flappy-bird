import React from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, useImage, Image } from '@shopify/react-native-skia'

const App = () => {
  const { width, height } = useWindowDimensions()

  const bg = useImage(require('./assets/sprites/background-day.png'))
  const bird = useImage(require('./assets/sprites/yellowbird-upflap.png'))

  return (
    <Canvas style={{ width, height }}>
      <Image image={bg} width={width} height={height} fit={'cover'} />
      <Image image={bird} width={64} height={48} x={width / 4} y={height / 2} />
    </Canvas>
  )
}
export default App
