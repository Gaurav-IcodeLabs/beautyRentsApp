import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { fontScale } from '../../util';
import { colors } from '../../theme';

export const Countdown: React.FC<{
  initialSeconds?: number;
  txt: string;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  timerNumberStyle?: TextStyle;
  setIsCounting: (isCounting: boolean) => void;
  isCounting: boolean;
}> = ({
  initialSeconds = 10,
  isCounting = false,
  setIsCounting,
  txt,
  containerStyle,
  textStyle,
  timerNumberStyle,
}): React.ReactElement => {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  useEffect(() => {
    let interval: any = null;
    if (isCounting && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(interval);
      setIsCounting(false);
      setSeconds(initialSeconds);
    }
    return () => {
      clearInterval(interval);
    };
  }, [isCounting, seconds, initialSeconds, setIsCounting]);

  if (!isCounting) {
    return <View />;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.timerText, textStyle]}>
        {txt}
        <Text style={[styles.timerText, timerNumberStyle]}>
          {' '}
          {seconds} Seconds{' '}
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: fontScale(14),
    color: colors.grey,
  },
});
