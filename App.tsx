import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, useImage, Image, Group, Fill } from '@shopify/react-native-skia'
import {
  useSharedValue,
  withTiming,
  Easing,
  withSequence,
  withRepeat,
  useFrameCallback,
  useDerivedValue,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler'

const GRAVITY = 1000
const JUMP_FORCE = -500

const App = () => {
  const { width, height } = useWindowDimensions()

  const bg = useImage(require('./assets/sprites/background-day.png'))
  const bird = useImage(require('./assets/sprites/yellowbird-upflap.png'))
  const pipeTop = useImage(require('./assets/sprites/pipe-green-top.png'))
  const pipeBottom = useImage(require('./assets/sprites/pipe-green.png'))
  const base = useImage(require('./assets/sprites/base.png'))

  const x = useSharedValue(width)
  const pipeOffset = 0

  const birdY = useSharedValue(height / 3)
  const birdYVelocity = useSharedValue(0)
  const birdTransform = useDerivedValue(() => {
    return [{ rotate: interpolate(birdYVelocity.value, [-500, 500], [-0.5, 0.5], Extrapolation.CLAMP) }]
  })
  const birdOrigin = useDerivedValue(() => {
    return { x: width / 4 + 32, y: birdY.value + 24 }
  })

  useEffect(() => {
    x.value = withRepeat(
      withSequence(withTiming(-150, { duration: 3000, easing: Easing.linear }), withTiming(width, { duration: 0 })),
      -1
    )
  }, [])

  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (!dt) {
      return
    }

    birdY.value = birdY.value + (birdYVelocity.value * dt) / 1000
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * dt) / 1000
  })

  const gesture = Gesture.Tap().onStart(() => {
    birdYVelocity.value = JUMP_FORCE
  })

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height }}>
          <Image image={bg} width={width} height={height} fit={'cover'} />
          <Image image={pipeTop} width={104} height={640} x={x} y={pipeOffset - 320} />
          <Image image={pipeBottom} width={104} height={640} x={x} y={height - 320 + pipeOffset} />
          <Image image={base} width={width} height={150} x={0} y={height - 75} fit={'cover'} />

          <Group transform={birdTransform} origin={birdOrigin}>
            <Image image={bird} width={64} height={48} x={width / 4} y={birdY} />
          </Group>
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}
export default App
