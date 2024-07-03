import { Image } from '@shopify/react-native-skia'
import React from 'react'
import { useDerivedValue } from 'react-native-reanimated'

const AVAILABLE_BACKGROUNDS = 2
const CHANGE_EVERY_POINTS = 6

const Scene = ({
  bgDay,
  bgNight,
  pipeTop,
  pipeBottom,
  pipeRedTop,
  pipeRedBottom,
  changePipe,
  score,
  base,
  width,
  height,
  pipeWidth,
  pipeHeight,
  pipeX,
  topPipeY,
  bottomPipeY
}) => {
  const bg = useDerivedValue(() => (Math.floor(score / CHANGE_EVERY_POINTS) % AVAILABLE_BACKGROUNDS ? bgNight : bgDay))
  const pipeTopImage = useDerivedValue(() => (changePipe.value === 'top' ? pipeRedTop : pipeTop))
  const pipeBottomImage = useDerivedValue(() => (changePipe.value === 'bottom' ? pipeRedBottom : pipeBottom))

  return (
    <>
      <Image image={bg} width={width} height={height} fit={'cover'} />
      <Image image={pipeTopImage} width={pipeWidth} height={pipeHeight} x={pipeX} y={topPipeY} />
      <Image image={pipeBottomImage} width={pipeWidth} height={pipeHeight} x={pipeX} y={bottomPipeY} />
      <Image image={base} width={width} height={150} x={0} y={height - 75} fit={'cover'} />
    </>
  )
}

export default Scene
