import { Modal, View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext"; // Assuming you still use ThemeContext
// Import the common modal styles
import commonModalStyles from "../styles/commonModalStyles"; // Adjust path as needed

const LogoutConfirmationModal = ({ isVisible, onClose, onConfirmLogout }) => {
  const { theme, colors } = useTheme(); // Access theme for consistent styling

  return (
    <Modal
      animationType="fade" // Or 'slide'
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Allows closing with hardware back button on Android
    >
      <View style={commonModalStyles.centeredView}>
        <View
          style={[
            commonModalStyles.modalView,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <Text
            style={[
              commonModalStyles.modalTitle,
              theme === "dark" && commonModalStyles.darkModalTitle,
            ]}
          >
            Are you sure you want to log out?
          </Text>
          <View style={commonModalStyles.modalButtonContainer}>
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton,
                commonModalStyles.cancelButton,
              ]}
              onPress={onClose}
            >
              <Text style={commonModalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton,
                commonModalStyles.deleteConfirmButton,
              ]}
              onPress={onConfirmLogout}
            >
              <Text style={commonModalStyles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LogoutConfirmationModal;
