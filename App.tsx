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
  const x = useSharedValue(width)
  const pipeOffset = 0
  const pipeWidth = 104
  const pipeHeight = 640

  const fontFamily = Platform.select({ ios: 'Helvetica', default: 'serif' })
  const fontStyle = {
    fontFamily,
    fontSize: 40,
    fontWeight: 'bold'
  }
  const font = matchFont(fontStyle)

  const birdPosition = {
    x: width / 4
  }
  const birdY = useSharedValue(height / 3)
  const birdYVelocity = useSharedValue(0)
  const birdTransform = useDerivedValue(() => {
    return [{ rotate: interpolate(birdYVelocity.value, [-500, 500], [-0.5, 0.5], Extrapolation.CLAMP) }]
  })
  const birdOrigin = useDerivedValue(() => {
    return { x: width / 4 + 32, y: birdY.value + 24 }
  })

  const birdCenterX = useDerivedValue(() => birdPosition.x + 32)
  const birdCenterY = useDerivedValue(() => birdY.value + 24)
  const obstacles = useDerivedValue(() => {
    const allObstacles = []

    // add bottom pipe
    allObstacles.push({
      x: x.value,
      y: pipeOffset - 320,
      height: pipeHeight,
      width: pipeWidth
    })

    // add top pipe
    allObstacles.push({
      x: x.value,
      y: height - 320 + pipeOffset,
      height: pipeHeight,
      width: pipeWidth
    })

    return allObstacles
  })

  const moveMap = () => {
    x.value = withRepeat(
      withSequence(withTiming(-150, { duration: 3000, easing: Easing.linear }), withTiming(width, { duration: 0 })),
      -1
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
    x.value = width
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
    () => x.value,
    (currentValue, previousValue) => {
      const middle = birdPosition.x
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
      // when bird down or up
      if (currentValue > height - 120 || currentValue < 0) {
        console.log('when bird down or up')
        gameOver.value = true
      }

      const isColliding = obstacles.value.some(rect =>
        isPointCollidingWithReact({ x: birdCenterX.value, y: birdCenterY.value }, rect)
      )
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
        cancelAnimation(x)
        // check game over value
      }
    }
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height }}>
          <Image image={bg} width={width} height={height} fit={'cover'} />
          <Image image={pipeTop} width={pipeWidth} height={pipeHeight} x={x} y={pipeOffset - 320} />
          <Image image={pipeBottom} width={pipeWidth} height={pipeHeight} x={x} y={height - 320 + pipeOffset} />
          <Image image={base} width={width} height={150} x={0} y={height - 75} fit={'cover'} />

          <Group transform={birdTransform} origin={birdOrigin}>
            <Image image={bird} width={64} height={48} x={birdPosition.x} y={birdY} />
          </Group>
          <Circle cx={birdCenterX} cy={birdCenterY} r={15} color={'blue'} />

          <Text x={width / 2} y={height / 6} font={font} text={score.toString()} />
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}
export default App
