// components/DeleteConfirmationModal.js
import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { deleteVocabularyWord } from "../utils/api";

// Import the common modal styles
import commonModalStyles from "../styles/commonModalStyles"; // Adjust path as needed

const DeleteConfirmationModal = ({
  isVisible,
  onClose,
  wordToDelete,
  onDeleteSuccess,
  colors,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!wordToDelete?._id) {
      Alert.alert("Error", "No word selected for deletion.");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteVocabularyWord(wordToDelete._id);
      Alert.alert("Success", "Word deleted successfully!");
      onDeleteSuccess(); // Notify parent to refresh list
      onClose(); // Close modal
    } catch (error) {
      console.error(
        "Error deleting word:",
        error.response?.data || error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete word."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      animationType="fade"
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
            Confirm Deletion
          </Text>
          <Text
            style={[commonModalStyles.modalText, { color: colors.subText }]}
          >
            Are you sure you want to delete the word "
            <Text style={{ fontWeight: "bold" }}>{wordToDelete?.word}</Text>" ?
          </Text>
          <View style={commonModalStyles.modalButtonContainer}>
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton,
                commonModalStyles.cancelButton,
              ]}
              onPress={onClose}
              disabled={isDeleting}
            >
              <Text style={commonModalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton,
                commonModalStyles.deleteConfirmButton,
                isDeleting && commonModalStyles.disabledButton,
              ]}
              onPress={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={commonModalStyles.buttonText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DeleteConfirmationModal;
