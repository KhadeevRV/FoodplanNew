import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import Colors from '../../constants/Colors';
import network from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Modal from 'react-native-modal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Btn} from '../Btn';

export const VpnModal = observer(({modal, closeModal}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      isVisible={modal}
      onRequestClose={() => closeModal()}
      onBackdropPress={() => closeModal()}
      swipeDirection={['down']}
      onSwipeComplete={() => closeModal()}
      propagateSwipe={true}
      backdropOpacity={0.4}
      style={{margin: 0, justifyContent: 'flex-end'}}>
      <View style={[styles.mainBlock, {paddingBottom: 8 + insets.bottom}]}>
        <Text style={styles.title}>
          {network?.strings?.alertBeforeOrderTitle}
        </Text>
        <Text style={[styles.subText]}>
          {network?.strings?.alertBeforeOrderDesc}
        </Text>
        <Btn
          title={network?.strings?.alertBeforeOrderButtonText}
          customTextStyle={{color: '#FFF'}}
          customStyle={{marginTop: 16}}
          onPress={closeModal}
        />
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  title: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 16,
    alignSelf: 'center',
    lineHeight: 19,
    marginBottom: 21,
    color: Colors.textColor,
    fontWeight: 'bold',
  },
  mainBlock: {
    backgroundColor: '#FFF',
    paddingTop: 22,
    paddingHorizontal: 16,
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
  },
  row: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 17,
    alignSelf: 'center',
    lineHeight: 20,
    color: Colors.textColor,
    fontWeight: '500',
  },
  subText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: '500',
  },
});
