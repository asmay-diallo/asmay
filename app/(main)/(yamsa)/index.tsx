//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet,TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// create a component
const MyComponent = () => {
    const router = useRouter()
    return (
        <View style={styles.container} >
            <TouchableOpacity  onPress={()=> router.replace("/(main)/(asmay)")}>
            <Text style={styles.back}>MyComponent</Text>
            </TouchableOpacity>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#dcdee0',
    },
    back:{
        fontSize:25,
        height:100,
        width:"auto"
    }
});

//make this component available to the app
export default MyComponent;
