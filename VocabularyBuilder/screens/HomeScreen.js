import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useTheme } from "../contexts/ThemeContext";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const navigationItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "tachometer",
      onPress: () => navigation.navigate("Dashboard"),
    },
    {
      id: "vocabulary",
      title: "Vocabulary",
      icon: "list-alt",
      onPress: () => navigation.navigate("VocabularyTab"),
    },
    {
      id: "quiz",
      title: "Quiz",
      icon: "question-circle",
      onPress: () => navigation.navigate("QuizTab"),
    },
    {
      id: "progress",
      title: "Progress",
      icon: "bars",
      onPress: () => navigation.navigate("ProgressTab"),
    },
    {
      id: "settings",
      title: "Settings",
      icon: "cog",
      onPress: () => navigation.navigate("SettingsTab"),
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.gridItem, theme === "dark" && styles.darkGridItem]}
      onPress={item.onPress}
    >
      {item.icon && (
        <Icon
          name={item.icon}
          size={30}
          color={theme === "dark" ? "#eee" : "white"}
          style={styles.gridItemIcon}
        />
      )}
      <Text
        style={[
          styles.gridItemText,
          theme === "dark" && styles.darkGridItemText,
        ]}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, theme === "dark" && styles.darkContainer]}>
      <Text
        style={[styles.welcomeText, theme === "dark" && styles.darkWelcomeText]}
      >
        Welcome to Vocabulary Builder!
      </Text>
      <FlatList
        data={navigationItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Make the main container take up the entire screen
    padding: 20,
    backgroundColor: "#f0f8ff", // Light blue background
  },
  darkContainer: {
    backgroundColor: "#333",
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  darkWelcomeText: {
    color: "#eee",
  },
  flatList: {
    flex: 1, // Make the FlatList take up the remaining vertical space
  },
  flatListContent: {
    flexGrow: 1, // Allow content to grow to take available space
    justifyContent: "flex-start", // Items start from the top
    // alignItems: 'stretch', // Try stretching items vertically if needed
  },
  darkGridItem: {
    backgroundColor: "#555",
  },
  gridItem: {
    backgroundColor: "#4682b4", // Steel blue
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 15,
    marginHorizontal: 10,
    flex: 1, // Items take equal available width within the row
    minHeight: 100, // Ensure items have a minimum height
    alignItems: "center",
    justifyContent: "center",
  },
  gridItemIcon: {
    marginBottom: 10,
  },
  gridItemText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  darkGridItemText: {
    color: "#ddd",
  },
});

export default HomeScreen;
