// components/DetailWordModal.js
import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";

// Import the common modal styles
import commonModalStyles from "../styles/commonModalStyles"; // Adjust path as needed

const DetailWordModal = ({
  isVisible,
  onClose,
  word,
  definition,
  theme,
  colors,
}) => {
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
            Word Detail
          </Text>
          {word && (
            <>
              <Text
                style={[
                  commonModalStyles.wordTextDetail,
                  { color: colors.text },
                ]}
              >
                {word}
              </Text>
              <ScrollView style={commonModalStyles.definitionScrollContainer}>
                <Text
                  style={[
                    commonModalStyles.definitionTextDetail,
                    { color: colors.subText },
                  ]}
                >
                  {definition}
                </Text>
              </ScrollView>
            </>
          )}
          <View style={commonModalStyles.modalButtonContainer}>
            <TouchableOpacity
              style={[
                commonModalStyles.modalButton,
                commonModalStyles.cancelButton,
              ]}
              onPress={onClose}
            >
              <Text style={commonModalStyles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DetailWordModal;
