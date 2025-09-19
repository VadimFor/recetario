import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  autoCloseTimeout?: number; // in milliseconds
};

export const ConfirmModal = ({
  visible,
  message = "Do you want to continue?",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  autoCloseTimeout,
}: ConfirmModalProps) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!visible || !autoCloseTimeout) return;

    const totalSeconds = Math.ceil(autoCloseTimeout / 1000);
    setSecondsLeft(totalSeconds);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        //esto hace rerender cada segundo del componente.
        if (prev === null) return null;
        if (prev <= 1) {
          //SI LLEGA A 0, CIERRA EL MODAL
          clearInterval(interval);
          setTimeout(() => onCancel(), 0); //se asegura que onCancel se llame después de limpiar el intervalo
          return 0;
        }
        return prev - 1; // Decrementa el contador
      });
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(interval);
  }, [visible, autoCloseTimeout, onCancel]);

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={onCancel}>
      <View style={styles.container}>
        {/* Stop propagation so clicks inside modal don't close it */}
        <TouchableWithoutFeedback>
          <View style={styles.modal}>
            <View style={styles.messageRow}>
              {secondsLeft !== null && (
                <Text style={styles.countdown}> {secondsLeft}s </Text>
              )}
              <Text style={styles.message}>{message}</Text>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.confirm]}
                onPress={onConfirm}
              >
                <Text style={styles.buttonText}>{confirmText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancel]}
                onPress={onCancel}
              >
                <Text style={styles.buttonText}>{cancelText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    position: "absolute",
  },
  modal: {
    width: "70%",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#e8edea",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 44,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  countdown: {
    fontSize: 14,
    color: "#f00",
    marginRight: 6,
    fontWeight: "bold",
  },
  message: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancel: { backgroundColor: "#003" },
  confirm: { backgroundColor: "#f55" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
