import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const OTPVerificationScreen = ({ route, navigation }) => {
  const email = route?.params?.email || '';
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const storeUserData = async (userData) => {
    try {
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://192.168.219.163:3000/user/${email}`);
      if (response.data) {
        await storeUserData(response.data);
        navigation.navigate('Dashboard'); 
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to fetch user details.");
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (!email) {
      Alert.alert('Error', 'Invalid email address');
      return;
    }
    if (otpString.length !== 6) {
      shakeError();
      Alert.alert('Error', 'Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://192.168.219.163:3000/verify-otp', { email, otp: otpString });

      if (response.data.msg === "Email verified successfully") {
        await fetchUserData(); 
      }
    } catch (error) {
      shakeError();
      Alert.alert('Error', error.response?.data?.msg || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <LinearGradient colors={['#2c6ed5', '#1a4fa3']} style={styles.headerGradient}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoContainer}>
          <Text style={styles.title}>MediVoice</Text>
          <Text style={styles.subtitle}>Verify Your Email</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.instructions}>Please enter the 6-digit code sent to</Text>
          <Text style={styles.emailText}>{email}</Text>

          <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnimation }] }]}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="alphanumeric"
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
              />
            ))}
          </Animated.View>

          <TouchableOpacity style={[styles.verifyButton, isLoading && styles.buttonDisabled]} onPress={handleVerifyOTP} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.buttonText}>Verify Code</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');
const inputWidth = (width - 80 - 50) / 6; 

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f9ff' },
  headerGradient: { height: 200, width: '100%', position: 'absolute', top: 0 },
  backButton: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, zIndex: 1 },
  content: { flexGrow: 1, paddingTop: 120, paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#fff', opacity: 0.9 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  instructions: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 4 },
  emailText: { fontSize: 16, color: '#2c6ed5', fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, height: 40 },
  otpInput: { width: inputWidth, height: 50, borderWidth: 2, borderColor: '#2c6ed5', borderRadius: 12, fontSize: 24, fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8f9ff', color: '#2c6ed5' },
  verifyButton: { backgroundColor: '#2c6ed5', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#2c6ed5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  buttonDisabled: { backgroundColor: '#84a7e0' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default OTPVerificationScreen;
