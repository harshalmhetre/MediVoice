import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import CheckBox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons"; // For cross icon ❌

const ResultScreen = ({ navigation }) => {
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState({ name: "", description: "", frequency: { morning: false, afternoon: false, night: false } });
  const [loading, setLoading] = useState(true);
  const [courseDescription, setCourseDescription] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    fetchPrescription();
  }, []);

  const fetchPrescription = async () => {
    try {
      const response = await fetch("http://<YOUR_IP>:3000/get-prescription"); // Replace with actual backend API
      const data = await response.json();
      setMedications(data.medications.map((med) => ({ name: med, description: "", frequency: { morning: false, afternoon: false, night: false } })));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      setLoading(false);
    }
  };

  const addMedication = () => {
    if (!newMedication.name.trim()) {
      Alert.alert("Error", "Medication name cannot be empty.");
      return;
    }

    setMedications([...medications, newMedication]);
    setNewMedication({ name: "", description: "", frequency: { morning: false, afternoon: false, night: false } });
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const submitCourse = async () => {
    if (!duration.trim() || isNaN(duration) || parseInt(duration, 10) <= 0) {
      Alert.alert("Error", "Please enter a valid duration in days.");
      return;
    }

    if (medications.length === 0) {
      Alert.alert("Error", "Please add at least one medication.");
      return;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(duration, 10));

    const userId = "USER_ID_HERE"; // Replace with actual user ID

    const courseData = {
      userId,
      courseDescription,
      medications,
      startDate,
      endDate,
    };

    try {
      const response = await fetch("http://<YOUR_IP>:3000/add-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        Alert.alert("Success", "Course added successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Failed to add course.");
      }
    } catch (error) {
      console.error("Error submitting course:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Prescription Results</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Loader */}
        {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />}

        {/* Course Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Course Description"
          value={courseDescription}
          onChangeText={setCourseDescription}
        />

        {/* Duration Input */}
        <Text style={styles.label}>Duration</Text>
        <View style={styles.durationContainer}>
          <TextInput
            style={styles.durationInput}
            placeholder="Days"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />
          <Text style={styles.daysText}>days</Text>
        </View>

        {/* Medication List */}
        {medications.map((med, index) => (
          <View key={index} style={styles.medicationBox}>
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationText}>Medication: {med.name}</Text>
              <TouchableOpacity onPress={() => removeMedication(index)}>
                <Ionicons name="close" size={20} color="red" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Medication Description"
              value={med.description}
              onChangeText={(text) => {
                const updatedMedications = [...medications];
                updatedMedications[index].description = text;
                setMedications(updatedMedications);
              }}
            />

            <Text style={styles.frequencyText}>Frequency:</Text>
            <View style={styles.checkboxContainer}>
              {["morning", "afternoon", "night"].map((time) => (
                <View key={time} style={styles.checkbox}>
                  <CheckBox
                    value={med.frequency[time]}
                    onValueChange={(val) => {
                      const updatedMedications = [...medications];
                      updatedMedications[index].frequency[time] = val;
                      setMedications(updatedMedications);
                    }}
                  />
                  <Text>{time.charAt(0).toUpperCase() + time.slice(1)}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Add Medication Button */}
        <TouchableOpacity style={styles.addButton} onPress={addMedication}>
          <Text style={styles.buttonText}>Add Medication</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Submit Course Button */}
      <TouchableOpacity style={styles.submitButton} onPress={submitCourse}>
        <Text style={styles.buttonText}>Submit Course</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: { backgroundColor: "#007bff", paddingVertical: 20, alignItems: "center", width: "100%" },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  scrollContainer: { padding: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5, backgroundColor: "#fff" },
  durationContainer: { flexDirection: "row", alignItems: "center" },
  durationInput: { width: 80, borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, backgroundColor: "#fff", marginRight: 10 },
  daysText: { fontSize: 16 },
  medicationBox: { borderWidth: 1, borderColor: "#007bff", padding: 15, borderRadius: 5, marginBottom: 10, backgroundColor: "#e9f5ff" },
  medicationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  medicationText: { fontSize: 14 },
  addButton: { backgroundColor: "#28a745", padding: 12, borderRadius: 5, alignItems: "center", marginTop: 15 },
  submitButton: { backgroundColor: "#007bff", padding: 15, alignItems: "center", borderRadius: 5, margin: 20 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  checkboxContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  checkbox: { flexDirection: "row", alignItems: "center" },
});

export default ResultScreen;
