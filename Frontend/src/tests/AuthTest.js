import { registerUser, loginUser } from '../services/AuthService';
import { auth } from '../config/firebase';

const testRegistration = async () => {
  const testUserData = {
    first_name: 'Test',
    last_name: 'User',
    birthdate: '1990-01-01',
    mobile_number: '1234567890',
    guardian_mobile_number: '9876543210',
    password: 'TestPassword123!'
  };

  try {
    const user = await registerUser(testUserData);
    console.log('Registration Test Passed:', user.uid);
    return true;
  } catch (error) {
    console.error('Registration Test Failed:', error);
    return false;
  }
};

const testLogin = async () => {
  try {
    const user = await loginUser('1234567890', 'TestPassword123!');
    console.log('Login Test Passed:', user.uid);
    return true;
  } catch (error) {
    console.error('Login Test Failed:', error);
    return false;
  }
};

const runAuthTests = async () => {
  const registrationTest = await testRegistration();
  const loginTest = await testLogin();
  
  return {
    registration: registrationTest,
    login: loginTest
  };
};

export default runAuthTests;