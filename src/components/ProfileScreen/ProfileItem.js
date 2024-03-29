import React from 'react'
import { View, Text, StyleSheet, Image, Platform,} from 'react-native'
import Colors from '../../constants/Colors'
import { TouchableHighlight } from 'react-native-gesture-handler'

const ProfileItem = ({title='',subtitle='',icon=null,onPress=() => null,height=50}) => {

  return (
      <TouchableHighlight onPress={() => onPress()} underlayColor={null} style={{paddingHorizontal:16}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',height}}>
            <View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    {icon ? <Image source={icon.source} style={{marginRight:13,...icon.style}} /> : null}
                    <Text style={styles.title}>{title}</Text>
                </View>
                {subtitle.length ? 
                    <Text style={styles.subtitle}>{subtitle}</Text> : null
                }
            </View>
            <Image source={require('../../../assets/icons/goDown.png')} 
                style={{width:13,height:8,transform:[{rotate:'-90deg'}]}}
            />
        </View>   
      </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    container:{
        borderRadius:16,borderWidth:4,borderColor:Colors.underLayYellow,
        padding:16,alignItems:'center'
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay' }),
        fontSize:16,lineHeight:19,
        color:Colors.textColor,
        fontWeight:'500',
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }),
        fontSize:14,lineHeight:17,
        fontWeight:'500',
        color:Colors.grayColor,
    },
})

export default ProfileItem