import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";

const VocabularyBuilderScreen = () => {
  const { theme } = useContext(ThemeContext);

  const [word, setWord] = useState("");
  const [definition, setDefinition] = useState("");
  const [vocabularyList, setVocabularyList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const navigation = useNavigation();

  const handleEdit = (index) => {
    const itemToEdit = vocabularyList[index];
    setWord(itemToEdit.word);
    setDefinition(itemToEdit.definition);
    setEditingIndex(index);
  };

  const handleDelete = async (indexToDelete) => {
    try {
      const existingVocabulary = await AsyncStorage.getItem("vocabularyList");
      let vocabularyArray = existingVocabulary
        ? JSON.parse(existingVocabulary)
        : [];

      // Create a new array without the item to delete
      const updatedVocabularyList = vocabularyArray.filter(
        (_, index) => index !== indexToDelete
      );

      await AsyncStorage.setItem(
        "vocabularyList",
        JSON.stringify(updatedVocabularyList)
      );
      setVocabularyList(updatedVocabularyList); // Update the local state
      alert("Vocabulary deleted!");
    } catch (error) {
      console.error("Error deleting vocabulary:", error);
      alert("Error deleting vocabulary.");
    }
  };

  const handleSave = async () => {
    if (word.trim() && definition.trim()) {
      const updatedEntry = { word: word.trim(), definition: definition.trim() };

      try {
        const existingVocabulary = await AsyncStorage.getItem("vocabularyList");
        let vocabularyArray = existingVocabulary
          ? JSON.parse(existingVocabulary)
          : [];

        if (editingIndex !== null) {
          // If we are editing, update the item at the editingIndex
          vocabularyArray[editingIndex] = updatedEntry;
          setEditingIndex(null); // Reset editing index after saving
        } else {
          // If not editing, add a new item
          vocabularyArray.push(updatedEntry);
        }

        await AsyncStorage.setItem(
          "vocabularyList",
          JSON.stringify(vocabularyArray)
        );
        console.log("Saved:", updatedEntry);
        setVocabularyList(vocabularyArray); // Update the local state to reflect changes
        setWord("");
        setDefinition("");
        alert("Vocabulary saved!");
      } catch (error) {
        console.error("Error saving vocabulary:", error);
        alert("Error saving vocabulary.");
      }
    } else {
      alert("Please enter both a word and a definition.");
    }
  };

  useEffect(() => {
    const loadVocabulary = async () => {
      try {
        const storedVocabulary = await AsyncStorage.getItem("vocabularyList");
        if (storedVocabulary) {
          setVocabularyList(JSON.parse(storedVocabulary));
        }
      } catch (error) {
        console.error("Error loading vocabulary:", error);
      }
    };

    loadVocabulary();
  }, []); // The empty dependency array ensures this effect runs only once after the initial render

  return (
    <View style={theme === "dark" ? styles.darkContainer : styles.container}>
      <Text style={theme === "dark" ? styles.darkTitle : styles.title}>
        Add New Vocabulary
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Word"
        value={word}
        onChangeText={(text) => setWord(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Definition"
        value={definition}
        onChangeText={(text) => setDefinition(text)}
        multiline
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>
          {editingIndex !== null ? "Update" : "Save"}
        </Text>
      </TouchableOpacity>

      <Text style={theme === "dark" ? styles.darkTitle : styles.listTitle}>
        My Vocabulary
      </Text>
      <FlatList
        data={vocabularyList}
        keyExtractor={(item, index) => index.toString()} // Use index as a simple key for now
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <View style={styles.wordDefinitionContainer}>
              <Text style={styles.word}>{item.word}</Text>
              <Text style={styles.definition}>{item.definition}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(index)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(index)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.quizButton}
        onPress={() => navigation.navigate("Quiz")}
      >
        <Text style={styles.quizButtonText}>Start Quiz</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.progressButton}
        onPress={() => navigation.navigate("Progress")}
      >
        <Text style={styles.progressButtonText}>View Progress</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  darkContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  darkTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#eee",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "white",
    borderRadius: 5,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "blue",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  listItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wordDefinitionContainer: {
    flex: 1,
  },
  word: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  definition: {
    fontSize: 14,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: "orange",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 5,
  },
  editButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  quizButton: {
    backgroundColor: "purple",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  quizButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  progressButton: {
    backgroundColor: "teal",
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  progressButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default VocabularyBuilderScreen;
