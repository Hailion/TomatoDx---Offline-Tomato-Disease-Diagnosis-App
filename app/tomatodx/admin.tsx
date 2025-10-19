// admin.tsx
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function AdminScreen() {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.title}>Admin / Model</Text>
      <Text>Model version: v1.0.0</Text>
      <TouchableOpacity style={styles.btn} onPress={() => alert('Model update instructions')}>
        <Text style={{ color:'#fff' }}>Model update instructions</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#FFF' },
  title: { fontSize:20, fontWeight:'700', marginBottom:12 },
  btn: { marginTop:20, backgroundColor:'#2F855A', padding:12, borderRadius:8, alignItems:'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }
});