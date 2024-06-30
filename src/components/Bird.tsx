import { Group, Image } from '@shopify/react-native-skia'
import React from 'react'

const Bird = ({ bird, birdTransform, birdOrigin, birdPosX, birdY }) => {
  return (
    <Group transform={birdTransform} origin={birdOrigin}>
      <Image image={bird} width={64} height={48} x={birdPosX} y={birdY} />
    </Group>

    /* const birdCenterX = useDerivedValue(() => birdPosX + 32) */
    /* const birdCenterY = useDerivedValue(() => birdY.value + 24) */
    /* <Circle cx={birdCenterX} cy={birdCenterY} r={15} color={'blue'} /> */
  )
}

export default Bird
