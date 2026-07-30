// components/HiReplyModal.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const { height } = Dimensions.get("window");

// ==================== TYPES ====================
export interface HiReplyUser {
  _id: string;
  username: string;
  profilePicture?: string;
}

export interface HiReplyModalProps {
  visible: boolean;
  fromUser: HiReplyUser | null;
  message: string;
  onClose: () => void;
  onSend: (replyMessage: string) => Promise<void>;
  isSending?: boolean;
}

// ==================== COMPOSANT ====================
const HiReplyModal: React.FC<HiReplyModalProps> = ({
  visible,
  fromUser,
  message,
  // onClose,
  // onSend,
  isSending = false,
}) => {
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!replyMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSend(replyMessage.trim());
      setReplyMessage("");
      onClose();
    } catch (error) {
      console.error("Erreur envoi réponse:", error);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setReplyMessage("");
    onClose();

  };

  if (!fromUser) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* ===== En-tête ===== */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              {fromUser.profilePicture ? (
                <Image
                  source={{ uri: fromUser.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarText}>
                    {fromUser.username?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              )}
              <View style={styles.headerText}>
                <Text style={styles.username}>{fromUser.username}</Text>
                <Text style={styles.subtitle} numberOfLines={2}>
                  vous a dit : "{message}"
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ===== Zone de réponse ===== */}
          <View style={styles.body}>
            <Text style={styles.label}>Votre réponse :</Text>
            <TextInput
              style={styles.input}
              placeholder="Répondez à son message..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={replyMessage}
              onChangeText={setReplyMessage}
              multiline
              maxLength={300}
              autoFocus
              editable={!sending}
            />
            <Text style={styles.charCount}>{replyMessage.length}/300</Text>
          </View>

          {/* ===== Actions ===== */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={sending}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!replyMessage.trim() || sending) && styles.sendDisabled,
              ]}
              onPress={handleSend}
              disabled={!replyMessage.trim() || sending}
            >
              {sending || isSending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#000" />
                  <Text style={styles.sendText}>Envoyer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: height * 0.7,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  avatarPlaceholder: {
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerText: {
    flex: 1,
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    marginTop: 2,
    fontStyle: "italic",
  },
  // Body
  body: {
    padding: 20,
  },
  label: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
    fontSize: 15,
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    textAlignVertical: "top",
  },
  charCount: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 11,
    textAlign: "right",
    marginTop: 6,
  },
  // Actions
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cancelText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  sendButton: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sendDisabled: {
    backgroundColor: "rgba(255, 215, 0, 0.3)",
    opacity: 0.5,
  },
  sendText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "700",
  },
});

export default HiReplyModal;