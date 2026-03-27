import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView,
} from 'react-native';
import { API } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '' });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!form.username || !form.email || !form.password) return Alert.alert('Error', 'Please fill required fields');
    setLoading(true);
    try {
      const res = await fetch(API.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      await login(form.username, form.password);
    } catch (err) {
      Alert.alert('Signup failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>Instagram</Text>
        {['fullName', 'username', 'email', 'password'].map(field => (
          <TextInput
            key={field}
            style={styles.input}
            placeholder={field === 'fullName' ? 'Full name (optional)' : field.charAt(0).toUpperCase() + field.slice(1)}
            value={form[field]}
            onChangeText={v => setForm(p => ({ ...p, [field]: v }))}
            secureTextEntry={field === 'password'}
            autoCapitalize="none"
          />
        ))}
        <TouchableOpacity style={styles.btn} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign up</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Log in</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
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
