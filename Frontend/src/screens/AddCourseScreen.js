import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert, 
  SafeAreaView 
} from "react-native";
import CheckBox from "expo-checkbox";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const AddCourseScreen = ({ route, navigation }) => {
  const [duration, setDuration] = useState("");
  const [medications, setMedications] = useState([]);
  const [newMedication, setNewMedication] = useState({ 
    name: "", 
    description: "",
    frequency: { 
      morning: false, 
      afternoon: false, 
      night: false 
    } 
  });
  const [showMedicationForm, setShowMedicationForm] = useState(false);
  const [courseDescription, setCourseDescription] = useState("");
  const email = route?.params?.email;

  const calculateDates = (days) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + parseInt(days, 10));
    return { startDate, endDate };
  };

  const addMedication = () => {
    if (!newMedication.name.trim()) {
      Alert.alert("Error", "Medication name cannot be empty.");
      return;
    }
    if (!newMedication.description.trim()) {
      Alert.alert("Error", "Medication description cannot be empty.");
      return;
    }

    setMedications([...medications, { ...newMedication }]);
    setNewMedication({ 
      name: "", 
      description: "", 
      frequency: { morning: false, afternoon: false, night: false } 
    });
    setShowMedicationForm(false);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const submitCourse = async () => {
    if (!email) {
      Alert.alert("Error", "User ID is required.");
      return;
    }

    if (!courseDescription.trim()) {
      Alert.alert("Error", "Please enter a course description.");
      return;
    }

    if (!duration.trim() || isNaN(duration) || parseInt(duration, 10) <= 0) {
      Alert.alert("Error", "Please enter a valid duration in days.");
      return;
    }

    if (medications.length === 0) {
      Alert.alert("Error", "Please add at least one medication.");
      return;
    }

    const { startDate, endDate } = calculateDates(duration);

    const courseData = {
      email,
      description: courseDescription,
      startDate,
      endDate,
      medications: medications.map(med => ({
        name: med.name,
        description: med.description,
        frequency: {
          morning: med.frequency.morning,
          afternoon: med.frequency.afternoon,
          night: med.frequency.night
        }
      }))
    };

    try {
      const response = await fetch("http://192.168.219.163:3000/medical-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Course added successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", data.message || "Failed to add course.");
      }
    } catch (error) {
      console.error("Error submitting course:", error);
      Alert.alert("Error", "Failed to connect to server.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Add Medical Course</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.card}>
          <Text style={styles.label}>Course Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter course description"
            value={courseDescription}
            onChangeText={setCourseDescription}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Duration (Days)</Text>
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
        </View>

        {medications.map((med, index) => (
          <View key={index} style={styles.medicationCard}>
            <View style={styles.medicationHeader}>
              <Text style={styles.medicationTitle}>{med.name}</Text>
              <TouchableOpacity 
                onPress={() => removeMedication(index)}
                style={styles.removeButton}
              >
                <Ionicons name="close" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.medicationDescription}>{med.description}</Text>
            <View style={styles.frequencyTags}>
              {med.frequency.morning && (
                <View style={styles.frequencyTag}>
                  <Text style={styles.frequencyTagText}>Morning</Text>
                </View>
              )}
              {med.frequency.afternoon && (
                <View style={styles.frequencyTag}>
                  <Text style={styles.frequencyTagText}>Afternoon</Text>
                </View>
              )}
              {med.frequency.night && (
                <View style={styles.frequencyTag}>
                  <Text style={styles.frequencyTagText}>Night</Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {!showMedicationForm && (
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowMedicationForm(true)}
          >
            <Text style={styles.buttonText}>Add Medication</Text>
          </TouchableOpacity>
        )}

        {showMedicationForm && (
          <View style={styles.medicationForm}>
            <TextInput
              style={styles.input}
              placeholder="Medication Name"
              value={newMedication.name}
              onChangeText={(text) => setNewMedication({ ...newMedication, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Medication Description"
              value={newMedication.description}
              onChangeText={(text) => setNewMedication({ ...newMedication, description: text })}
              multiline
            />

            <Text style={styles.frequencyLabel}>Frequency:</Text>
            <View style={styles.checkboxContainer}>
              {['morning', 'afternoon', 'night'].map((time) => (
                <View key={time} style={styles.checkbox}>
                  <CheckBox
                    value={newMedication.frequency[time]}
                    onValueChange={(val) => 
                      setNewMedication({
                        ...newMedication,
                        frequency: { ...newMedication.frequency, [time]: val }
                      })
                    }
                    style={styles.checkboxInput}
                  />
                  <Text style={styles.checkboxLabel}>
                    {time.charAt(0).toUpperCase() + time.slice(1)}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.saveMedicationButton}
              onPress={addMedication}
            >
              <Text style={styles.buttonText}>Save Medication</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={submitCourse}
        >
          <Text style={styles.buttonText}>Submit Course</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc"
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700"
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#ffffff",
    color: "#1f2937",
    minHeight: 45,
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationInput: {
    width: 80,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  daysText: {
    fontSize: 16,
    color: "#64748b",
  },
  medicationCard: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  medicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e40af",
  },
  medicationDescription: {
    fontSize: 14,
    color: "#1e40af",
    marginBottom: 12,
  },
  frequencyTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  frequencyTag: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  frequencyTagText: {
    fontSize: 12,
    color: "#1e40af",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
  },
  medicationForm: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  checkboxContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkboxInput: {
    borderRadius: 4,
    borderColor: "#64748b",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#1f2937",
  },
  saveMedicationButton: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  removeButton: {
    padding: 4,
  },
});

export default AddCourseScreen;