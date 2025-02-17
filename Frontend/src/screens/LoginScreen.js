// LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://192.168.219.163:3000', // Remove '/login' from here
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const LoginScreen = ({ navigation }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(credentials.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/login', {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data.msg === "OTP sent, please verify your email") {
        // Navigate to OTP verification screen
        navigation.navigate('Otpverification', {
          email: credentials.email
        });
      } else if (response.data.msg === "Login successful!") {
        // Navigate to Dashboard if already verified
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', error.response.data.msg || 'Authentication failed');
      } else if (error.request) {
        Alert.alert('Error', 'No response from server. Please check your internet connection.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MediVoice</Text>
      <Text style={styles.pagetitle}>Login</Text>
      <TextInput
        placeholder="Email"
        value={credentials.email}
        onChangeText={(text) => setCredentials({ ...credentials, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={credentials.password}
        onChangeText={(text) => setCredentials({ ...credentials, password: text })}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Processing...' : 'Login'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f9ff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c6ed5',
    marginBottom: 20,
  },
  pagetitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0e0b0b',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderColor: '#2c6ed5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2c6ed5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#84a7e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 10,
    color: '#2c6ed5',
    fontSize: 16,
  },
});

export default LoginScreen;