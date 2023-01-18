import React, {useState} from 'react';
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

const PayWallItem = ({plan, onPress = () => null, pressed}) => {
  const [linewidth, setlinewidth] = useState(0);

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
            justifyContent: 'space-between',
          }}>
          <Text style={styles.title}>{plan?.name}</Text>
          <Text style={styles.priceText}>{plan?.price}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
          }}>
          {plan?.sale ? (
            <View style={styles.saleView}>
              <Text style={styles.hitText}>{plan?.sale}</Text>
            </View>
          ) : (
            <View />
          )}
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
    borderWidth: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 66,
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
      android: 'SFProDisplay',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: Platform.select({ios: '700', android: 'bold'}),
    color: '#FFF',
  },
  saleView: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#A157FF',
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
