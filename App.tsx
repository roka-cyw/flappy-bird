import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, useImage, Image } from '@shopify/react-native-skia'
import { useSharedValue, withTiming, Easing, withSequence, withRepeat } from 'react-native-reanimated'

const App = () => {
  const { width, height } = useWindowDimensions()

  const bg = useImage(require('./assets/sprites/background-day.png'))
  const bird = useImage(require('./assets/sprites/yellowbird-upflap.png'))
  const pipeTop = useImage(require('./assets/sprites/pipe-green-top.png'))
  const pipeBottom = useImage(require('./assets/sprites/pipe-green.png'))
  const base = useImage(require('./assets/sprites/base.png'))

  const x = useSharedValue(width)
  const pipeOffset = 0

  useEffect(() => {
    x.value = withRepeat(
      withSequence(withTiming(-150, { duration: 3000, easing: Easing.linear }), withTiming(width, { duration: 0 })),
      -1
    )
  }, [])

  return (
    <Canvas style={{ width, height }} onTouch={() => console.log('tesdt', width)}>
      <Image image={bg} width={width} height={height} fit={'cover'} />
      <Image image={pipeTop} width={104} height={640} x={x} y={pipeOffset - 320} />
      <Image image={pipeBottom} width={104} height={640} x={x} y={height - 320 + pipeOffset} />
      <Image image={base} width={width} height={150} x={0} y={height - 75} fit={'cover'} />
      <Image image={bird} width={64} height={48} x={width / 4} y={height / 2} />
    </Canvas>
  )
}
export default App
