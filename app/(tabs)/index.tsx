import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";

const API_KEY = "AIzaSyA1pzK-2PTB2aOUZBu9D6tPzkVZlNjFH3o";

export default function HomeScreen() {
  const [newsText, setNewsText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const checkFakeNews = async () => {
    if (!newsText) return;

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this news and respond:

Verdict: Fake / Real / Uncertain
Confidence: Low / Medium / High
Reason:

News:
${newsText}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const output =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No response received.";

      const clean = output.replace(/\*\*/g, "");
setResult(clean);
    } catch (error) {
      setResult("Error analyzing news.");
    }

    setLoading(false);
  };

  const getVerdictColor = () => {
    if (result.includes("Fake")) return "#ff4d4d";
    if (result.includes("Real")) return "#00e676";
    return "#fbc02d";
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AI Fake News Detector</Text>

      <TextInput
        style={styles.input}
        placeholder="Paste news content here..."
        placeholderTextColor="#777"
        multiline
        value={newsText}
        onChangeText={setNewsText}
      />

      <TouchableOpacity style={styles.button} onPress={checkFakeNews}>
        <Text style={styles.buttonText}>Analyze News</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#00e5ff" style={{ marginTop: 20 }} />}

      {result !== "" && (
        <View style={[styles.resultCard, { borderColor: getVerdictColor() }]}>
          <Text style={[styles.resultText, { color: getVerdictColor() }]}>
            {result}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#0D0F14",
    padding: 20,
    paddingTop: 60,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#EAF2FF",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 0.5,
  },

  input: {
    backgroundColor: "#151821",
    borderRadius: 18,
    padding: 16,
    color: "#EAF2FF",
    fontSize: 16,
    minHeight: 160,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#232838",
  },

  button: {
    marginTop: 22,
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "#5B8CFF",
    shadowColor: "#5B8CFF",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  resultCard: {
    marginTop: 28,
    padding: 22,
    borderRadius: 20,
    backgroundColor: "#151821",
    borderWidth: 1,
    borderColor: "#232838",
  },

  verdict: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },

  confidence: {
    color: "#8FA8FF",
    marginBottom: 12,
    fontSize: 14,
  },

  reason: {
    color: "#C9D4F5",
    lineHeight: 22,
    fontSize: 15,
  },
});