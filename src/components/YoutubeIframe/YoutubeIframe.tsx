import { Pressable, View } from 'react-native'
import React from 'react'
import YoutubePlayer from 'react-native-youtube-iframe'
import { CmsAspectRatios, YoutubeIframeProps } from '../../appTypes'
import { widthScale } from '../../util'

const calculateHeight = (aspectRatio: string, width: number): number => {
  switch (aspectRatio) {
    case CmsAspectRatios.LANDSCAPE:
      return (width * 9) / 16
    case CmsAspectRatios.PORTRAIT:
      return (width * 3) / 2
    case CmsAspectRatios.ORIGINAL:
    case CmsAspectRatios.SQUARE:
    default:
      return width
  }
}

export const YoutubeIframe = (props: YoutubeIframeProps) => {
  const { aspectRatio = '1/1', youtubeVideoId, width = 200 } = props
  const imageHeight = calculateHeight(aspectRatio, width)
  const [play, setPlay] = React.useState(false)

  return (
    <Pressable onPress={() => setPlay(!play)}>
      <View pointerEvents="none">
        <YoutubePlayer
          play={play}
          height={aspectRatio ? imageHeight : width}
          width={width}
          videoId={youtubeVideoId}
          initialPlayerParams={{
            loop: true,
            controls: false,
            rel: false,
          }}
          webViewStyle={{borderRadius:widthScale(12)}}
          webViewProps={{
            injectedJavaScript: `
                    var element = document.getElementsByClassName('container')[0];
                    element.style.position = 'unset';
                    true;
                    `,
            javaScriptEnabled: true,
          }}
        />
      </View>
    </Pressable>
  )
}
