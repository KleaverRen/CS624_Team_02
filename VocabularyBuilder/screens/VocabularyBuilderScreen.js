import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  getVocabulary,
  // remove addVocabularyWord, deleteVocabularyWord, updateVocabularyWord
  // as they are now used directly within the modal components
} from "../utils/api";
import { useTheme } from "../contexts/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome";

// Import your new modal components
import AddWordModal from "../components/AddWordModal";
import DetailWordModal from "../components/DetailWordModal";
import EditWordModal from "../components/EditWordModal";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const { width, height } = Dimensions.get("window");

const VocabularyBuilderScreen = () => {
  const { theme, colors } = useTheme();

  const [vocabulary, setVocabulary] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // State for view mode: 'list' or 'grid'
  const [viewMode, setViewMode] = useState("list"); // Default to list view

  // States for modal visibility
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  // States to pass data to modals
  const [selectedWordForDetail, setSelectedWordForDetail] = useState(null);
  const [selectedWordForEdit, setSelectedWordForEdit] = useState(null);
  const [selectedWordForDelete, setSelectedWordForDelete] = useState(null);

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

  // --- Handlers for opening/closing modals and passing data ---

  const handleAddWordModalOpen = () => {
    setAddModalVisible(true);
  };
  const handleAddModalClose = () => {
    setAddModalVisible(false);
  };
  const handleAddSuccess = () => {
    fetchVocabulary(); // Refresh list after successful add
  };

  const handleDetailWordModalOpen = (wordItem) => {
    setSelectedWordForDetail(wordItem);
    setIsDetailModalVisible(true);
  };
  const handleDetailModalClose = () => {
    setIsDetailModalVisible(false);
    setSelectedWordForDetail(null);
  };

  const handleEditModalOpen = (wordItem) => {
    setSelectedWordForEdit(wordItem);
    setEditModalVisible(true);
  };
  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedWordForEdit(null);
  };
  const handleEditSuccess = () => {
    fetchVocabulary(); // Refresh list after successful edit
  };

  const handleDeleteModalOpen = (wordItem) => {
    setSelectedWordForDelete(wordItem);
    setDeleteModalVisible(true);
  };
  const handleDeleteModalClose = () => {
    setDeleteModalVisible(false);
    setSelectedWordForDelete(null);
  };
  const handleDeleteSuccess = () => {
    fetchVocabulary(); // Refresh list after successful delete
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleDetailWordModalOpen(item)}
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
          onPress={() => handleEditModalOpen(item)}
        >
          <Icon name="pencil" size={width * 0.05} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteModalOpen(item)}
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
        numColumns={viewMode === "grid" ? 2 : 1}
        columnWrapperStyle={viewMode === "grid" && styles.gridColumnWrapper}
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
        onPress={handleAddWordModalOpen}
      >
        <Icon name="plus" size={30} color="white" />
      </TouchableOpacity>

      {/* Render all separated modals */}
      <AddWordModal
        isVisible={isAddModalVisible}
        onClose={handleAddModalClose}
        onAddSuccess={handleAddSuccess}
        theme={theme}
        colors={colors}
      />

      <DetailWordModal
        isVisible={isDetailModalVisible}
        onClose={handleDetailModalClose}
        word={selectedWordForDetail?.word}
        definition={selectedWordForDetail?.definition}
        theme={theme}
        colors={colors}
      />

      <EditWordModal
        isVisible={isEditModalVisible}
        onClose={handleEditModalClose}
        editingWord={selectedWordForEdit} // Pass the entire word object
        onUpdateSuccess={handleEditSuccess}
        theme={theme}
        colors={colors}
      />

      <DeleteConfirmationModal
        isVisible={isDeleteModalVisible}
        onClose={handleDeleteModalClose}
        wordToDelete={selectedWordForDelete} // Pass the entire word object
        onDeleteSuccess={handleDeleteSuccess}
        theme={theme}
        colors={colors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  viewModeToggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: height * 0.02,
    borderRadius: 10,
    overflow: "hidden",
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
    backgroundColor: "transparent",
  },
  viewModeButtonText: {
    marginLeft: width * 0.02,
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: height * 0.1,
  },
  gridListContent: {
    justifyContent: "space-between",
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
    width: "48%",
    marginHorizontal: "1%",
    marginBottom: width * 0.02,
    aspectRatio: 1,
    justifyContent: "space-between",
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
  addButton: {
    position: "absolute",
    bottom: height * 0.04,
    right: width * 0.05,
    width: width * 0.16,
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
  // Removed all modal-specific styles from here as they are now in their own files
  // You might need to move common modal styles if you extract them into a separate styles file.
});

export default VocabularyBuilderScreen;
