// styles/commonModalStyles.js

import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const commonModalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)", // Semi-transparent overlay
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
  darkModalView: {
    backgroundColor: "#444",
  },
  modalTitle: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  darkModalTitle: {
    color: "#eee", // Color for dark mode
  },
  modalText: {
    // For confirmation messages etc.
    fontSize: width * 0.045,
    marginBottom: height * 0.03,
    textAlign: "center",
  },
  darkModalText: {
    color: "#eee", // Color for dark mode
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
    backgroundColor: "#6c757d", // A neutral grey for cancel
  },
  deleteConfirmButton: {
    // Specific for delete
    backgroundColor: "red",
  },
  disabledButton: {
    // For buttons that are disabled during async operations
    opacity: 0.7,
  },
  wordTextDetail: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: height * 0.01,
    textAlign: "center",
  },
});

export default commonModalStyles;
