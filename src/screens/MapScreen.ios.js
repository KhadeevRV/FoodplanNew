import React, {Component, useState, useRef, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  TouchableOpacity,
  Animated,
  Text,
  Image,
  Platform,
  TouchableHighlight,
  Alert,
  ActivityIndicator,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import YaMap, {Geocoder, Suggest} from 'react-native-yamap';
import Colors from '../constants/Colors';
import BottomSheet from '@gorhom/bottom-sheet';
import SearchBar from '../components/SearchBar';
import network, {
  getGeoData,
  getStoresByCoords,
  getUserInfo,
  setUserAddress,
  yandexGeoToCoords,
} from '../../Utilites/Network';
import Geolocation from '@react-native-community/geolocation';
import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';
import Config from '../constants/Config';
import {ShadowView} from '../components/ShadowView';
import {strings} from '../../assets/localization/localization';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

Geocoder.init('e95c2f91-cd98-4e7c-be76-c7ec244d0ef1');

const MapScreen = observer(({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const bottomSheetHeight = 190 + insets.bottom;
  const animVal = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const map = useRef(null);
  const bottomSheetRef = useRef(null);
  const inputRef = useRef(null);
  const [address, setAddress] = useState('');
  const [fullAddress, setFullAddress] = useState({});
  const [addressCoords, setAddressCoords] = useState({});
  const [isInput, setIsInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullAdr, setIsFullAdr] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [inputAddress, setInputAddress] = useState('');
  const [addressTips, setAddressTips] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const fromOnboarding = route.params?.fromOnboarding;
  const withBack =
    !fromOnboarding ||
    (fromOnboarding &&
      Object.keys(network.registerOnboarding)[0] === 'MapScreen');
  const screen = network.onboarding?.MapScreen;
  const snapPoints = useMemo(
    () => [
      bottomSheetHeight,
      Dimensions.get('window').height - (20 + insets.top),
    ],
    [],
  );

  const onWithoutStore = async () => {
    setIsLoading(true);
    await setUserAddress(
      addressCoords.latitude,
      addressCoords.longitude,
      address,
      fullAddress,
    );
    await getUserInfo();
    fromOnboarding
      ? navigation.navigate(screen?.next_board ?? 'MainStack')
      : navigation.goBack();
    setIsLoading(false);
  };

  const sendError = withAlert => {
    withAlert
      ? Alert.alert(Config.appName, network?.strings?.UserGeoError, [
          {
            text: network?.strings?.Allow,
            onPress: () => Linking.openSettings(),
          },
          {text: network?.strings?.BackText},
        ])
      : null;
    map?.current?.setCenter({lat: 55.751825, lon: 37.617476}, 18);
  };

  const hasIosPermission = async withAlert => {
    try {
      await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      Geolocation.getCurrentPosition(
        position => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          coordsToAddress(coords, true);
        },
        err => sendError(withAlert),
      );
    } catch (error) {
      console.warn(error);
    }
  };

  const hasAndroidPermission = async withAlert => {
    const permission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      setTimeout(() => {
        Geolocation.getCurrentPosition(position => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          coordsToAddress(coords, true);
        });
      }, 200);
      return true;
    } else {
      const status = await PermissionsAndroid.request(permission);
      if (status == 'granted') {
        hasAndroidPermission();
      } else {
        sendError(withAlert);
      }
    }
  };

  const checkLocation = (withAlert = false) => {
    if (Platform.OS == 'ios') {
      hasIosPermission(withAlert);
    } else {
      hasAndroidPermission(withAlert);
    }
  };

  const checkMap = () => {
    if (map.current && mapReady) {
      checkLocation();
    } else {
      setTimeout(() => checkMap(), 500);
    }
  };

  useEffect(() => {
    checkMap();
  }, [mapReady]);

  const confirmAddress = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const stores = await getStoresByCoords(
        addressCoords.latitude,
        addressCoords.longitude,
      );
      if (stores.length) {
        navigation.navigate('StoresScreen', {
          title: address,
          stores: stores,
          coords: {lat: addressCoords.latitude, lon: addressCoords.longitude},
          fullAddress: fullAddress,
        });
      } else {
        setErrorMessage(network.strings?.NoDelivery);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Ошибка', e);
    }
  };

  const coordsToAddress = async (coords, isInitial, initialParams = null) => {
    const params = initialParams
      ? initialParams
      : await getGeoData({
          latitude: coords.lat,
          longitude: coords.lon,
          is_yandex: true,
        });
    errorMessage ? setErrorMessage('') : null;
    console.log('params', params);
    isInitial
      ? setTimeout(() => map?.current?.setCenter(coords, 17), 500)
      : null;
    setAddress(params?.full_address || params?.address);
    setAddressCoords({
      latitude: coords.lat,
      longitude: coords.lon,
    });
    setFullAddress(params?.full_address || params?.address);
    setIsFullAdr(!!params?.is_full);
  };

  const mapPressHandle = value => {
    Animated.timing(animVal, {
      toValue: value,
      duration: 300,
      useNativeDriver: true,
    }).start();
    Animated.timing(dotOpacity, {
      toValue: value ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    if (!value) {
      map.current?.getCameraPosition(async pos => {
        const coords = pos.point;
        coords ? coordsToAddress(coords) : null;
      });
    }
  };

  const handleSheet = value => {
    setIsInput(!!value);
    bottomSheetRef?.current?.snapToIndex(value);
  };
  const searchAddress = async text => {
    setInputAddress(text);
    if (text.length > 3) {
      const sugResp = await getGeoData({address: text, is_yandex: true});
      console.log('sugResp', sugResp);
      setAddressTips(sugResp);
    } else if (text.length == 0) {
      setAddressTips([]);
    }
  };
  const renderInputView = () => {
    return (
      <View>
        <View
          style={{
            padding: 16,
            paddingRight: 52,
            borderBottomWidth: 0.5,
            borderColor: '#D3D3D3',
          }}>
          <SearchBar
            placeholder={network.strings?.Address}
            value={inputAddress}
            onChange={searchAddress}
            autoFocus={true}
          />
          <TouchableOpacity
            style={{
              paddingHorizontal: 16,
              position: 'absolute',
              top: 21,
              right: 0,
            }}
            onPress={() => handleSheet(0)}>
            <Image
              source={require('../../assets/icons/map.png')}
              style={{
                width: 20,
                height: 20,
              }}
            />
          </TouchableOpacity>
        </View>
        {addressTips.map((item, index) => (
          <TouchableOpacity
            key={index.toString()}
            style={styles.tipsView}
            onPress={async () => {
              const coords = {lat: item?.latitude, lon: item?.longitude};
              if (item?.is_full) {
                coordsToAddress(coords, true, item);
                handleSheet(0);
              }
              searchAddress(item?.full_address);
            }}>
            <Text style={styles.tipsTitle}>{item?.title}</Text>
            <Text style={styles.tipsSubtitle}>{item?.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSheetView = () => {
    return (
      <>
        <View
          style={{
            paddingVertical: 22,
            alignItems: 'center',
          }}>
          <Text style={styles.sheetTitle}>{network.strings?.Address}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleSheet(1)}
          style={styles.addressSheetView}>
          {errorMessage ? (
            <Image
              source={require('../../assets/icons/attention.png')}
              style={{
                width: 22,
                height: 22,
                marginRight: 10,
              }}
            />
          ) : (
            <Image
              source={require('../../assets/icons/location.png')}
              style={{
                width: 20,
                height: 24,
                marginRight: 8,
                tintColor: address ? Colors.textColor : Colors.grayColor,
              }}
            />
          )}
          <Text
            numberOfLines={3}
            style={[
              styles.addressSheetValue,
              {color: address ? Colors.textColor : Colors.grayColor},
            ]}>
            {address && !errorMessage
              ? address
              : errorMessage
              ? errorMessage
              : network.strings?.NoAddress}
          </Text>
          {address ? (
            <Image
              source={require('../../assets/icons/goBack.png')}
              style={{
                width: 8,
                height: 13,
                transform: [{rotate: '180deg'}],
                position: 'absolute',
                right: 16,
              }}
            />
          ) : null}
        </TouchableOpacity>
        <TouchableHighlight
          onPress={() => (isFullAdr ? confirmAddress() : handleSheet(1))}
          style={styles.touchContainer}
          disabled={isLoading}
          underlayColor={Colors.underLayYellow}>
          {isLoading ? (
            <ActivityIndicator color={'#FFF'} />
          ) : (
            <Text style={styles.addressSheetValue}>
              {isFullAdr
                ? network.strings?.ConfirmLocation
                : network.strings?.ManualAddress}
            </Text>
          )}
        </TouchableHighlight>
      </>
    );
  };

  return (
    <View style={{flex: 1}}>
      <View
        style={{
          maxHeight: Dimensions.get('window').height - bottomSheetHeight + 35,
          maxWidth: Dimensions.get('window').width,
        }}
        onLayout={() => setTimeout(() => setMapReady(true), 1000)}>
        {mapReady && (
          <YaMap
            ref={map}
            style={{
              height: Dimensions.get('window').height - bottomSheetHeight + 35,
              maxWidth: Dimensions.get('window').width,
              position: 'absolute',
              width: '100%',
            }}
            onTouchStart={() => mapPressHandle(-20)}
            onTouchEnd={() => mapPressHandle(0)}
            // onCameraPositionChange={e => console.log(e.nativeEvent)}
          />
        )}
        <Animated.View
          style={[
            styles.circleContainer,
            {
              transform: [{translateY: animVal}],
              top:
                (Dimensions.get('window').height - bottomSheetHeight + 16) / 2 -
                55,
            },
          ]}>
          <View style={styles.circleView} />
          <View
            style={{
              width: 2,
              height: 23,
              borderRadius: 1,
              backgroundColor: Colors.textColor,
              alignSelf: 'center',
            }}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.circleContainer,
            {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: Colors.grayColor,
              top:
                (Dimensions.get('window').height - bottomSheetHeight + 16) / 2 +
                20,
              left: Dimensions.get('window').width / 2 - 2,
              opacity: dotOpacity,
            },
          ]}
        />
        {withBack && (
          <TouchableOpacity
            disabled={isLoading}
            style={[styles.backView, {top: insets.top}]}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/icons/back.png')}
              style={{width: 18, height: 18}}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          disabled={isLoading}
          style={[
            styles.locationView,
            {
              top:
                Dimensions.get('window').height -
                bottomSheetHeight -
                Platform.select({ios: 56, android: 76}),
            },
          ]}
          onPress={() => checkLocation(true)}>
          <Image
            source={require('../../assets/icons/myLocation.png')}
            style={{width: 20, height: 20}}
          />
        </TouchableOpacity>
        {errorMessage ? (
          <ShadowView>
            <TouchableOpacity
              disabled={isLoading}
              onPress={() => onWithoutStore()}
              style={{
                position: 'absolute',
                paddingVertical: 11,
                paddingHorizontal: 32,
                top: Dimensions.get('window').height - bottomSheetHeight - 56,
                alignSelf: 'center',
                zIndex: 100000,
                backgroundColor: '#FFF',
                borderRadius: 20,
              }}>
              <Text
                style={[styles.addressSheetValue, {color: Colors.textColor}]}>
                {network.strings?.WithoutDeliveryButton}
              </Text>
            </TouchableOpacity>
          </ShadowView>
        ) : null}
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enableContentPanningGesture={false}
        handleStyle={{display: 'none'}}
        style={{zIndex: 100}}>
        {isInput ? renderInputView() : renderSheetView()}
      </BottomSheet>
    </View>
  );
});

export default MapScreen;

const styles = StyleSheet.create({
  circleContainer: {
    position: 'absolute',
    zIndex: 1,
    left: Dimensions.get('window').width / 2 - 26,
  },
  circleView: {
    width: 56,
    height: 56,
    backgroundColor: '#FFF',
    borderWidth: 16,
    borderColor: Colors.textColor,
    borderRadius: 28,
  },
  addressSheetView: {
    padding: 16,
    paddingRight: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressSheetValue: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: '#FFF',
  },
  touchContainer: {
    backgroundColor: Colors.yellow,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  sheetTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
    color: Colors.textColor,
  },
  tipsView: {
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 11,
  },
  tipsTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textColor,
  },
  tipsSubtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: Colors.grayColor,
  },
  backView: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
  },
  locationView: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
  },
});
