// components/AddWordModal.js
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
import { addVocabularyWord } from "../utils/api";

// Import the common modal styles
import commonModalStyles from "../styles/commonModalStyles"; // Adjust path as needed

const AddWordModal = ({ isVisible, onClose, onAddSuccess, theme, colors }) => {
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setNewWord("");
      setNewDefinition("");
    }
  }, [isVisible]);

  const handleAddWord = async () => {
    if (!newWord.trim() || !newDefinition.trim()) {
      Alert.alert("Error", "Please enter both word and definition.");
      return;
    }
    setIsAdding(true);
    try {
      await addVocabularyWord(newWord, newDefinition);
      Alert.alert("Success", "Word added successfully!");
      onAddSuccess();
      onClose();
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
      setIsAdding(false);
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
        {/* Use common style */}
        <View
          style={[
            commonModalStyles.modalView, // Use common style
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <Text style={[commonModalStyles.modalTitle, { color: colors.text }]}>
            {/* Use common style */}
            Add New Word
          </Text>
          <TextInput
            style={[
              commonModalStyles.modalInput, // Use common style
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
            editable={!isAdding}
          />
          <TextInput
            style={[
              commonModalStyles.modalInput, // Use common style
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
            editable={!isAdding}
          />
          <View style={commonModalStyles.modalButtonContainer}>
            {/* Use common style */}
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton,
                commonModalStyles.cancelButton,
              ]}
              onPress={onClose}
              disabled={isAdding}
            >
              <Text style={commonModalStyles.buttonText}>Cancel</Text>
              {/* Use common style */}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton, // Use common style
                { backgroundColor: colors.primary },
                isAdding && commonModalStyles.disabledButton,
              ]}
              onPress={handleAddWord}
              disabled={isAdding}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={commonModalStyles.buttonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddWordModal;
