import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Image,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import common from '../../../Utilites/Common';
import {getStatusBarHeight, getBottomSpace} from 'react-native-iphone-x-helper';
import Colors from '../../constants/Colors';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {observer} from 'mobx-react-lite';
import DropShadow from 'react-native-drop-shadow';
import network from '../../../Utilites/Network';
import {getLabelImage} from '../MenuScreen/DayRecipeCard';

const FavorItem = observer(
  ({recept, onPress, listHandler, fromHoliday = false}) => {
    const isInList = !!network.listDishes.filter(item => item.id == recept.id)
      .length;
    const isInFavor = !!network.favorDishes.filter(item => item.id == recept.id)
      .length;
    const isAccess = network?.canOpenRec(recept);
    const isLoading = network.isLoadingBasket == recept.id;
    const isUnavailable = !!network.unavailableRecipes.filter(
      item => item.id == recept.id,
    ).length;
    const isInBasket = useMemo(() => {
      if (network.basketInfo?.recipes) {
        const hasRec = network.basketInfo?.recipes?.find(
          rec => rec == recept?.id,
        );
        if (hasRec) {
          return true;
        }
        return false;
      }
      return false;
    }, [network.basketInfo?.recipes]);

    const addBtn = () => {
      const iconUri = network.isBasketUser()
        ? require('../../../assets/icons/basket.png')
        : require('../../../assets/icons/list.png');
      return (
        <View style={{position: 'absolute', zIndex: 2000, top: 10, right: 10}}>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Platform.select({ios: null, android: '#E5E5E5'}),
              overflow: 'hidden',
            }}
            onPress={() =>
              listHandler(
                network.isBasketUser() ? isInBasket : isInList,
                recept,
              )
            }
            disabled={isLoading}
            activeOpacity={1}>
            <>
              {Platform.OS == 'ios' ? (
                <BlurView
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    borderRadius: 17,
                  }}
                  blurType="xlight"
                  blurAmount={24}
                  blurRadius={24}
                  reducedTransparencyFallbackColor={'#FFF'}
                />
              ) : null}
              {!isLoading ? (
                <Image
                  source={iconUri}
                  style={{
                    width: network.isBasketUser() ? 22 : 18,
                    height: 22,
                  }}
                />
              ) : (
                <ActivityIndicator color={Colors.textColor} />
              )}
            </>
          </TouchableOpacity>
        </View>
      );
    };

    const renderDeleteBtn = () => {
      return (
        <View style={{position: 'absolute', zIndex: 2000, top: 10, right: 10}}>
          <TouchableHighlight
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Colors.yellow,
            }}
            onPress={() =>
              listHandler(
                network.isBasketUser() ? isInBasket : isInList,
                recept,
              )
            }
            disabled={isLoading}
            underlayColor={Colors.underLayYellow}>
            {!isLoading ? (
              <Image
                source={require('../../../assets/icons/complete.png')}
                style={{width: 16, height: 12}}
              />
            ) : (
              <ActivityIndicator color={Colors.textColor} />
            )}
          </TouchableHighlight>
        </View>
      );
    };

    const isNewView = [
      <View
        style={{
          position: 'absolute',
          zIndex: 2000,
          top: 10,
          left: 10,
          paddingHorizontal: 6,
          paddingVertical: 1,
          borderRadius: 20,
          backgroundColor: Colors.textColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={styles.newText}>NEW</Text>
      </View>,
    ];

    const isNew = !!recept?.new;
    return (
      <>
        <View
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          }}>
          <TouchableOpacity
            onPress={() => onPress()}
            activeOpacity={1}
            style={[styles.card, {marginBottom: fromHoliday ? 16 : 20}]}>
            <FastImage
              source={{uri: recept?.images?.big_webp}}
              key={recept?.images?.big_webp}
              style={styles.image}>
              {isNew ? isNewView : null}
              {!network.isBasketUser()
                ? isInList
                  ? renderDeleteBtn()
                  : addBtn()
                : null}
              {network.isBasketUser() && network.enableBasket()
                ? isInBasket
                  ? renderDeleteBtn()
                  : addBtn()
                : null}
              {isAccess ? null : (
                <View
                  style={[
                    styles.image,
                    {
                      position: 'absolute',
                      backgroundColor: 'rgba(0,0,0,.4)',
                      zIndex: 100,
                    },
                  ]}
                />
              )}
              <LinearGradient
                colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .35)']}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: 13,
                  paddingHorizontal: 16,
                  paddingTop: 27,
                }}>
                <Image
                  style={{width: 20, height: 17}}
                  source={require('../../../assets/icons/hat.png')}
                />
                <Text style={styles.timeText}>{recept?.eating}</Text>
                <Image
                  style={{width: 17, height: 17, marginLeft: 12}}
                  source={require('../../../assets/icons/clock.png')}
                />
                <Text style={[styles.timeText, {marginRight: 9}]}>
                  {recept?.cook_time} {network?.strings?.MinutesFull}
                </Text>
                {getLabelImage(recept?.labels)}
              </LinearGradient>
            </FastImage>
            <View
              style={{
                height: 64,
                justifyContent: 'center',
                paddingHorizontal: 16,
              }}>
              <Text style={styles.title} numberOfLines={2}>
                {isUnavailable ? (
                  <View style={{width: 11, height: 11, marginRight: 4}}>
                    <Image
                      style={{width: 11, height: 11}}
                      source={require('../../../assets/icons/unavailable.png')}
                    />
                  </View>
                ) : null}
                {!isAccess ? (
                  <View style={{width: 11, height: 11, marginRight: 4}}>
                    <Image
                      style={{
                        width: 12,
                        height: 12,
                        top: Platform.OS == 'ios' ? 0 : 2,
                      }}
                      source={require('../../../assets/icons/accessRec.png')}
                    />
                  </View>
                ) : null}
                {Platform.OS == 'android' && isUnavailable ? '  ' : ''}
                {recept?.name}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  },
);

export default FavorItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textColor,
    maxWidth: common.getLengthByIPhone7() - 64,
  },
  timeText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: '#FFF',
    marginLeft: 4,
  },
  newText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 10,
    lineHeight: 12,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: '#FFF',
  },
  image: {
    width: common.getLengthByIPhone7() - 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'flex-end',
    height: common.getLengthByIPhone7(192),
  },
});
