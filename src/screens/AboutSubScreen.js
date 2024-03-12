import React, {useCallback, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import {ScrollView, TouchableHighlight} from 'react-native-gesture-handler';
import network, {getUserInfo, payAppleOrAndroid} from '../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Colors from '../constants/Colors';
import ProfileItem from '../components/ProfileScreen/ProfileItem';
import RNRestart from 'react-native-restart';

const AboutSubScreen = observer(({navigation}) => {
  const [loading, setLoading] = useState(false);

  const header = [
    <View style={styles.header} key={'subHeader'}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          left: 0,
          paddingVertical: 11,
          paddingHorizontal: 16,
          zIndex: 100,
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../../assets/icons/goBack.png')}
          style={{width: 11, height: 18, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <View style={{alignItems: 'center', alignSelf: 'center'}}>
        <Text style={styles.headerTitle}>
          {network?.strings?.AboutSubTitle}
        </Text>
      </View>
    </View>,
  ];

  const payHandler = async receptId => {
    try {
      setLoading(true);
      const isSubscription = network.subscriptions.find(
        subscription => subscription.productId == receptId,
      );
      let offerToken = null;
      if (isSubscription) {
        offerToken = isSubscription?.subscriptionOfferDetails[0]?.offerToken;
      }
      const requestBody = Platform.select({
        ios: {sku: receptId},
        android: {skus: [receptId]},
      });
      let receipt = null;
      if (isSubscription) {
      } else {
      }
      await payAppleOrAndroid(receipt);
      await getUserInfo();
    } catch (e) {
      console.log(e);
      setLoading(false);
      Alert.alert(network?.strings?.Error, network?.strings?.BuyError, [
        {
          text: network?.strings?.Reload,
          onPress: () => RNRestart.Restart(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const goToCancel = useCallback(() => {
    const link = network.user?.subscription?.unscribe_link;
    if (!link) {
      setTimeout(() => {
        Alert.alert(
          'Ошибка',
          'Ошибка при отмене подписки. Пожалуйста, напишите нам на почту для уточнения деталей (foodplan@foodplan.ru)',
        );
      }, 300);
      return;
    }
    if (link === 'appstore') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else if (link === 'googleplay') {
      Linking.openURL(
        'https://play.google.com/store/account/subscriptions?package=ru.foodplan.app',
      );
    } else {
      Linking.openURL(network.user?.subscription?.unscribe_link);
    }
    navigation.goBack();
  }, [navigation]);

  const cancelSub = () => {
    Alert.alert(
      network?.strings?.Attention,
      `${network?.strings?.CancelSubTitle} ${new Date(
        network.user?.subscription?.info?.expired,
      )?.toLocaleDateString()}`,
      [
        {
          text: network?.strings?.CancelSubAlertTitle,
          onPress: goToCancel,
        },
        {
          text: network?.strings?.NotCancel,
          style: 'cancel',
          onPress: () => null,
        },
      ],
    );
  };

  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      <SafeAreaView backgroundColor={'#FFF'} />
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        <View style={styles.container}>
          <Text style={[styles.title, {marginTop: 25}]}>
            {network?.strings?.CurrentSub}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: 50,
            }}>
            <View>
              <Text style={styles.itemTitle}>
                {network.user?.subscription?.plan?.name}
              </Text>
              <Text style={styles.itemSubtitle}>
                {network?.strings?.ActiveTill +
                  new Date(
                    network.user?.subscription?.info?.expired,
                  )?.toLocaleDateString()}
              </Text>
            </View>
            <TouchableHighlight
              style={{
                flexWrap: 'wrap',
                backgroundColor: '#F5F5F5',
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: 5,
                paddingHorizontal: 11,
                borderRadius: 16,
              }}
              underlayColor={'#EEEE'}
              onPress={() => cancelSub()}>
              <Text style={[styles.itemSubtitle, {color: Colors.textColor}]}>
                {network?.strings?.CancelSubBtnTitle}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
        {network.user?.subscription?.plan_recommend ? (
          <>
            <Text style={[styles.title, {paddingHorizontal: 16}]}>
              {network?.strings?.Try}
            </Text>
            <ProfileItem
              title={network.user?.subscription?.plan_recommend?.name}
              subtitle={network.user?.subscription?.plan_recommend?.desc}
              onPress={() =>
                payHandler(network.user?.subscription?.plan_recommend?.id)
              }
              key={network.user?.subscription?.plan_recommend?.id}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
});

export default AboutSubScreen;

const styles = StyleSheet.create({
  header: {
    height: 44,
    width: '100%',
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  container: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginTop: 41,
    marginBottom: 10,
  },
  itemTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay',
    }),
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.grayColor,
  },
});
