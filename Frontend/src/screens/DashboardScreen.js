import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Calendar, Camera, User, Bell } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [userInfo, setUserInfo] = useState({ name: 'Customer', age: '' });
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserInfo();
    fetchMedicalCourses();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userData = await AsyncStorage.getItem('userInfo');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setUserInfo(parsedUserData);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const fetchMedicalCourses = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT/medical-courses');
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching medical courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diffTime > 0 ? diffTime : 0;
  };

  const isActive = (course) => {
    const today = new Date();
    const startDate = new Date(course.startDate);
    const endDate = new Date(course.endDate);
    return today >= startDate && today <= endDate;
  };

  const getTimingsList = (medication) => {
    const timings = [];
    if (medication.frequency.morning) timings.push('Morning');
    if (medication.frequency.afternoon) timings.push('Afternoon');
    if (medication.frequency.night) timings.push('Night');
    return timings.join(', ');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Hello, {userInfo.name}</Text>
          <Text style={styles.headerSubtitle}>Age: {userInfo.age}</Text>
          <Text style={styles.headerSubtitle}>Track your medications</Text>
        </View>
        <User color="white" size={32} />
      </View>

      <ScrollView style={styles.content}>
        {/* Active Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Courses</Text>
          {courses.filter(isActive).map((course) => (
            <View key={course._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardTitle}>{course.description}</Text>
                  <View style={styles.dateContainer}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.dateText}>
                      {new Date(course.startDate).toLocaleDateString()} - 
                      {new Date(course.endDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {getDaysRemaining(course.endDate)} days left
                  </Text>
                </View>
              </View>

              {course.medications.map((med, idx) => (
                <View key={idx} style={[styles.medicationItem, 
                  idx !== 0 && styles.medicationBorder]}>
                  <View>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.timingsText}>{getTimingsList(med)}</Text>
                  </View>
                  <TouchableOpacity style={styles.reminderButton}>
                    <Bell size={16} color="#2563EB" />
                    <Text style={styles.reminderText}>Reminder</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Completed Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed Courses</Text>
          {courses.filter(course => !isActive(course)).map((course) => (
            <View key={course._id} style={[styles.card, styles.completedCard]}>
              <Text style={styles.cardTitle}>{course.description}</Text>
              <Text style={styles.completedDate}>
                Completed on {new Date(course.endDate).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('AddCourse')}
        >
          <Calendar size={24} color="#2563EB" />
          <Text style={styles.navText}>Add Course</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('ScanningScreen')}
        >
          <Camera size={24} color="#2563EB" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#111827',
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
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  badge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#374151',
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
  },
  medicationBorder: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timingsText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  reminderButton: {
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  reminderText: {
    color: '#2563EB',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  completedCard: {
    opacity: 0.75,
  },
  completedDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomNav: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: '#2563EB',
    fontSize: 12,
    marginTop: 4,
  },
});

export default Dashboard;