import { Image } from '@shopify/react-native-skia'
import React from 'react'

const Scene = ({
  base,
  bg,
  width,
  height,
  pipeTop,
  pipeBottom,
  pipeWidth,
  pipeHeight,
  pipeX,
  topPipeY,
  bottomPipeY
}) => {
  return (
    <>
      <Image image={bg} width={width} height={height} fit={'cover'} />
      <Image image={pipeTop} width={pipeWidth} height={pipeHeight} x={pipeX} y={topPipeY} />
      <Image image={pipeBottom} width={pipeWidth} height={pipeHeight} x={pipeX} y={bottomPipeY} />
      <Image image={base} width={width} height={150} x={0} y={height - 75} fit={'cover'} />
    </>
  )
}

export default Scene
