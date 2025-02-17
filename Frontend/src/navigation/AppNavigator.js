import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from '../screens/LandingScreen';
import ScanningScreen from '../screens/ScanningScreen';
import ResultsScreen from '../screens/ResultsScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OtpVerification from '../screens/OtpVerification';
import ProfileScreen  from '../screens/ProfileScreen';
import AddCourseScreen  from '../screens/AddCourseScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen 
          name="Landing" 
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="ScanningScreen" component={ScanningScreen} />
        <Stack.Screen name="Result" component={ResultsScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerification} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.screen name="Profile" screen={ProfileScreen} />
        <Stack.screen name="AddCourse" component={AddCourseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
