import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Animated,
  Easing,
} from "react-native";

const NEWSDATA_API_KEY = "pub_39ac086ad02c46a7a69db9b443465037";

interface Article {
  title: string;
  link: string;
  image_url?: string;
  source_id?: string;
  description?: string;
  pubDate?: string;
  category?: string[];
}

interface NewsDataResponse {
  results: Article[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}M AGO`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}H AGO`;
  return `${Math.floor(diffHours / 24)}D AGO`;
}

// Blinking live dot
function LiveDot() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={[styles.liveDot, { opacity: anim }]}
    />
  );
}

function ArticleCard({ item, index }: { item: Article; index: number }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        delay: Math.min(index * 70, 500),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        delay: Math.min(index * 70, 500),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const category = item.category?.[0]?.toUpperCase() ?? "GENERAL";
  const cardIndex = String(index + 1).padStart(2, "0");

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => Linking.openURL(item.link)}
        activeOpacity={0.85}
      >
        {/* Card index + source row */}
        <View style={styles.cardTopRow}>
          <Text style={styles.cardIndex}>#{cardIndex}</Text>
          <View style={styles.sourceChip}>
            <View style={styles.sourceDot} />
            <Text style={styles.sourceText}>
              {item.source_id?.toUpperCase() ?? "UNKNOWN SOURCE"}
            </Text>
          </View>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          {item.pubDate && (
            <Text style={styles.timeText}>{timeAgo(item.pubDate)}</Text>
          )}
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Content */}
        <View style={styles.contentRow}>
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={3}>
              {item.title}
            </Text>
            {item.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>

          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>◈</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <Text style={styles.readMore}>READ FULL STORY  →</Text>
          <View style={styles.cornerFooterBR} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function NewsScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  const fetchNews = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await fetch(
        `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&country=in&language=en`
      );
      const data: NewsDataResponse = await res.json();
      setArticles(data.results || []);
    } catch (err) {
      console.log("Error fetching news:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingInner}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          <ActivityIndicator size="large" color="#00FFB2" />
          <Text style={styles.loadingLabel}>FETCHING LIVE FEED</Text>
          <Text style={styles.loadingSubLabel}>CONNECTING TO NEWSDATA.IO...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* STATUS BAR */}
      <Animated.View style={[styles.statusBar, { opacity: headerAnim }]}>
        <View style={styles.statusLeft}>
          <View style={styles.statusOnlineDot} />
          <Text style={styles.statusText}>FEED ONLINE</Text>
        </View>
        <Text style={styles.statusText}>NEWSDATA.IO · IN</Text>
      </Animated.View>

      {/* BRAND HEADER */}
      <Animated.View
        style={[
          styles.brandBlock,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
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

        <Text style={styles.brandEyebrow}>◈ VERIFIED INTELLIGENCE STREAM</Text>
        <Text style={styles.brandName}>FACTIFY GENUIN</Text>
        <Text style={styles.brandTagline}>LIVE INTELLIGENCE · INDIA</Text>
        <View style={styles.brandUnderline} />

        {/* Live indicator + count */}
        <View style={styles.liveRow}>
          <LiveDot />
          <Text style={styles.liveText}>LIVE</Text>
          <View style={styles.liveSep} />
          <Text style={styles.storyCount}>{articles.length} STORIES LOADED</Text>
        </View>
      </Animated.View>

      {/* GRID DIVIDER */}
      <View style={styles.gridDivider}>
        <View style={styles.gridLine} />
        <View style={styles.gridDot} />
        <View style={styles.gridLine} />
      </View>

      {/* FEED LABEL */}
      <View style={styles.feedLabelRow}>
        <Text style={styles.sectionLabel}>► INCOMING FEED</Text>
        <Text style={styles.feedHint}>PULL TO REFRESH</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={articles}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <ArticleCard item={item} index={index} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        onRefresh={() => fetchNews(true)}
        refreshing={refreshing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050810",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: "#050810",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  loadingInner: {
    alignItems: "center",
    padding: 40,
    position: "relative",
    gap: 14,
  },
  loadingLabel: {
    color: "#00FFB2",
    fontSize: 12,
    letterSpacing: 3,
    fontFamily: "Courier New",
    fontWeight: "700",
  },
  loadingSubLabel: {
    color: "#5A9AAA",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Courier New",
  },

  // Status bar
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    marginBottom: 24,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusOnlineDot: {
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

  // Brand block
  brandBlock: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 24,
    marginHorizontal: 20,
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
    marginBottom: 14,
  },
  brandName: {
    fontSize: 52,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 8,
    textShadowColor: "#00FFB2",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A8D8FF",
    letterSpacing: 5,
    fontFamily: "Courier New",
    marginBottom: 14,
  },
  brandUnderline: {
    width: 80,
    height: 2,
    backgroundColor: "#00FFB2",
    marginBottom: 16,
    shadowColor: "#00FFB2",
    shadowOpacity: 0.9,
    shadowRadius: 10,
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#FF3B3B",
    shadowColor: "#FF3B3B",
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  liveText: {
    color: "#FF3B3B",
    fontSize: 10,
    letterSpacing: 3,
    fontFamily: "Courier New",
    fontWeight: "900",
  },
  liveSep: {
    width: 1,
    height: 12,
    backgroundColor: "#0E2030",
    marginHorizontal: 4,
  },
  storyCount: {
    color: "#5A9AAA",
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: "Courier New",
  },

  // Grid divider
  gridDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 20,
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

  // Feed label
  feedLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionLabel: {
    color: "#00FFB2",
    fontSize: 10,
    letterSpacing: 2.5,
    fontFamily: "Courier New",
    fontWeight: "700",
  },
  feedHint: {
    color: "#5A9AAA",
    fontSize: 9,
    letterSpacing: 1.5,
    fontFamily: "Courier New",
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Card
  card: {
    backgroundColor: "#080E18",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0E2030",
    overflow: "hidden",
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 0,
    gap: 8,
    flexWrap: "nowrap",
  },
  cardIndex: {
    color: "#00FFB2",
    fontSize: 10,
    fontFamily: "Courier New",
    fontWeight: "900",
    letterSpacing: 1,
    marginRight: 4,
  },
  sourceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A1A26",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#0E2A3A",
  },
  sourceDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#00FFB2",
    marginRight: 5,
    shadowColor: "#00FFB2",
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  sourceText: {
    color: "#00FFB2",
    fontSize: 9,
    fontFamily: "Courier New",
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  categoryChip: {
    backgroundColor: "#0A1220",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#0E1E30",
  },
  categoryText: {
    color: "#7AAABB",
    fontSize: 9,
    fontFamily: "Courier New",
    letterSpacing: 1,
  },
  timeText: {
    color: "#5A9AAA",
    fontSize: 9,
    fontFamily: "Courier New",
    letterSpacing: 1,
    marginLeft: "auto" as any,
  },

  cardDivider: {
    height: 1,
    backgroundColor: "#0E1E2C",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
  },

  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    gap: 14,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: "#E8F4FF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 8,
    fontFamily: "Courier New",
    letterSpacing: 0.1,
  },
  description: {
    color: "#A0C0CC",
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Courier New",
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0E2030",
    flexShrink: 0,
  },
  imagePlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 10,
    backgroundColor: "#080E18",
    borderWidth: 1,
    borderColor: "#0E2030",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  placeholderIcon: {
    color: "#1A3040",
    fontSize: 22,
  },

  cardFooter: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#0E1E2C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
  },
  readMore: {
    color: "#00FFB2",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Courier New",
    fontWeight: "700",
  },
  cornerFooterBR: {
    width: 10,
    height: 10,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "#00FFB2",
    opacity: 0.5,
  },
});