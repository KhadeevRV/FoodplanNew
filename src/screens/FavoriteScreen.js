import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import network from '../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import common from '../../Utilites/Common';
import Colors from '../constants/Colors';
import BottomListBtn from '../components/BottomListBtn';
import {UnavailableProductsModal} from '../components/UnavailableProductsModal';
import {SaleModal} from '../components/PayWallScreen/SaleModal';
import DishesHorizontalList from '../components/DishesHorizontalList';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const FavoriteScreen = observer(({navigation}) => {
  const [unavailableModal, setUnavailableModal] = useState(false);
  const [unavailableRecipe, setUnavailableRecipe] = useState({});
  const [saleModal, setSaleModal] = useState(false);
  const insets = useSafeAreaInsets();
  const eatings = useMemo(() => {
    if (network.favorDishes.length) {
      const sortedEatings = [...network.favorDishes]
        .sort((a, b) => a?.eating_sort - b?.eating_sort)
        .map(dish => dish?.eating);
      return [...new Set(sortedEatings)];
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network.favorDishes.length]);

  const openRec = useCallback(
    rec => {
      if (network.canOpenRec(rec)) {
        navigation.navigate('ReceptScreen', {rec: rec});
      } else if (network.paywalls?.paywall_sale_modal) {
        setSaleModal(true);
      } else {
        navigation.navigate('PayWallScreen', {
          data: network.paywalls[network.user?.banner?.type],
        });
      }
    },
    [navigation],
  );

  const openPaywall = useCallback(() => {
    if (network.paywalls?.paywall_sale_modal) {
      setSaleModal(true);
    } else {
      navigation.navigate('PayWallScreen', {
        data: network.paywalls[network.user?.banner?.type],
      });
    }
  }, [navigation]);

  const listHandler = useCallback(
    (isInBasket, recept) => {
      if (network.isBasketUser()) {
        const isUnavailable = network.unavailableRecipes.find(
          rec => rec.id == recept.id,
        );
        if (isInBasket) {
          network.basketHandle(
            isInBasket,
            recept.id,
            recept.persons,
            'MenuScreen',
          );
          return;
        }
        if (!network.canOpenRec(recept)) {
          openPaywall();
          return;
        }
        if (isUnavailable) {
          setUnavailableRecipe(recept);
          setUnavailableModal(true);
          return;
        }
        network.basketHandle(
          isInBasket,
          recept.id,
          recept.persons,
          'MenuScreen',
        );
      } else {
        // Если блюдо в списке, то удаляем. Если нет, то проверяем, можно ли его добавить(открыть)
        if (isInBasket) {
          network.deleteFromList(recept);
        } else if (network.canOpenRec(recept)) {
          network.addToList(recept);
        } else {
          openPaywall();
        }
      }
    },
    [openPaywall],
  );

  // const filterHandler = what => {
  //   setCurrentFilters(what);
  //   if (what.length) {
  //     const newFavor = network.favorDishes.filter(dish => {
  //       for (let i = 0; i < what.length; i++) {
  //         if (dish?.eating == what[i]) {
  //           return true;
  //         }
  //       }
  //     });
  //     setFilteredFavors(newFavor);
  //   } else {
  //     setFilteredFavors(network.favorDishes);
  //   }
  // };

  const header = [
    <View style={styles.header} key={'favorHeader'}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          left: 0,
          paddingVertical: 12,
          paddingHorizontal: 16,
          zIndex: 100,
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../../assets/icons/goBack.png')}
          style={{width: 11, height: 18, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {network.strings?.FavouritesHeadline}
      </Text>
    </View>,
  ];

  const renderBody = useCallback(() => {
    if (eatings.length) {
      const body = [];
      for (let i = 0; i < eatings.length; i++) {
        const el = eatings[i];
        const eatingsDishes = network.favorDishes.filter(
          dish => dish.eating === el,
        );
        body.push(
          <DishesHorizontalList
            dishes={eatingsDishes}
            sectionName={el}
            openRec={openRec}
            listHandler={listHandler}
            key={el}
          />,
        );
      }
      return (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: insets.bottom}}>
          {body}
        </ScrollView>
      );
    }
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={require('../../assets/img/emptyFavors.png')}
          style={{width: 112, height: 96, marginBottom: 19}}
        />
        <Text style={styles.title}>{network.strings?.FavoritesEmpty}</Text>
        <Text style={styles.subtitle}>
          {network.strings?.FavoritesEmptyDescr}
        </Text>
      </View>
    );
  }, [eatings, insets.bottom, listHandler, openRec]);

  useEffect(() => {
    const onBlur = navigation.addListener('blur', () => {
      const newArr = [];
      for (let i = 0; i < network.favorDishes.length; i++) {
        let dish = network.favorDishes[i];
        runInAction(() => (dish.new = false));
        newArr.push(dish);
      }
      runInAction(() => (network.favorDishes = newArr));
    });
    return onBlur;
  }, [navigation]);

  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      <SafeAreaView backgroundColor={'#FFF'} />
      {header}
      {renderBody()}
      {network.isBasketUser() &&
      network?.basketInfo?.items_in_cart &&
      network.enableBasket() ? (
        <BottomListBtn key={'BottomListMenu'} navigation={navigation} />
      ) : !network.isBasketUser() && network.listDishes.length ? (
        <BottomListBtn key={'BottomListMenu'} navigation={navigation} />
      ) : null}
      <UnavailableProductsModal
        modal={unavailableModal}
        closeModal={() => setUnavailableModal(false)}
        unavailableRecipe={unavailableRecipe}
      />
      <SaleModal
        modal={saleModal}
        closeModal={() => setSaleModal(false)}
        navigation={navigation}
      />
    </View>
  );
});

export default FavoriteScreen;

const styles = StyleSheet.create({
  header: {
    height: 44,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
  headerSubitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: Colors.textColor,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    lineHeight: 25,
    color: Colors.textColor,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: Colors.textColor,
    maxWidth: common.getLengthByIPhone7(260),
    textAlign: 'center',
  },
});
