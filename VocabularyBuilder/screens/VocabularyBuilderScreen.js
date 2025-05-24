import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  getVocabulary,
  addVocabularyWord,
  deleteVocabularyWord,
  updateVocabularyWord,
} from "../utils/api"; // Adjust path
import { useTheme } from "../contexts/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const VocabularyBuilderScreen = () => {
  const { theme, colors } = useTheme();

  const [vocabulary, setVocabulary] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  // State for editing
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailWord, setDetailWord] = useState("");
  const [detailDefinition, setDetailDefinition] = useState("");
  const [wordToDelete, setWordToDelete] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const fetchVocabulary = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getVocabulary();
      setVocabulary(response.data);
    } catch (error) {
      console.error(
        "Error fetching vocabulary:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to load vocabulary list.");
    } finally {
      setIsLoading(false);
      setRefreshing(false); // Stop refreshing animation
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchVocabulary();
    }, [fetchVocabulary])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVocabulary();
  }, [fetchVocabulary]);

  const handleAddWord = async () => {
    if (!newWord || !newDefinition) {
      Alert.alert("Error", "Please enter both word and definition.");
      return;
    }
    setIsLoading(true);
    try {
      await addVocabularyWord(newWord, newDefinition);
      Alert.alert("Success", "Word added successfully!");
      setNewWord("");
      setNewDefinition("");
      setAddModalVisible(false); // Close modal
      fetchVocabulary(); // Refresh the list
    } catch (error) {
      console.error(
        "Error adding word:",
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Detail Functions ---
  const handleDetailWord = (wordItem) => {
    setDetailWord(wordItem.word);
    setDetailDefinition(wordItem.definition);
    setIsDetailModalVisible(true);
  };

  // --- Edit Functions ---
  const handleEditWord = async () => {
    if (!editingWord.word.trim() || !editingWord.definition.trim()) {
      Alert.alert("Error", "Word and Definition cannot be empty.");
      return;
    }
    try {
      await updateVocabularyWord(
        editingWord._id,
        editingWord.word,
        editingWord.definition
      );
      Alert.alert("Success", "Word updated successfully!");
      setEditModalVisible(false);
      setEditingWord(null);
      fetchVocabulary(); // Refresh list
    } catch (error) {
      console.error(
        "Error updating word:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to update word.");
    }
  };

  // Function to show the delete confirmation modal
  const handleDeletePress = (word) => {
    setWordToDelete(word);
    setDeleteModalVisible(true);
  };

  // Function to confirm and perform delete
  const handleConfirmDelete = async () => {
    if (!wordToDelete) return; // Should not happen if button is enabled correctly
    try {
      await deleteVocabularyWord(wordToDelete._id);
      Alert.alert("Success", "Word deleted successfully!");
      setDeleteModalVisible(false); // Close modal
      setWordToDelete(null); // Clear word
      fetchVocabulary(); // Refresh list
    } catch (error) {
      console.error(
        "Error deleting word:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to delete word.");
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setWordToDelete(null);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.wordItem, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.wordTextContainer}>
        <Text style={[styles.word, { color: colors.text }]}>{item.word}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => handleDetailWord(item)}
          style={styles.actionButton}
        >
          <Icon name="info" size={24} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setEditingWord(item);
            setEditModalVisible(true);
          }}
        >
          <Icon name="pencil" size={24} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeletePress(item)}
          style={styles.actionButton}
        >
          <Icon name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text }}>Loading vocabulary...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === "dark" && styles.darkContainer]}>
      <Text style={[styles.header, { color: colors.text }]}>
        My Vocabulary List
      </Text>

      <FlatList
        data={vocabulary}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyListText, { color: colors.subText }]}>
            No words in your vocabulary yet. Add some!
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]} // For Android
            tintColor={colors.primary} // For iOS
          />
        }
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => setAddModalVisible(true)}
      >
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Add Word Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAddModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Add New Word
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholder="Word"
              placeholderTextColor={colors.subText}
              value={newWord}
              onChangeText={setNewWord}
              keyboardAppearance={theme}
            />
            <TextInput
              style={[
                styles.modalInput,
                {
                  borderColor: colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                  color: colors.text,
                },
              ]}
              placeholder="Definition"
              placeholderTextColor={colors.subText}
              value={newDefinition}
              onChangeText={setNewDefinition}
              multiline
              numberOfLines={4}
              keyboardAppearance={theme}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleAddWord}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Word Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDetailModalVisible}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Detail Word</Text>
            <Text
              style={[styles.wordText, theme === "dark" && styles.darkWordText]}
            >
              {detailWord}
            </Text>
            <Text
              style={[
                styles.definitionText,
                theme === "dark" && styles.darkDefinitionText,
              ]}
            >
              {detailDefinition}
            </Text>
            <View style={styles.modalButton}>
              <Button
                title="Close"
                onPress={() => setIsDetailModalVisible(false)}
                color="gray"
              />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDetailModalVisible}
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Detail Word
            </Text>
            {detailWord && (
              <>
                <Text
                  style={[
                    styles.wordText,
                    theme === "dark" && styles.darkWordText,
                  ]}
                >
                  {detailWord}
                </Text>
                <Text
                  style={[
                    styles.definitionText,
                    theme === "dark" && styles.darkDefinitionText,
                  ]}
                >
                  {detailDefinition}
                </Text>
              </>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Edit Word Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Word
            </Text>
            {editingWord && (
              <>
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Word"
                  placeholderTextColor={colors.subText}
                  value={editingWord.word}
                  onChangeText={(text) =>
                    setEditingWord({ ...editingWord, word: text })
                  }
                  keyboardAppearance={theme}
                />
                <TextInput
                  style={[
                    styles.modalInput,
                    {
                      borderColor: colors.inputBorder,
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Definition"
                  placeholderTextColor={colors.subText}
                  value={editingWord.definition}
                  onChangeText={(text) =>
                    setEditingWord({ ...editingWord, definition: text })
                  }
                  multiline
                  numberOfLines={4}
                  keyboardAppearance={theme}
                />
              </>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleEditWord}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal (NEW) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.centeredView}>
          <View
            style={[
              styles.modalView,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Confirm Deletion
            </Text>
            <Text style={[styles.modalText, { color: colors.subText }]}>
              Are you sure you want to delete the word "{wordToDelete?.word}"?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelDelete}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteConfirmButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  darkContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  darkHeader: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#eee",
  },
  subheader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#555",
  },
  darkSubheader: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#eee",
  },
  addWordContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkAddWordContainer: {
    backgroundColor: "#444",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
  },
  darkInput: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#666",
  },
  wordItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  darkWordItem: {
    backgroundColor: "#444",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  wordText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  darkWordText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#eee",
  },
  definitionText: {
    fontSize: 14,
    color: "#555",
  },
  darkDefinitionText: {
    fontSize: 14,
    color: "#ddd",
  },
  noDataText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#777",
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  addButton: {
    position: "absolute",
    bottom: height * 0.04, // Responsive bottom position
    right: width * 0.05, // Responsive right position
    width: width * 0.15, // Responsive width
    height: width * 0.15, // Responsive height
    borderRadius: width * 0.075, // Half of width/height for perfect circle
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  // --- Modal Styles (common to all modals) ---
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  modalText: {
    // For delete modal specific text
    fontSize: width * 0.045,
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  modalInput: {
    width: "100%",
    padding: width * 0.035,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: height * 0.015,
    fontSize: width * 0.04,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: height * 0.01,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.06,
    elevation: 2,
    flex: 1,
    marginHorizontal: width * 0.015,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: width * 0.04,
  },
  cancelButton: {
    backgroundColor: "#6c757d", // Grey color for cancel
  },
  deleteConfirmButton: {
    // Specific style for the delete button in modal
    backgroundColor: "red",
  },
});

export default VocabularyBuilderScreen;
