import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { Canvas, useImage } from '@shopify/react-native-skia'
import {
  useSharedValue,
  withTiming,
  Easing,
  withSequence,
  useFrameCallback,
  useDerivedValue,
  interpolate,
  useAnimatedReaction,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated'
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler'
import { useState } from 'react'
import Bird from './src/components/Bird'
import Scene from './src/components/Scene'
import Score from './src/components/Score'

const GRAVITY = 800
const JUMP_FORCE = -250
const AIR_RESISTANCE = 0.99
const MAX_VELOCITY = 500

const App = () => {
  const { width, height } = useWindowDimensions()
  const [score, setScore] = useState(0)

  const bird = useImage(require('./assets/sprites/yellowbird-midflap.png'))
  const birdUp = useImage(require('./assets/sprites/yellowbird-upflap.png'))
  const birdDown = useImage(require('./assets/sprites/yellowbird-downflap.png'))

  const bg = useImage(require('./assets/sprites/background-day.png'))
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

  const birdPosX = width / 4
  const birdY = useSharedValue(height / 3)
  // const birdCenterX = useDerivedValue(() => birdPosX + 32)
  // const birdCenterY = useDerivedValue(() => birdY.value + 24)
  const birdYVelocity = useSharedValue(0)

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
        console.log('colliding ---', obstacles.value, 'curr and prv', currentValue, previousValue)
        gameOver.value = true
      }
      // collision has to affect not only center of bird
    }
  )

  useEffect(() => {
    moveMap
  }, [])

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

  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    // if (!dt || gameOver.value) {
    //   return
    // }

    // birdY.value = birdY.value + (birdYVelocity.value * dt) / 1000
    // birdYVelocity.value = birdYVelocity.value + (GRAVITY * dt) / 1000

    if (!dt || gameOver.value) return

    // Apply gravity
    birdYVelocity.value += GRAVITY * (dt / 1000)

    // Apply air resistance
    birdYVelocity.value *= AIR_RESISTANCE

    // Limit velocity
    birdYVelocity.value = Math.max(Math.min(birdYVelocity.value, MAX_VELOCITY), -MAX_VELOCITY)

    // Update position
    birdY.value += birdYVelocity.value * (dt / 1000)
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
          <Scene
            bg={bg}
            pipeTop={pipeTop}
            pipeBottom={pipeBottom}
            base={base}
            width={width}
            height={height}
            pipeWidth={pipeWidth}
            pipeHeight={pipeHeight}
            pipeX={pipeX}
            topPipeY={topPipeY}
            bottomPipeY={bottomPipeY}
          />
          <Bird
            bird={bird}
            birdUp={birdUp}
            birdDown={birdDown}
            width={width}
            birdYVelocity={birdYVelocity}
            birdPosX={birdPosX}
            birdY={birdY}
          />
          <Score width={width} height={height} score={score.toString()} />
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  )
}
export default App
