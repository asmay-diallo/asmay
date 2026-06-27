import {StyleSheet,View, Text, Image, TouchableOpacity} from 'react-native'
import {ToastConfigParams} from 'react-native-toast-message';
import { useRouter } from 'expo-router';

const router = useRouter()


export const  toastConfig = {
 // Config de likes Infos pour poper 
  userLikeInfos: ({ text1, text2, props }: ToastConfigParams<any>) => (
    <View style={styles.userToast}>
      <Image 
        source={{ uri: props.avatarUrl || props.username?.toUpperCase() }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{text1}</Text>
        <Text style={styles.userNickname}>{text2}</Text>
        {props.message && <Text style={styles.userMessage}>{props.message}</Text>}
      </View>
    </View>
  ),
  // Config de messages Infos pour poper
  messagesInfos:({text1,text2,props}:ToastConfigParams<any>)=>(
      <View style={styles.userToast}>
      <Image 
        source={{ uri: props.avatarUrl || props.username?.toUpperCase() }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{text1}</Text>
        {
         props.messageType === 'text' ?
          props.message && <Text style={styles.userMessage}>{props.message}</Text>:
        <Text style={styles.userNickname}>Message vocal 🎤</Text>
        }
      </View>
    </View>
  ),
  // Config de signals pour poper
  signalsInfos:({text1,text2,props}:ToastConfigParams<any>)=>(
    <View style={styles.userToast}>
      <Image 
        source={{ uri: props.avatarUrl || props.username?.toUpperCase() }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{text1}</Text>
        <Text style={styles.userNickname}>{text2}</Text>
        {props.message && <Text style={styles.userMessage}>{props.message}</Text>}
      </View>
      <View style={styles.userInfo}>
        <TouchableOpacity style={styles.buttonVoir} onPress={()=>router.navigate('/(main)/(asmay)/notifications')}>
          <Text style={styles.textVoir}>Voir</Text>
        </TouchableOpacity>
      </View>

    </View>
  ),
  success: (props: any) => (
    <View style={[styles.userToast, styles.successToast]}>
      <Text>{props.text1}</Text>
    </View>
  ),
}

const styles = StyleSheet.create({
  userToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  userNickname: { fontSize: 13, color: '#FF6B6B', fontWeight: '500', marginTop: 2 },
  userMessage: { fontSize: 12, color: '#666', marginTop: 2 },
  successToast: { backgroundColor: '#D4EDDA' },
  buttonVoir:{
    backgroundColor:"#ff6b6b",
    padding:5
  },
  textVoir:{
    color:"#fff"
  }
});