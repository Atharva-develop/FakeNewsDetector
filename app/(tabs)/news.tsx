import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";

const NEWSDATA_API_KEY = "pub_39ac086ad02c46a7a69db9b443465037";

interface Article {
  title: string;
  link: string;
  image_url?: string;
  source_id?: string;
  description?: string;
  pubDate?: string;
}

interface NewsDataResponse {
  results: Article[];
}

export default function NewsScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
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
      }
    };
    fetchNews();
  }, []);

  const openArticle = (url: string) => Linking.openURL(url);

  const renderItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openArticle(item.link)}
    >
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          {item.description && (
            <Text style={styles.description}>{item.description}</Text>
          )}
          {item.source_id && <Text style={styles.source}>{item.source_id}</Text>}
          {item.pubDate && <Text style={styles.date}>{new Date(item.pubDate).toLocaleDateString()}</Text>}
        </View>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#5B8CFF" style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const IMAGE_WIDTH = 160;
const IMAGE_HEIGHT = 100;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0D14", // deep dark techy background
    padding: 15,
  },
  card: {
    backgroundColor: "#121822", // darker than container, subtle difference
    padding: 16,
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8, // adds shadow on Android
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: "#EAF2FF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    textShadowColor: "#2E3A59",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: "#A0B0FF",
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 18,
  },
  source: {
    color: "#6F8FFF",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  date: {
    color: "#6F8FFF",
    fontSize: 11,
    fontStyle: "italic",
  },
  image: {
    width: 170,
    height: 110,
    borderRadius: 16,
    resizeMode: "cover",
  },
  placeholder: {
    width: 170,
    height: 110,
    borderRadius: 16,
    backgroundColor: "#1E2333",
  },
});