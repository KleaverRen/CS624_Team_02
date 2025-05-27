import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  RefreshControl,
  ScrollView, // For detail modal content if definition is long
} from "react-native";
import {
  getVocabulary,
  addVocabularyWord,
  deleteVocabularyWord,
  updateVocabularyWord,
} from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";

const { width, height } = Dimensions.get("window");

const VocabularyBuilderScreen = () => {
  const { theme, colors } = useTheme();

  const [vocabulary, setVocabulary] = useState([]);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State for view mode: 'list' or 'grid'
  const [viewMode, setViewMode] = useState("list"); // Default to list view

  // State for editing and modals
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [detailWord, setDetailWord] = useState("");
  const [detailDefinition, setDetailDefinition] = useState("");
  const [wordToDelete, setWordToDelete] = useState(null);
  const [editingWord, setEditingWord] = useState(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isAddModalVisible, setAddModalVisible] = useState(false);

  // Fetch vocabulary on initial load and when screen is focused
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
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVocabulary();
  }, [fetchVocabulary]);

  const handleAddWord = async () => {
    if (!newWord.trim() || !newDefinition.trim()) {
      Alert.alert("Error", "Please enter both word and definition.");
      return;
    }
    setIsLoading(true);
    try {
      await addVocabularyWord(newWord, newDefinition);
      Alert.alert("Success", "Word added successfully!");
      setNewWord("");
      setNewDefinition("");
      setAddModalVisible(false);
      fetchVocabulary();
    } catch (error) {
      console.error(
        "Error adding word:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add word."
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
      fetchVocabulary();
    } catch (error) {
      console.error(
        "Error updating word:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update word."
      );
    }
  };

  // Function to show the delete confirmation modal
  const handleDeletePress = (word) => {
    setWordToDelete(word);
    setDeleteModalVisible(true);
  };

  // Function to confirm and perform delete
  const handleConfirmDelete = async () => {
    if (!wordToDelete) return;
    try {
      await deleteVocabularyWord(wordToDelete._id);
      Alert.alert("Success", "Word deleted successfully!");
      setDeleteModalVisible(false);
      setWordToDelete(null);
      fetchVocabulary();
    } catch (error) {
      console.error(
        "Error deleting word:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete word."
      );
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setWordToDelete(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleDetailWord(item)}
      style={[
        styles.card,
        viewMode === "grid" && styles.gridCard, // Apply grid specific styles
        { backgroundColor: colors.cardBackground, borderColor: colors.border },
      ]}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.cardWord, { color: colors.text }]}>
          {item.word}
        </Text>
        <Text
          style={[styles.cardDefinition, { color: colors.subText }]}
          numberOfLines={viewMode === "list" ? 2 : 3}
        >
          {item.definition}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setEditingWord(item);
            setEditModalVisible(true);
          }}
        >
          <Icon name="pencil" size={width * 0.05} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeletePress(item)}
          style={styles.actionButton}
        >
          <Icon name="trash" size={width * 0.05} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>
        My Vocabulary List
      </Text>

      <View style={styles.viewModeToggleContainer}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "list" && { backgroundColor: colors.primary },
          ]}
          onPress={() => setViewMode("list")}
        >
          <Icon
            name="list"
            size={20}
            color={viewMode === "list" ? colors.buttonText : colors.text}
          />
          <Text
            style={[
              styles.viewModeButtonText,
              { color: viewMode === "list" ? colors.buttonText : colors.text },
            ]}
          >
            List
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === "grid" && { backgroundColor: colors.primary },
          ]}
          onPress={() => setViewMode("grid")}
        >
          <Icon
            name="th-large"
            size={20}
            color={viewMode === "grid" ? colors.buttonText : colors.text}
          />
          <Text
            style={[
              styles.viewModeButtonText,
              { color: viewMode === "grid" ? colors.buttonText : colors.text },
            ]}
          >
            Grid
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        key={viewMode}
        data={vocabulary}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          viewMode === "grid" && styles.gridListContent,
        ]}
        numColumns={viewMode === "grid" ? 2 : 1} // Set number of columns for grid
        columnWrapperStyle={viewMode === "grid" && styles.gridColumnWrapper} // Styles for row of items
        ListEmptyComponent={
          <Text style={[styles.emptyListText, { color: colors.subText }]}>
            No words in your vocabulary yet. Add some!
          </Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
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
          <View
            style={[
              styles.modalView,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Word Detail
            </Text>
            {detailWord && (
              <>
                <Text style={[styles.wordTextDetail, { color: colors.text }]}>
                  {detailWord}
                </Text>
                <ScrollView style={styles.definitionScrollContainer}>
                  <Text
                    style={[
                      styles.definitionTextDetail,
                      { color: colors.subText },
                    ]}
                  >
                    {detailDefinition}
                  </Text>
                </ScrollView>
              </>
            )}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.buttonSecondary },
                ]}
                onPress={() => setIsDetailModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
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

      {/* Delete Confirmation Modal */}
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
              Are you sure you want to delete the word "
              <Text style={{ fontWeight: "bold" }}>{wordToDelete?.word}</Text>"
              ?
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
    padding: width * 0.05, // Responsive padding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: width * 0.07, // Responsive font size
    fontWeight: "bold",
    marginBottom: height * 0.02, // Responsive margin
    textAlign: "center",
  },
  viewModeToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: height * 0.02,
    borderRadius: 10,
    overflow: "hidden", // Ensures border radius applies to children
    borderColor: "#ccc",
    borderWidth: 1,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.02,
    backgroundColor: "transparent", // Default background
  },
  viewModeButtonText: {
    marginLeft: width * 0.02,
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: height * 0.1, // Ensure space for the FAB
  },
  gridListContent: {
    justifyContent: "space-between", // Distribute items evenly
  },
  gridColumnWrapper: {
    justifyContent: "space-between",
  },
  emptyListText: {
    textAlign: "center",
    fontStyle: "italic",
    marginTop: height * 0.05,
    fontSize: width * 0.045,
  },
  // --- Card Styles ---
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: width * 0.04,
    marginBottom: height * 0.015,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridCard: {
    width: "48%", // Approximately half width minus margin
    marginHorizontal: "1%", // Space between cards
    marginBottom: width * 0.02,
    aspectRatio: 1, // Make cards square in grid for better layout
    justifyContent: "space-between", // Distribute content
  },
  cardContent: {
    flex: 1,
    marginBottom: height * 0.01,
  },
  cardWord: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: height * 0.005,
  },
  cardDefinition: {
    fontSize: width * 0.035,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: width * 0.03,
    padding: width * 0.01,
  },
  // --- Floating Action Button (Add Button) ---
  addButton: {
    position: "absolute",
    bottom: height * 0.04,
    right: width * 0.05,
    width: width * 0.16, // Slightly larger for better tap target
    height: width * 0.16,
    borderRadius: width * 0.08,
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
    maxWidth: 400, // Max width for larger screens
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  modalText: {
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
    backgroundColor: "#6c757d",
  },
  deleteConfirmButton: {
    backgroundColor: "red",
  },
  wordTextDetail: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: height * 0.01,
    textAlign: "center",
  },
  definitionScrollContainer: {
    maxHeight: height * 0.3, // Limit height of scrollable definition
    width: "100%",
    paddingHorizontal: width * 0.02,
    marginBottom: height * 0.02,
  },
  definitionTextDetail: {
    fontSize: width * 0.04,
    textAlign: "center",
  },
});

export default VocabularyBuilderScreen;
