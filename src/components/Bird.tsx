import { Circle, Group, Image } from '@shopify/react-native-skia'
import React from 'react'
import { Extrapolation, interpolate, useDerivedValue } from 'react-native-reanimated'

const Bird = ({ bird, birdUp, birdDown, width, birdPosX, birdY, birdYVelocity }) => {
  const birdTransform = useDerivedValue(() => {
    return [{ rotate: interpolate(birdYVelocity.value, [-700, 700], [-0.8, 0.8], Extrapolation.CLAMP) }]
  })

  const birdOrigin = useDerivedValue(() => {
    return { x: width / 4 + 32, y: birdY.value + 24 }
  })

  const birdImage = useDerivedValue(() => {
    if (birdYVelocity.value < -100) {
      return birdUp
    } else if (birdYVelocity.value > 100) {
      return birdDown
    } else {
      return bird
    }
  })

  const birdCenterX = useDerivedValue(() => birdPosX + 32)
  const birdCenterY = useDerivedValue(() => birdY.value + 24)

  return (
    <>
      <Group transform={birdTransform} origin={birdOrigin}>
        <Image image={birdImage} width={64} height={48} x={birdPosX} y={birdY} />
      </Group>

      {/* const birdCenterX = useDerivedValue(() => birdPosX + 32) */}
      {/* const birdCenterY = useDerivedValue(() => birdY.value + 24) */}
      <Circle cx={birdCenterX} cy={birdCenterY} r={20} color={'blue'} />
    </>
  )
}

export default Bird
