import React from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, useImage, Image } from '@shopify/react-native-skia'

const App = () => {
  const { width, height } = useWindowDimensions()

  const bg = useImage(require('./assets/sprites/background-day.png'))
  const bird = useImage(require('./assets/sprites/yellowbird-upflap.png'))
  const pipeTop = useImage(require('./assets/sprites/pipe-green-top.png'))
  const pipeBottom = useImage(require('./assets/sprites/pipe-green.png'))
  const base = useImage(require('./assets/sprites/base.png'))

  const pipeOffset = 0

  return (
    <Canvas style={{ width, height }}>
      <Image image={bg} width={width} height={height} fit={'cover'} />
      <Image image={pipeTop} width={104} height={640} x={width / 2} y={pipeOffset - 320} />
      <Image image={pipeBottom} width={104} height={640} x={width / 2} y={height - 320 + pipeOffset} />
      <Image image={base} width={width} height={150} x={0} y={height - 75} fit={'cover'} />
      <Image image={bird} width={64} height={48} x={width / 4} y={height / 2} />
    </Canvas>
  )
}
export default App
