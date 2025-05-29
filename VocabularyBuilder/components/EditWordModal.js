// components/EditWordModal.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { updateVocabularyWord } from "../utils/api"; // Import your API call

// Import the common modal styles
import commonModalStyles from "../styles/commonModalStyles"; // Adjust path as needed

const EditWordModal = ({
  isVisible,
  onClose,
  editingWord,
  onUpdateSuccess,
  theme,
  colors,
}) => {
  const [currentWord, setCurrentWord] = useState("");
  const [currentDefinition, setCurrentDefinition] = useState("");
  const [isUpdating, setIsUpdating] = useState(false); // Local loading state for the modal

  useEffect(() => {
    if (editingWord) {
      setCurrentWord(editingWord.word);
      setCurrentDefinition(editingWord.definition);
    }
  }, [editingWord]);

  const handleUpdate = async () => {
    if (!currentWord.trim() || !currentDefinition.trim()) {
      Alert.alert("Error", "Word and Definition cannot be empty.");
      return;
    }
    if (!editingWord?._id) {
      Alert.alert("Error", "No word selected for editing.");
      return;
    }

    setIsUpdating(true);
    try {
      await updateVocabularyWord(
        editingWord._id,
        currentWord,
        currentDefinition
      );
      Alert.alert("Success", "Word updated successfully!");
      onUpdateSuccess(); // Notify parent to refresh list
      onClose(); // Close modal
    } catch (error) {
      console.error(
        "Error updating word:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update word."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={commonModalStyles.centeredView}>
        <View
          style={[
            commonModalStyles.modalView,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <Text style={[commonModalStyles.modalTitle, { color: colors.text }]}>
            Edit Word
          </Text>
          {editingWord && ( // Ensure editingWord exists before rendering inputs
            <>
              <TextInput
                style={[
                  commonModalStyles.modalInput,
                  {
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                  },
                ]}
                placeholder="Word"
                placeholderTextColor={colors.subText}
                value={currentWord}
                onChangeText={setCurrentWord}
                keyboardAppearance={theme}
                editable={!isUpdating}
              />
              <TextInput
                style={[
                  commonModalStyles.modalInput,
                  {
                    borderColor: colors.inputBorder,
                    backgroundColor: colors.inputBackground,
                    color: colors.text,
                  },
                ]}
                placeholder="Definition"
                placeholderTextColor={colors.subText}
                value={currentDefinition}
                onChangeText={setCurrentDefinition}
                multiline
                numberOfLines={4}
                keyboardAppearance={theme}
                editable={!isUpdating}
              />
            </>
          )}
          <View style={commonModalStyles.modalButtonContainer}>
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton,
                commonModalStyles.cancelButton,
              ]}
              onPress={onClose}
              disabled={isUpdating}
            >
              <Text style={commonModalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton,
                { backgroundColor: colors.primary },
                isUpdating && commonModalStyles.disabledButton,
              ]}
              onPress={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={commonModalStyles.buttonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditWordModal;
