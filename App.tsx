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

const GRAVITY = 1200
const JUMP_FORCE = -500
const GROUND = 130
const BIRD_RADIUS = 20

const App = () => {
  const { width, height } = useWindowDimensions()
  const [score, setScore] = useState(0)
  const changePipe = useSharedValue('')

  const bird = useImage(require('./assets/sprites/yellowbird-midflap.png'))
  const birdUp = useImage(require('./assets/sprites/yellowbird-upflap.png'))
  const birdDown = useImage(require('./assets/sprites/yellowbird-downflap.png'))

  const bgDay = useImage(require('./assets/sprites/background-day.png'))
  const bgNight = useImage(require('./assets/sprites/background-night.png'))
  const pipeTop = useImage(require('./assets/sprites/pipe-green-top.png'))
  const pipeBottom = useImage(require('./assets/sprites/pipe-green.png'))
  const pipeRedTop = useImage(require('./assets/sprites/pipe-red-top.png'))
  const pipeRedBottom = useImage(require('./assets/sprites/pipe-red.png'))
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
  const birdYVelocity = useSharedValue(0)

  const obstacles = useDerivedValue(() => [
    {
      x: pipeX.value,
      y: pipeOffset.value - 320,
      height: pipeHeight,
      width: pipeWidth,
      position: 'top'
    },
    {
      x: pipeX.value,
      y: height - 320 + pipeOffset.value,
      height: pipeHeight,
      width: pipeWidth,
      position: 'bottom'
    }
  ])

  const isPipeColliding = (point, rect) => {
    'worklet'
    return (
      point.x + BIRD_RADIUS > rect.x &&
      point.x - BIRD_RADIUS < rect.x + rect.width &&
      point.y + BIRD_RADIUS > rect.y &&
      point.y - BIRD_RADIUS < rect.y + rect.height
    )
  }

  // game over when bird down or up
  useAnimatedReaction(
    () => birdY.value,
    (currentValue, previousValue) => {
      const birdCenter = {
        x: birdPosX + 32,
        y: birdY.value + 24
      }

      // when bird down or up
      if (currentValue > height - GROUND || currentValue < 30) {
        gameOver.value = true
      }

      const isColliding = obstacles.value.findIndex(rect => isPipeColliding(birdCenter, rect))

      if (isColliding !== -1) {
        changePipe.value = obstacles.value[isColliding].position
        gameOver.value = true
      }
    }
  )

  useEffect(() => {
    moveMap
  }, [])

  const pipeSpeed = useDerivedValue(() => {
    return interpolate(score, [0, 50], [1, 3])
  })

  const moveMap = () => {
    if (changePipe.value !== '') return

    pipeX.value = withSequence(
      withTiming(width, { duration: 0 }),
      withTiming(-150, { duration: 3000 / pipeSpeed.value, easing: Easing.linear }),
      withTiming(width, { duration: 0 })
    )
  }

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
    changePipe.value = ''
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
            bgDay={bgDay}
            bgNight={bgNight}
            pipeTop={pipeTop}
            pipeBottom={pipeBottom}
            pipeRedTop={pipeRedTop}
            pipeRedBottom={pipeRedBottom}
            changePipe={changePipe}
            score={score}
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
