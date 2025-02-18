import React, { useState } from 'react';
import {
  View,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const RegisterScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    fname: '',
    lname: '',
    email: '',
    dob: '',
    mob: '',
    password: '',
    confirm_password: '',
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!userData.fname.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!userData.lname.trim()) {
      Alert.alert('Error', 'Last name is required');
      return false;
    }
    if (!userData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    if (!validateEmail(userData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!userData.mob.trim()) {
      Alert.alert('Error', 'Mobile number is required');
      return false;
    }
    if (!/^\d{10}$/.test(userData.mob)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!userData.dob.trim()) {
      Alert.alert('Error', 'Date of birth is required');
      return false;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(userData.dob)) {
      Alert.alert('Error', 'Please enter date of birth in YYYY-MM-DD format');
      return false;
    }
    if (userData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (userData.password !== userData.confirm_password) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('http://192.168.219.163:3000/signup', {
        email: userData.email,
        fname: userData.fname,
        lname: userData.lname,
        dob: userData.dob,
        mob: userData.mob,
        password: userData.password,
      });

      if (response.data.user) {
        await storeUserData(response.data.user);
        navigation.replace('Dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || 'Registration failed';
      if (errorMessage === "User already exists, try logging in!!") {
        Alert.alert(
          'Account Exists',
          'This email is already registered. Please login instead.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Registration Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MediVoice</Text>
      <Text style={styles.pagetitle}>Register</Text>
      
      <TextInput
        placeholder="First Name"
        value={userData.fname}
        onChangeText={(text) => setUserData({ ...userData, fname: text })}
        style={styles.input}
        autoCapitalize="words"
      />
      
      <TextInput
        placeholder="Last Name"
        value={userData.lname}
        onChangeText={(text) => setUserData({ ...userData, lname: text })}
        style={styles.input}
        autoCapitalize="words"
      />

      <TextInput
        placeholder="Email"
        value={userData.email}
        onChangeText={(text) => setUserData({ ...userData, email: text.toLowerCase() })}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      
      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={userData.dob}
        onChangeText={(text) => setUserData({ ...userData, dob: text })}
        style={styles.input}
        keyboardType="numeric"
      />
      
      <TextInput
        placeholder="Mobile No."
        value={userData.mob}
        onChangeText={(text) => setUserData({ ...userData, mob: text })}
        keyboardType="phone-pad"
        style={styles.input}
        maxLength={10}
      />
      
      <TextInput
        placeholder="Password"
        value={userData.password}
        onChangeText={(text) => setUserData({ ...userData, password: text })}
        secureTextEntry
        style={styles.input}
      />
      
      <TextInput
        placeholder="Confirm Password"
        value={userData.confirm_password}
        onChangeText={(text) => setUserData({ ...userData, confirm_password: text })}
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate('Login')}
        disabled={isLoading}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
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

export default RegisterScreen;