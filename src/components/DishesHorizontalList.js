import {View, Text, StyleSheet, Image} from 'react-native';
import React, {useMemo} from 'react';
import Colors from '../constants/Colors';
import {Platform} from 'react-native';
import common from '../../Utilites/Common';
import {FlatList} from 'react-native-gesture-handler';
import DayRecipeCard from './MenuScreen/DayRecipeCard';

const DishesHorizontalList = ({
  dishes = [],
  sectionName = '',
  withBackground = false,
  openRec = () => null,
  listHandler = () => null,
}) => {
  const sectionsInterval = useMemo(() => {
    return dishes.map(
      (item, index) =>
        index * (item?.is_big ? common.getLengthByIPhone7(272) : 164) + 15,
    );
  }, [dishes]);
  const secBackground = dishes[0]?.section_background;
  const isColor = secBackground ? secBackground[0] == '#' : false;
  return (
    <View key={sectionName}>
      <Text style={[styles.subtitle, {marginLeft: 16, marginTop: 8}]}>
        {sectionName}
      </Text>
      {!!secBackground && withBackground && (
        <Image
          source={{
            uri: isColor ? undefined : secBackground,
          }}
          style={[
            StyleSheet.absoluteFill,
            {
              zIndex: -1,
              backgroundColor: isColor ? secBackground : undefined,
            },
          ]}
        />
      )}
      <FlatList
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{
          paddingLeft: 16,
          paddingBottom: 14,
          paddingTop: 12,
          paddingRight: 6,
        }}
        data={dishes}
        keyExtractor={(item, index) =>
          sectionName + item.id.toString() + '_' + index
        }
        scrollEventThrottle={16}
        pagingEnabled={true}
        decelerationRate={Platform.select({ios: 'fast', android: 0.8})}
        snapToInterval={
          common.getLengthByIPhone7(0) - common.getLengthByIPhone7(32)
        }
        disableIntervalMomentum={true}
        snapToAlignment={'center'}
        snapToOffsets={sectionsInterval}
        renderItem={({item, index}) => (
          <DayRecipeCard
            recept={item}
            onPress={() => openRec(item)}
            listHandler={listHandler}
            key={sectionName + item.id}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  addsTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 19,
    color: Colors.textColor,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  dayTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginBottom: 10,
    marginTop: 21,
    marginLeft: 16,
  },
  timeText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 17,
    color: Colors.textColor,
  },
  normalDots: {
    height: 8,
    borderRadius: 4,
  },
  receptDaysBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    justifyContent: 'center',
    flexDirection: 'row',
    // alignItems:"center",
    flexWrap: 'wrap',

    borderRadius: 16,
  },
  statusContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
});

export default DishesHorizontalList;
