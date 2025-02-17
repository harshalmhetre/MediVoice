import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../config/firebase';

export const registerUser = async (userData) => {
  try {
    // Use mobile number as email for Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      `${userData.mobile_number}@tempauth.com`, 
      userData.password
    );
    const user = userCredential.user;

    // Store user details in Firestore
    await setDoc(doc(firestore, 'users', user.uid), {
      first_name: userData.first_name,
      last_name: userData.last_name,
      birthdate: userData.birthdate,
      mobile_number: userData.mobile_number,
      guardian_mobile_number: userData.guardian_mobile_number,
      createdAt: new Date(),
      subscriptionStatus: 'free'
    });

    return user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (mobile_number, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      `${mobile_number}@tempauth.com`, 
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};