import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";


const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MediVoice</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Scan</Text>
        <Text style={styles.cardDescription}>
          Instantly scan and hear your prescription - No login required
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ScanningScreen")}
        >
          <Text style={styles.buttonText}>Start Scanning</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, styles.premiumCard]}>
        <Text style={styles.cardTitle}>
          Complete Health Assistant 
        </Text>
        <Text style={styles.cardDescription}>
          ✅ Medicine reminders {"\n"}
          ✅ Track medical history {"\n"}
          ✅ Course completion tracking
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.buttonText}>Login / Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#0056d2",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  premiumCard: {
    borderWidth: 1,
    borderColor: "#0056d2",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  premiumTag: {
    fontSize: 14,
    color: "#0056d2",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    marginVertical: 10,
    textAlign: "center",
    flex : 1 ,
  },
  button: {
    backgroundColor: "#0056d2",
    padding: 10,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default LandingScreen;
