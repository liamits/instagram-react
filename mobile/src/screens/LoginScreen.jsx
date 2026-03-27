import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUsername || !password) return Alert.alert('Error', 'Please fill all fields');
    setLoading(true);
    try {
      await login(emailOrUsername, password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.logo}>Instagram</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or email"
        value={emailOrUsername}
        onChangeText={setEmailOrUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Log in</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? <Text style={styles.linkBold}>Sign up</Text></Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  logo: { fontSize: 36, fontFamily: 'serif', textAlign: 'center', marginBottom: 40 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, marginBottom: 12, fontSize: 14,
  },
  btn: {
    backgroundColor: '#0095f6', borderRadius: 8,
    padding: 14, alignItems: 'center', marginBottom: 16,
  },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  link: { textAlign: 'center', color: '#666', fontSize: 13 },
  linkBold: { color: '#0095f6', fontWeight: '600' },
});
