import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import axios from "axios";

const Dashboard = ({ navigation }) => {
  const [user, setUser] = useState({ name: "Customer" });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch user details
    axios.get("http://your-backend-ip:3000/user-details")
      .then(response => setUser(response.data))
      .catch(error => console.error("Error fetching user:", error));

    // Fetch medication courses
    axios.get("http://your-backend-ip:3000/medication-courses")
      .then(response => setCourses(response.data))
      .catch(error => console.error("Error fetching courses:", error));
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello, {user.name}</Text>
        <Text style={styles.subText}>Track your medications</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Active Courses */}
        <Text style={styles.sectionTitle}>Active Courses</Text>
        {courses.filter(course => course.status === "Active").map((course) => (
          <View key={course.id} style={[styles.courseCard, styles.activeCard]}>
            <Text style={styles.courseTitle}>{course.name}</Text>
            <Text style={styles.courseInfo}>Started: {course.startDate}</Text>
            <Text style={styles.link}>{course.daysRemaining} days remaining</Text>
            <Text style={styles.courseInfo}>Next dose in: {course.nextDose} hours</Text>
          </View>
        ))}

        {/* Past Courses */}
        <Text style={styles.sectionTitle}>Past Courses</Text>
        {courses.filter(course => course.status === "Completed").map((course) => (
          <View key={course.id} style={[styles.courseCard, styles.pastCard]}>
            <Text style={styles.courseTitle}>{course.name}</Text>
            <Text style={styles.courseInfo}>Completed on: {course.endDate}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("AddCourse")}>
          <FontAwesome name="plus-circle" size={28} color="#3b82f6" />
          <Text style={styles.navText}>Add Course</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("ScanningScreen")}>
          <MaterialIcons name="camera-alt" size={28} color="#3b82f6" />
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle" size={28} color="#3b82f6" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#3b82f6",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  subText: {
    color: "#e0e0e0",
    fontSize: 14,
  },
  content: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },
  courseCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  activeCard: {
    borderLeftWidth: 5,
    borderLeftColor: "green",
  },
  pastCard: {
    borderLeftWidth: 5,
    borderLeftColor: "gray",
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  courseInfo: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
  link: {
    color: "#3b82f6",
    fontSize: 14,
    marginTop: 3,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#3b82f6",
    marginTop: 5,
  },
});


export default Dashboard;
