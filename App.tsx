import { useEffect } from 'react'
import { Platform, useWindowDimensions } from 'react-native'
import { Canvas, useImage, Image, Group, Text, matchFont, Circle, Rect } from '@shopify/react-native-skia'
import {
  useSharedValue,
  withTiming,
  Easing,
  withSequence,
  withRepeat,
  useFrameCallback,
  useDerivedValue,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated'
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler'
import { useState } from 'react'

const GRAVITY = 1000
const JUMP_FORCE = -500

const App = () => {
  const { width, height } = useWindowDimensions()
  const [score, setScore] = useState(0)

  const bg = useImage(require('./assets/sprites/background-day.png'))
  const bird = useImage(require('./assets/sprites/yellowbird-upflap.png'))
  const pipeTop = useImage(require('./assets/sprites/pipe-green-top.png'))
  const pipeBottom = useImage(require('./assets/sprites/pipe-green.png'))
  const base = useImage(require('./assets/sprites/base.png'))

  const gameOver = useSharedValue(false)
  const pipeX = useSharedValue(width)
  const pipeWidth = 104
  const pipeHeight = 640
  const pipeOffset = useSharedValue(0)
  const topPipeY = useDerivedValue(() => pipeOffset.value - 320)
  const bottomPipeY = useDerivedValue(() => height - 320 + pipeOffset.value)

  const fontFamily = Platform.select({ ios: 'Helvetica', default: 'serif' })
  const fontStyle = {
    fontFamily,
    fontSize: 40,
    fontWeight: 'bold'
  }
  const font = matchFont(fontStyle)

  const birdPosX = width / 4
  const birdY = useSharedValue(height / 3)
  // const birdCenterX = useDerivedValue(() => birdPosX + 32)
  // const birdCenterY = useDerivedValue(() => birdY.value + 24)
  const birdYVelocity = useSharedValue(0)
  const birdTransform = useDerivedValue(() => {
    return [{ rotate: interpolate(birdYVelocity.value, [-500, 500], [-0.5, 0.5], Extrapolation.CLAMP) }]
  })
  const birdOrigin = useDerivedValue(() => {
    return { x: width / 4 + 32, y: birdY.value + 24 }
  })
  const obstacles = useDerivedValue(() => [
    {
      // add bottom pipe
      x: pipeX.value,
      y: pipeOffset.value - 320,
      height: pipeHeight,
      width: pipeWidth
    },
    {
      // add top pipe
      x: pipeX.value,
      y: height - 320 + pipeOffset.value,
      height: pipeHeight,
      width: pipeWidth
    }
  ])
  const pipeSpeed = useDerivedValue(() => {
    return interpolate(score, [0, 50], [1, 3])
  })

  const moveMap = () => {
    pipeX.value = withSequence(
      withTiming(width, { duration: 0 }),
      withTiming(-150, { duration: 3000 / pipeSpeed.value, easing: Easing.linear }),
      withTiming(width, { duration: 0 })
    )
  }

  useEffect(() => {
    moveMap
  }, [])

  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (!dt || gameOver.value) {
      return
    }

    birdY.value = birdY.value + (birdYVelocity.value * dt) / 1000
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * dt) / 1000
  })

  const restartGame = () => {
    'worklet'
    // need more info about JS tread and UI tread
    birdY.value = height / 3
    birdYVelocity.value = 0
    gameOver.value = false
    pipeX.value = width
    runOnJS(moveMap)()
    runOnJS(setScore)(0)
    // game work after restar only
  }

  const gesture = Gesture.Tap().onStart(() => {
    if (gameOver.value) {
      restartGame()
    } else {
      birdYVelocity.value = JUMP_FORCE
    }
  })

  useAnimatedReaction(
    () => pipeX.value,
    (currentValue, previousValue) => {
      const middle = birdPosX

      // random pipes positions
      if (previousValue && currentValue < -100 && previousValue > -100) {
        pipeOffset.value = Math.random() * 400 - 200
        cancelAnimation(pipeX)
        runOnJS(moveMap)()
      }

      if (currentValue !== previousValue && previousValue && currentValue <= middle && previousValue > middle) {
        runOnJS(setScore)(score + 1)
      }
    }
  )

  const isPointCollidingWithReact = (point, rect) => {
    'worklet'
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
  }

  // game over when bird down or up
  useAnimatedReaction(
    () => birdY.value,
    (currentValue, previousValue) => {
      // const birdCenterX = useDerivedValue(() => birdPosX + 32)
      // const birdCenterY = useDerivedValue(() => birdPosY.value + 24)
      const birdCenter = {
        x: birdPosX + 32,
        y: birdY.value + 24
      }

      // when bird down or up
      if (currentValue > height - 120 || currentValue < 0) {
        console.log('when bird down or up')
        gameOver.value = true
      }

      const isColliding = obstacles.value.some(rect => isPointCollidingWithReact(birdCenter, rect))

      if (isColliding) {
        console.log('colliding new')
        gameOver.value = true
      }
      // collision has to affect not only center of bird
    }
  )

  // stop pipes animation
  useAnimatedReaction(
    () => gameOver.value,
    (currentValue, previousValue) => {
      if (currentValue && !previousValue) {
        cancelAnimation(pipeX)
        // check game over value
      }
    }
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height }}>
          <Image image={bg} width={width} height={height} fit={'cover'} />
          <Image image={pipeTop} width={pipeWidth} height={pipeHeight} x={pipeX} y={topPipeY} />
          <Image image={pipeBottom} width={pipeWidth} height={pipeHeight} x={pipeX} y={bottomPipeY} />
          <Image image={base} width={width} height={150} x={0} y={height - 75} fit={'cover'} />

          <Group transform={birdTransform} origin={birdOrigin}>
            <Image image={bird} width={64} height={48} x={birdPosX} y={birdY} />
          </Group>

          {/* const birdCenterX = useDerivedValue(() => birdPosX + 32) */}
          {/* const birdCenterY = useDerivedValue(() => birdY.value + 24) */}
          {/* <Circle cx={birdCenterX} cy={birdCenterY} r={15} color={'blue'} /> */}

          <Text x={width / 2} y={height / 6} font={font} text={score.toString()} />
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}
export default App
