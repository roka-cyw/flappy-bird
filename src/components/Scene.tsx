import { Image, useImage } from '@shopify/react-native-skia'
import React from 'react'

const Scene = ({
  bg,
  pipeTop,
  pipeBottom,
  base,
  width,
  height,
  pipeWidth,
  pipeHeight,
  pipeX,
  topPipeY,
  bottomPipeY
}) => {
  // const bg = useImage(require('./assets/sprites/background-day.png'))
  // const pipeTop = useImage(require('./assets/sprites/pipe-green-top.png'))
  // const pipeBottom = useImage(require('./assets/sprites/pipe-green.png'))
  // const base = useImage(require('./assets/sprites/base.png'))

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
