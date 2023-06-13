import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableHighlight,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Colors from '../constants/Colors';

export const Btn = ({
  customStyle = {},
  onPress = () => null,
  title,
  disabled = false,
  customTextStyle,
  backgroundColor = Colors.yellow,
  underlayColor = '#FFF',
  isLoading = false,
  children = [],
}) => {
  return (
    <TouchableHighlight
      style={{
        ...styles.btnView,
        ...{
          backgroundColor: backgroundColor,
          opacity: disabled ? 0.5 : 1,
          ...customStyle,
        },
      }}
      onPress={() => onPress()}
      underlayColor={underlayColor}
      disabled={disabled || isLoading}>
      {isLoading ? (
        <ActivityIndicator size={'small'} color={'#FFF'} />
      ) : title ? (
        <Text
          allowFontScaling={false}
          style={{...styles.title, ...customTextStyle}}>
          {title}
        </Text>
      ) : children ? (
        <>{children}</>
      ) : null}
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  btnView: {
    height: 50,
    width: '100%',
    justifyContent: 'center',
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    color: Colors.textColor,
    fontSize: 14,
    lineHeight: 17,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
  },
});
