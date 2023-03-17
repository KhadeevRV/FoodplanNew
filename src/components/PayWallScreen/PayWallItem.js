import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Colors from '../../constants/Colors';
import {TouchableHighlight} from 'react-native-gesture-handler';
import common from '../../../Utilites/Common';
import DropShadow from 'react-native-drop-shadow';
import LinearGradient from 'react-native-linear-gradient';
import network from '../../../Utilites/Network';

const PayWallItem = ({plan, onPress = () => null, pressed}) => {
  return (
    <TouchableHighlight
      style={{
        ...styles.card,
        backgroundColor: pressed ? '#FFF' : '#F5F5F5',
        borderColor: pressed ? Colors.yellow : '#F5F5F5',
      }}
      underlayColor={'#FFF'}
      onPress={() => onPress()}>
      <>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text style={styles.title}>{plan?.name}</Text>
          {plan?.sale ? (
            <View style={styles.saleView}>
              <Text style={styles.hitText}>{plan?.sale}</Text>
            </View>
          ) : (
            <View />
          )}
          {plan?.hit ? (
            <View
              style={[
                styles.saleView,
                {
                  backgroundColor: Colors.underLayYellow,
                  position: 'absolute',
                  top: -6,
                  right: -8,
                  borderRadius: 4,
                },
              ]}>
              <Text style={styles.hitText}>Популярно</Text>
            </View>
          ) : (
            <View />
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
          }}>
          {plan?.old_price ? (
            <Text
              style={[
                styles.desc,
                {marginRight: 4, textDecorationLine: 'line-through'},
              ]}>
              {plan?.old_price + ' ' + network?.strings?.Currency}
            </Text>
          ) : null}
          <Text style={[styles.desc]}>{plan?.desc}</Text>
        </View>
      </>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay',
    }),
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  desc: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.textColor,
  },
  hitText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  saleView: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginLeft: 6,
    borderRadius: 10,
    backgroundColor: '#FE9700',
  },
  priceText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
});

export default PayWallItem;
