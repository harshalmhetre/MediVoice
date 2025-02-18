import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { Calendar, Camera, User, Bell } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

// Configure notifications with specified times
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const MedicationCard = ({ course, onPress }) => {
  const getDaysRemaining = useCallback((endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diffTime > 0 ? diffTime : 0;
  }, []);

  const daysLeft = getDaysRemaining(course.endDate);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{course.description}</Text>
        <View style={[styles.daysLeftBadge]}>
          <Text style={styles.daysLeftText}>
            {daysLeft} days left
          </Text>
        </View>
      </View>

      <View style={styles.dateRow}>
        <Text style={styles.dateText}>
          {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.medicationList}>
        {course.medications.map((med, index) => (
          <View key={index} style={styles.medicationItem}>
            <View>
              <Text style={styles.medicationName}>{med.name}</Text>
              <View style={styles.timingRow}>
                {med.frequency.morning && (
                  <Text style={styles.timingText}>Morning</Text>
                )}
                {med.frequency.afternoon && (
                  <Text style={styles.timingText}>Afternoon</Text>
                )}
                {med.frequency.night && (
                  <Text style={styles.timingText}>Night</Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={styles.reminderButton}
              onPress={() => onSetReminder(course, med)}
            >
              <Bell size={16} color="#2563EB" />
              <Text style={styles.reminderText}>Reminder</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to receive medication reminders'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Unable to load user data');
      return null;
    }
  };

  const fetchMedicalCourses = async (email) => {
    try {
      const response = await fetch(`http://192.168.219.163:3000/medical-courses/${email}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch courses');
      }

      return data.data || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      Alert.alert('Error', 'Unable to load medication courses');
      return [];
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = await fetchUserData();
      if (user?.email) {
        const medicalCourses = await fetchMedicalCourses(user.email);
        setCourses(medicalCourses);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSetReminder = async (course, medication) => {
    try {
      // Set specific times for notifications
      const notificationTimes = {
        morning: { hour: 8, minute: 30 },
        afternoon: { hour: 13, minute: 30 },
        night: { hour: 20, minute: 0 }
      };

      // Cancel existing notifications for this medication
      const existingNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const medicationNotifications = existingNotifications.filter(
        notification => notification.content.data.medicationId === medication._id
      );
      
      for (const notification of medicationNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      // Schedule new notifications based on frequency
      Object.entries(medication.frequency).forEach(async ([time, isEnabled]) => {
        if (isEnabled && notificationTimes[time]) {
          const { hour, minute } = notificationTimes[time];
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${course.description} - ${medication.name}`,
              body: `Time to take your medication: ${medication.description}`,
              data: { medicationId: medication._id },
            },
            trigger: {
              hour,
              minute,
              repeats: true,
            },
          });
        }
      });

      Alert.alert('Success', 'Reminder set successfully');
    } catch (error) {
      console.error('Error setting reminder:', error);
      Alert.alert('Error', 'Failed to set reminder');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hello, {userData?.fname || 'User'}</Text>
          <Text style={styles.headerSubtitle}>Track your medications</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <User size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Active Courses</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddCourse')}
          >
            <Text style={styles.addButtonText}>+ Add New</Text>
          </TouchableOpacity>
        </View>

        {courses.map(course => (
          <MedicationCard
            key={course._id}
            course={course}
            onPress={() => navigation.navigate('CourseDetail', { course })}
          />
        ))}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('AddCourse')}
        >
          <Calendar size={24} color="#2563EB" />
          <Text style={styles.navText}>Add</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ScanningScreen')}
        >
          <Camera size={24} color="#2563EB" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <User size={24} color="#2563EB" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  daysLeftBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  daysLeftText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '500',
  },
  dateRow: {
    marginTop: 8,
  },
  dateText: {
    color: '#6B7280',
    fontSize: 14,
  },
  medicationList: {
    marginTop: 16,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  timingRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  timingText: {
    color: '#6B7280',
    fontSize: 12,
    marginRight: 8,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  reminderText: {
    color: '#2563EB',
    fontSize: 12,
    marginLeft: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: '#2563EB',
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Dashboard;