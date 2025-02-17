import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Avatar } from "react-native-paper";
import moment from "moment";

const ProfileScreen = ({ route }) => {
  // Sample user data (Replace with fetched API data)
  const user = {
    fname: "John",
    lname: "Doe",
    email: "johndoe@example.com",
    mobile: "+91 9876543210",
    dob: "1995-06-15",  // YYYY-MM-DD format
  };

  // Calculate Age from DOB
  const age = moment().diff(user.dob, "years");

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={`${user.fname[0]}${user.lname[0]}`} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{user.fname} {user.lname}</Text>
        <Text style={styles.subtitle}>My Profile</Text>
      </View>

      {/* Profile Details */}
      <View style={styles.detailsContainer}>
        <DetailRow label="Email" value={user.email} />
        <DetailRow label="Mobile No." value={user.mobile} />
        <DetailRow label="Age" value={`${age} years`} />
      </View>
    </View>
  );
};

// Component for displaying a row of user details
const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

// Styles for the Profile Screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    backgroundColor: "#4A90E2",  // Blue background for initials
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "gray",
    marginTop: 2,
  },
  detailsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 3, // For shadow effect
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
  },
});

export default ProfileScreen;
