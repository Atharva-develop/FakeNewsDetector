import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
const API_KEY = "AIzaSyBuMiA-6B7zRwzgUg7sKau8XSjm7eNIUwc";

type Verdict = "Fake" | "Real" | "Uncertain" | null;

const VERDICT_CONFIG: Record<
  NonNullable<Verdict>,
  { color: string; bgColor: string; borderColor: string; icon: string; label: string }
> = {
  Fake: {
    color: "#FF3B3B",
    bgColor: "#1A0A0A",
    borderColor: "#FF3B3B",
    icon: "✕",
    label: "MISINFORMATION DETECTED",
  },
  Real: {
    color: "#00FF87",
    bgColor: "#001A0E",
    borderColor: "#00FF87",
    icon: "✓",
    label: "VERIFIED AUTHENTIC",
  },
  Uncertain: {
    color: "#FFB800",
    bgColor: "#1A1200",
    borderColor: "#FFB800",
    icon: "◈",
    label: "INCONCLUSIVE",
  },
};

function parseVerdict(text: string): Verdict {
  if (/\bfake\b/i.test(text)) return "Fake";
  if (/\breal\b/i.test(text)) return "Real";
  if (/\buncertain\b/i.test(text)) return "Uncertain";
  return null;
}

function parseSection(result: string, label: string): string {
  const regex = new RegExp(`${label}:\\s*(.+?)(?=\\n[A-Z]|$)`, "si");
  const match = result.match(regex);
  return match ? match[1].trim() : "";
}

function ScanLine() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: "rgba(0,255,178,0.15)",
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 160],
            }),
          },
        ],
      }}
    />
  );
}

export default function HomeScreen() {
  const [newsText, setNewsText] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [scanStep, setScanStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  const SCAN_STEPS = [
    "INITIALIZING ENGINE...",
    "CROSS-REFERENCING SOURCES...",
    "SCORING CREDIBILITY...",
    "GENERATING VERDICT...",
  ];

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep((s) => (s + 1) % SCAN_STEPS.length);
      }, 600);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const checkFakeNews = async () => {
    if (!newsText.trim()) return;
    setLoading(true);
    setResult("");
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
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
                    text: `Analyze this news article for authenticity. Respond using EXACTLY this format:\n\nVerdict: Fake / Real / Uncertain\nConfidence: Low / Medium / High\nReason: [2-3 sentences explaining your reasoning]\n\nNews:\n${newsText}`,
                  },
                ],
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const output =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
      const clean = output.replace(/\*\*/g, "");
      setResult(clean);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } catch {
      setResult(
        "Verdict: Uncertain\nConfidence: Low\nReason: Error contacting analysis engine. Please try again."
      );
    }
    setLoading(false);
  };

  const verdict = result ? parseVerdict(result) : null;
  const config = verdict ? VERDICT_CONFIG[verdict] : null;
  const confidence = parseSection(result, "Confidence");
  const reason = parseSection(result, "Reason");

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* STATUS BAR */}
      <Animated.View style={[styles.statusBar, { opacity: headerAnim }]}>
        <View style={styles.statusLeft}>
          <View style={styles.greenDot} />
          <Text style={styles.statusText}>SYSTEM ONLINE</Text>
        </View>
        <Text style={styles.statusText}>GEMINI v2.5-FLASH</Text>
      </Animated.View>

      {/* BRAND BLOCK */}
      <Animated.View
        style={[
          styles.brandBlock,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />

        <Text style={styles.brandEyebrow}>◈ AI-POWERED ANALYSIS ENGINE</Text>
        <Text style={styles.brandName}>FACTIFY</Text>
        <Text style={styles.brandTagline}>AI FAKE NEWS DETECTOR</Text>
        <View style={styles.brandUnderline} />
        <Text style={styles.brandSub}>Real-time Intelligence · Gemini 2.5</Text>
      </Animated.View>

      {/* GRID DIVIDER */}
      <View style={styles.gridDivider}>
        <View style={styles.gridLine} />
        <View style={styles.gridDot} />
        <View style={styles.gridLine} />
      </View>

      {/* INPUT */}
      <View style={styles.inputSection}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.sectionLabel}>► INPUT NODE</Text>
          <Text style={styles.charCount}>{charCount} CHARS</Text>
        </View>
        <View style={styles.inputOuter}>
          <ScanLine />
          <TextInput
            style={styles.input}
            placeholder="PASTE NEWS CONTENT HERE..."
            placeholderTextColor="#2A4A5A"
            multiline
            value={newsText}
            onChangeText={(t) => {
              setNewsText(t);
              setCharCount(t.length);
            }}
            selectionColor="#00FFB2"
          />
        </View>
        {newsText.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setNewsText("");
              setCharCount(0);
              setResult("");
            }}
          >
            <Text style={styles.clearBtnText}>✕ CLEAR INPUT</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ANALYZE BUTTON */}
      <TouchableOpacity
        style={[
          styles.button,
          (!newsText.trim() || loading) && styles.buttonOff,
        ]}
        onPress={checkFakeNews}
        disabled={!newsText.trim() || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.btnRow}>
            <ActivityIndicator size="small" color="#00FFB2" />
            <Text style={[styles.btnText, { color: "#00FFB2", marginLeft: 10 }]}>
              {SCAN_STEPS[scanStep]}
            </Text>
          </View>
        ) : (
          <View style={styles.btnRow}>
            <Text style={styles.btnArrow}>▶</Text>
            <Text style={styles.btnText}>RUN ANALYSIS</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* RESULT CARD */}
      {result !== "" && config && verdict && (
        <Animated.View
          style={[
            styles.resultCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              borderColor: config.borderColor,
              backgroundColor: config.bgColor,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.resultHeader, { backgroundColor: config.color }]}>
            <Text style={styles.resultHeaderText}>
              {config.icon}{"  "}{config.label}
            </Text>
          </View>

          <View style={styles.resultBody}>
            {/* Confidence */}
            {confidence ? (
              <>
                <View style={styles.confidenceRow}>
                  <Text style={styles.fieldLabel}>CONFIDENCE LEVEL</Text>
                  <View style={[styles.confidencePill, { borderColor: config.color }]}>
                    <Text style={[styles.confidencePillText, { color: config.color }]}>
                      {confidence.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        backgroundColor: config.color,
                        width:
                          confidence.toLowerCase() === "high"
                            ? "90%"
                            : confidence.toLowerCase() === "medium"
                            ? "55%"
                            : "25%",
                      },
                    ]}
                  />
                </View>
              </>
            ) : null}

            <View style={[styles.innerDivider, { backgroundColor: config.color }]} />

            {/* Reason */}
            <Text style={styles.fieldLabel}>ANALYSIS</Text>
            <View style={styles.reasonBox}>
              <View style={[styles.reasonAccent, { backgroundColor: config.color }]} />
              <Text style={styles.reasonText}>{reason || result}</Text>
            </View>
          </View>

          <View style={styles.resultFooter}>
            <Text style={styles.footerText}>◈ ANALYSIS COMPLETE · FACTIFY ENGINE</Text>
          </View>
        </Animated.View>
      )}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#050810",
    paddingHorizontal: 20,
    paddingTop: 56,
  },

  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#00FF87",
    shadowColor: "#00FF87",
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  statusText: {
    color: "#5A9AAA",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Courier New",
  },

  brandBlock: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginHorizontal: 4,
    position: "relative",
  },
  cornerTL: {
    position: "absolute", top: 0, left: 0,
    width: 22, height: 22,
    borderTopWidth: 2, borderLeftWidth: 2,
    borderColor: "#00FFB2",
  },
  cornerTR: {
    position: "absolute", top: 0, right: 0,
    width: 22, height: 22,
    borderTopWidth: 2, borderRightWidth: 2,
    borderColor: "#00FFB2",
  },
  cornerBL: {
    position: "absolute", bottom: 0, left: 0,
    width: 22, height: 22,
    borderBottomWidth: 2, borderLeftWidth: 2,
    borderColor: "#00FFB2",
  },
  cornerBR: {
    position: "absolute", bottom: 0, right: 0,
    width: 22, height: 22,
    borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: "#00FFB2",
  },
  brandEyebrow: {
    color: "#00FFB2",
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "Courier New",
    marginBottom: 16,
  },
  brandName: {
    fontSize: 62,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 10,
    textShadowColor: "#00FFB2",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 22,
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A8D8FF",
    letterSpacing: 6,
    fontFamily: "Courier New",
    marginBottom: 16,
  },
  brandUnderline: {
    width: 80,
    height: 2,
    backgroundColor: "#00FFB2",
    marginBottom: 14,
    shadowColor: "#00FFB2",
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  brandSub: {
    color: "#5A9AAA",
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: "Courier New",
  },

  gridDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#0E1E2C",
  },
  gridDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00FFB2",
    marginHorizontal: 12,
    shadowColor: "#00FFB2",
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },

  inputSection: {
    marginBottom: 20,
  },
  inputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionLabel: {
    color: "#00FFB2",
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "Courier New",
    fontWeight: "700",
  },
  charCount: {
    color: "#5A9AAA",
    fontSize: 11,
    fontFamily: "Courier New",
  },
  inputOuter: {
    backgroundColor: "#080E18",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0E2030",
    overflow: "hidden",
    minHeight: 160,
  },
  input: {
    padding: 16,
    color: "#C8E8FF",
    fontSize: 14,
    minHeight: 160,
    textAlignVertical: "top",
    lineHeight: 22,
    fontFamily: "Courier New",
  },
  clearBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#1A2E40",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearBtnText: {
    color: "#5A9AAA",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Courier New",
  },

  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#00FFB2",
    backgroundColor: "#00FFB2",
    shadowColor: "#00FFB2",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  buttonOff: {
    backgroundColor: "transparent",
    borderColor: "#0E2030",
    shadowOpacity: 0,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  btnArrow: {
    color: "#050810",
    fontSize: 14,
    fontWeight: "900",
  },
  btnText: {
    color: "#050810",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 3,
    fontFamily: "Courier New",
  },

  resultCard: {
    marginTop: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  resultHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  resultHeaderText: {
    color: "#050810",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
    fontFamily: "Courier New",
  },
  resultBody: {
    padding: 20,
  },
  confidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  fieldLabel: {
    color: "#7AAABB",
    fontSize: 9,
    letterSpacing: 2.5,
    fontFamily: "Courier New",
    marginBottom: 10,
  },
  confidencePill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  confidencePillText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    fontFamily: "Courier New",
  },
  barTrack: {
    height: 4,
    backgroundColor: "#0A1520",
    borderRadius: 2,
    marginBottom: 20,
    overflow: "hidden",
  },
  barFill: {
    height: 4,
    borderRadius: 2,
  },
  innerDivider: {
    height: 1,
    opacity: 0.25,
    marginBottom: 16,
  },
  reasonBox: {
    flexDirection: "row",
    gap: 12,
  },
  reasonAccent: {
    width: 3,
    borderRadius: 2,
    flexShrink: 0,
    opacity: 0.8,
  },
  reasonText: {
    color: "#C0D8FF",
    fontSize: 14,
    lineHeight: 22,
    fontFamily: "Courier New",
    flex: 1,
  },
  resultFooter: {
    borderTopWidth: 1,
    borderTopColor: "#0E1E2C",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerText: {
    color: "#5A9AAA",
    fontSize: 9,
    letterSpacing: 2,
    fontFamily: "Courier New",
    textAlign: "center",
  },
});