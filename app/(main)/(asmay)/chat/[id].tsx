
//--------------------------
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ImageBackground,
  Image,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams,useRouter } from "expo-router";
import { Audio } from "expo-av"; 
import {
  useAudioRecorder,
  useAudioPlayer,
  AudioModule,
  setAudioModeAsync,
  RecordingPresets,
} from "expo-audio";
// import { chatAPI } from "../../services/api";
import { chatAPI } from "@/services/api";
import { useAuth } from "../../../../hooks/useAuth";
import { useSocket } from "../../../../hooks/useSocket";
// import { useStreamVideo } from "@/contexts/StreamVideoContext";
import { Message } from "../../../../types";
import Input from "@/components/Input";

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  // const { streamClient, createCall } = useStreamVideo();
  const { user } = useAuth();
  const router = useRouter()
  const { socket, isConnected } = useSocket();
  const flatListRef = useRef<FlatList>(null);
  const localAudioUris = useRef<Map<string, string>>(new Map());

  // ==================== ÉTATS POUR L'ENREGISTREMENT VOCAL ====================
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingUI, setIsRecordingUI] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // Références pour les timers
  const recordingDurationRef = useRef(0);
  const recordingDurationIntervalRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);

  useEffect(() => {
    loadMessages();
    setupSocketListeners();

    if (socket && chatId) {
      socket.emit("join_chat", chatId);
    }

    return () => {
      if (socket && chatId) {
        socket.emit("leave_chat", chatId);
        // socket.off("new_message");
        // socket.off("message_sent");
        // socket.off("message_error");

        socket.off("new_message");
        socket.off("message_sent");
        socket.off("message_error");
        socket.off("new_voice_message");
        socket.off("voice_message_sent");
        socket.off("voice_message_confirmed");
        socket.off("voice_message_updated");
        socket.off("voice_message_error");
      }
      // Nettoyer les timers
      if (recordingDurationIntervalRef.current) {
        clearInterval(recordingDurationIntervalRef.current);
      }
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
    };
  }, [chatId, socket]);

  // ==================== FONCTIONS D'ENREGISTREMENT VOCAL ====================

  const startRecording = async () => {
    try {
      // 1. Demander la permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "ASMAY a besoin d'accéder à votre microphone pour l'enregistrement"
        );
        return;
      }

      // 2. Configurer l'audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground:true,
      });

      // 3. Créer et démarrer l'enregistrement
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);
      recordingDurationRef.current = 0;

      // 4. Démarrer le timer pour la durée
      recordingDurationIntervalRef.current = setInterval(() => {
        recordingDurationRef.current += 100; // Incrémente de 100ms
        setRecordingDuration((prev) => prev + 100);
      }, 100);

      console.log("🎤 Enregistrement démarré");
    } catch (error) {
      // console.error("❌ Erreur démarrage enregistrement:", error);
      Alert.alert("Erreur", "Impossible de démarrer l'enregistrement");
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    if (!recording) return null;

    try {
      // 1. Arrêter le timer de durée
      if (recordingDurationIntervalRef.current) {
        clearInterval(recordingDurationIntervalRef.current);
        recordingDurationIntervalRef.current = null;
      }

      // 2. Arrêter l'enregistrement
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      // 3. Réinitialiser les états
      setRecording(null);
      setIsRecording(false);
      setIsRecordingUI(false);

      console.log("⏹️ Enregistrement arrêté, URI:", uri);
      return uri;
    } catch (error) {
      console.error("❌ Erreur arrêt enregistrement:", error);
      return null;
    }
  };

  // ==================== GESTION DE L'INTERFACE D'ENREGISTREMENT ====================

  const handlePressIn = () => {
    // Démarrer un timer pour l'appui long
    recordingTimerRef.current = setTimeout(async () => {
      await startRecording();
      setIsRecordingUI(true);
    }, 200);
  };

  const handlePressOut = async () => {
    // 1. Annuler le timer d'appui long
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // 2. Si on était en train d'enregistrer
    if (isRecording && recording) {
      try {
        const audioUri = await stopRecording();

        if (!audioUri) {
          throw new Error("Aucun URI d'audio retourné");
        }

        // 3. Vérifier la durée minimale (1 seconde)
        const totalDuration = recordingDurationRef.current;
        if (totalDuration < 1000) {
          Alert.alert(
            "Trop court",
            "Le message vocal doit durer au moins 1 seconde"
          );
          return;
        }

        // 4. Envoyer le message vocal
        const durationInSeconds = Math.floor(totalDuration / 1000);
        await sendVoiceMessage(audioUri, durationInSeconds);

        // 5. Réinitialiser
        setRecordingDuration(0);
        recordingDurationRef.current = 0;
      } catch (error) {
        // console.error("❌ Erreur lors de l'envoi du message vocal:", error);
        Alert.alert("Erreur", "Impossible d'envoyer le message vocal");
      }
    }
  };

  // ==================== ENVOI DU MESSAGE VOCAL ====================

  const sendVoiceMessage = async (
    audioUri: string,
    durationSeconds: number
  ) => {
    try {
      // ID temporaire pour le frontend
      const tempId = `temp-voice-${Date.now()}`;

      // 1. Créer le message temporaire dans l'UI
      const tempMessage: Message = {
        _id: tempId,
        sender: {
          _id: user?._id || "",
          username: user?.username || "Vous",
        },
        content: "",
        audioUrl: "", // Vide pour l'instant
        duration: durationSeconds,
        chat: chatId as string,
        createdAt: new Date().toISOString(),
        type: "audio",
        isSending: true,
      };

      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();

      // 2. Émettre via socket IMMÉDIATEMENT (pour le temps réel)
      if (socket && isConnected) {
        socket.emit("send_voice_message", {
          chatId: chatId,
          tempId: tempId,
          duration: durationSeconds,
          // On envoie l'URI temporaire, le backend la transformera en URL
          audioUrl: `temp://voice/${tempId}`,
          timestamp: new Date(),
        });
      }

      // 3. Upload via API REST (côté serveur)
      const response = await chatAPI.sendVoiceMessage(
        chatId as string,
        audioUri,
        durationSeconds
      );

      if (response.data.success) {
        const {
          audioUrl,
          duration: serverDuration,
          _id: messageId,
        } = response.data.data;

        // 4. Mettre à jour le message avec les vraies données
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === tempId
              ? {
                  ...msg,
                  _id: messageId,
                  audioUrl: response.data.data.audioFullUrl || audioUrl,
                  duration: serverDuration,
                  isSending: false,
                }
              : msg
          )
        );

        // 5. Notifier via socket que le message est définitivement stocké
        if (socket && isConnected) {
          socket.emit("voice_message_stored", {
            tempId: tempId,
            messageId: messageId,
            chatId: chatId,
          });
        }

        console.log("✅ Message vocal complet envoyé:", messageId);
      } else {
        throw new Error(response.data.message || "Échec de l'envoi");
      }
    } catch (error: any) {
      // console.error("❌ Erreur envoi message vocal:", error);
      const tempId = `temp-voice-${Date.now()}`;

      // Marquer le message comme erreur
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId
            ? { ...msg, hasError: true, isSending: false }
            : msg
        )
      );

      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Impossible d'envoyer le message vocal"
      );
    }
  };

  // ==================== LECTURE DES MESSAGES VOCAUX ====================
  const audioPlayer = useAudioPlayer();
  const playAudioMessage = async (audioUrl: string) => {
    if (audioUrl && audioUrl.startsWith("/")) {
      audioUrl = `https://asmay-3666dae6847a.herokuapp.com${audioUrl}`;
    }
    try {
      await audioPlayer.replace({ uri: audioUrl });
      // Jouer le son
      audioPlayer.play();
      console.log(" Lecture audio terminée");
    } catch (error) {
      console.error(" Erreur lecture audio:", error);
    }
  };

  const player = useAudioPlayer(
    require("../../../../assets/sound/sendMessage.mp3")
  );
  const playMessageSound = () => {
    player.seekTo(0);
    player.play();

  };
  
  //=======================FONCTION POUR  LANCER L'APPEL VIDEO ========================

  // const startVideoCall = async () => {
  //   try {
  //     // Utiliser l'ID du chat comme ID d'appel pour le retrouver facilement
  //     console.log("Appel Vidéo !")
  //     const call = await createCall('default', `chat_${chatId}`);
  //   
  //     // Rejoindre l'appel (crée la salle)
  //     await call.join({ create: true });
  //     
  //     // Naviguer vers l'écran d'appel
  //     router.navigate({
  //       pathname: '/(main)/(asmay)/chat/videoCall',
  //       params: { 
  //         callId: call.id,
  //         chatId: chatId 
  //       }
  //     });
  //     
  //     // Optionnel : Envoyer une notification à l'autre participant via Socket.io
  //     if (socket && isConnected) {
  //       socket.emit('video_call_initiated', {
  //         chatId,
  //         callId: call.id,
  //         callerId: user?._id,
  //         callerName: user?.username
  //       });
  //     }
  //   } catch (error) {
  //     console.error('❌ Erreur démarrage appel vidéo:', error);
  //     Alert.alert('Erreur', 'Impossible de démarrer l\'appel vidéo');
  //   }
  // };

  // ==================== FONCTIONS ORIGINALES DU CHAT

  const setupSocketListeners = () => {
    if (!socket) return;

    const receivedMessageIds = new Set();

    socket.on("new_message", (messageData: Message) => {
      playMessageSound();
      if (messageData.chat === chatId) {
        if (messageData.sender._id === user?._id) return;
        if (receivedMessageIds.has(messageData._id)) return;

        setMessages((prev) => {
          const alreadyExists = prev.some(
            (msg) =>
              msg._id === messageData._id ||
              msg._id === `temp-${messageData._id}` ||
              (msg.content === messageData.content &&
                msg.sender._id === messageData.sender._id &&
                Math.abs(
                  new Date(msg.createdAt).getTime() -
                    new Date(messageData.createdAt).getTime()
                ) < 1000)
          );

          if (alreadyExists) return prev;
          receivedMessageIds.add(messageData._id);
          return [...prev, messageData];
        });

        scrollToBottom();
      }
    });

    socket.on("message_sent", (data: { messageId: string; tempId: string }) => {
      setMessages((prev) => {
        const newMessages = prev.filter(
          (msg) => !(msg._id === data.tempId || msg._id === data.messageId)
        );

        return [
          ...newMessages,
          {
            ...prev.find((msg) => msg._id === data.tempId),
            _id: data.messageId,
            isSending: false,
            hasError: false,
          } as Message,
        ];
      });

      setIsSending(false);
    });

    socket.on("message_error", (error: { tempId?: string; error: string }) => {
      if (error.tempId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === error.tempId
              ? { ...msg, hasError: true, isSending: false }
              : msg
          )
        );
      }
      setIsSending(false);
    });

    // Réception d'un nouveau message vocal
    socket.on("new_voice_message", (messageData: Message) => {
      playMessageSound();
      console.log(" DEBUG - Message vocal reçu:", {
        messageId: messageData._id,
        audioUrl: messageData.audioUrl,
        type: messageData.type,
        duration: messageData.duration,
        sender: messageData.sender?.username,
        isMe: messageData.sender?._id === user?._id,
      });
      if (messageData.chat === chatId) {
        // Vérifier que ce n'est pas notre propre message
        if (messageData.sender._id === user?._id) {
          return; // C'est notre message, on l'ignore
        }

        // Ajouter le message à la liste
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (msg) =>
              msg._id === messageData._id ||
              (msg.type === "audio" && msg.audioUrl === messageData.audioUrl)
          );

          if (alreadyExists) return prev;
          return [...prev, messageData];
        });

        scrollToBottom();
        console.log("🔊 Message vocal reçu:", messageData.duration + "s");
      }
    });

    // Confirmation d'envoi via socket (avant l'API REST)
    socket.on(
      "voice_message_sent",
      (data: { tempId: string; messageId: string }) => {
        console.log("✅ Message vocal envoyé (socket):", data.tempId);

        // Marquer le message comme envoyé
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.tempId ? { ...msg, isSending: false } : msg
          )
        );
      }
    );

    // Confirmation finale quand le backend a stocké le message
    socket.on(
      "voice_message_confirmed",
      (data: { oldTempId: string; newMessageId: string }) => {
        console.log(
          "✅ Message vocal confirmé (backend):",
          data.oldTempId,
          "->",
          data.newMessageId
        );

        // Remplacer l'ID temporaire par l'ID réel
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.oldTempId
              ? { ...msg, _id: data.newMessageId }
              : msg
          )
        );
      }
    );

    // Mise à jour quand un autre utilisateur a son message confirmé
    socket.on(
      "voice_message_updated",
      (data: { oldTempId: string; newMessageId: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.oldTempId
              ? { ...msg, _id: data.newMessageId }
              : msg
          )
        );
      }
    );

    // Erreur d'envoi via socket
    socket.on(
      "voice_message_error",
      (error: { tempId?: string; error: string }) => {
        console.error("❌ Erreur socket message vocal:", error);

        if (error.tempId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === error.tempId
                ? { ...msg, hasError: true, isSending: false }
                : msg
            )
          );
        }

        Alert.alert(
          "Erreur",
          error.error || "Impossible d'envoyer le message vocal"
        );
      }
    );
  };

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(chatId as string);

      if (response.data.success && response.data.data) {
        setMessages(response.data.data);
        setTimeout(() => scrollToBottom(), 200);
      } else {
        throw new Error(
          response.data.message || "Erreur de chargement des messages"
        );
      }
    } catch (error) {
      console.error("Erreur chargement messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const sendMessage = async () => {
    const messageContent = newMessage.trim();
    if (!messageContent || isSending) return;

    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      sender: {
        _id: user?._id || "",
        username: user?.username || "Vous",
      },
      content: messageContent,

      chat: chatId as string,
      createdAt: new Date().toISOString(),
      isSending: true,
    };

    try {
      setIsSending(true);
      setNewMessage("");
      setMessages((prev) => [...prev, tempMessage]);
      scrollToBottom();

      if (socket && isConnected) {
        socket.emit("send_message", {
          chatId: chatId,
          content: messageContent,
          tempId: tempMessage._id,
        });
      } else {
        const response = await chatAPI.sendMessage(
          chatId as string,
          messageContent
        );

        if (response.data.success) {
          const newMessageData = response.data.data;
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === tempMessage._id
                ? { ...newMessageData, isSending: false }
                : msg
            )
          );
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id
            ? { ...msg, hasError: true, isSending: false }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const retrySendMessage = (messageId: string) => {
    const failedMessage = messages.find((msg) => msg._id === messageId);
    if (failedMessage) {
      setNewMessage(failedMessage.content);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    }
  };
 

  // ==================== RENDU DES MESSAGES ====================

  const renderMessage = ({ item }: { item: Message }) => {
    if (!item || !item.sender) return null;

    const isMyMessage = item.sender._id === user?._id;
    const isVoiceMessage = item.type === "audio" || item.audioUrl;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessage : styles.theirMessage,
          item.hasError && styles.messageError,
        ]}
      >
        {(isMyMessage || (!isMyMessage))&&
          (item.sender.profilePicture ? (
            <Image
              source={{ uri: item.sender.profilePicture }}
              style={styles.image}
            />
          ) : (
            <Text        style={styles.imag}>{item.sender.username?.charAt(0).toUpperCase() || "U"}</Text>
          ))}

        {isVoiceMessage ? (
          // Message vocal
          <TouchableOpacity
            onPress={() => playAudioMessage(item.audioUrl!)}
            style={styles.voiceMessageContainer}
          >
            <Text style={[styles.voiceIcon, isMyMessage && styles.myVoiceIcon]}>
                   <Ionicons      
                              name={"mic"} 
                              size={27} 
                             color={"red"} 
                          />
             
            </Text>
            <View style={styles.voiceMessageInfo}>
              <Text
                style={[
                  styles.voiceMessageText,
                  isMyMessage && styles.myVoiceMessageText,
                ]}
              >
                Message vocal
              </Text>
              <Text
                style={[
                  styles.voiceDuration,
                  isMyMessage && styles.myVoiceDuration,
                ]}
              >
                {item.duration || 0}s
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          // Message texte
          <Text
            style={[styles.messageText, isMyMessage && styles.myMessageText]}
          >
            {item.content}
          </Text>
        )}

        <View style={styles.messageFooter}>
          <Text style={[styles.time, isMyMessage && styles.myTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isMyMessage && (
            <View style={styles.statusContainer}>
              {item.isSending ? (
                <ActivityIndicator size="small" color="#fbf6f6" />
               
               ) :( <Ionicons      
                              name={"eye"} 
                              size={24} 
                             color={"white"} 
                             style={styles.backButton}
                          />
              )}
              {item.hasError && (
                <TouchableOpacity onPress={() => retrySendMessage(item._id)}>
                  <Text style={styles.retryText}>🔄</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  // ==================== RENDU PRINCIPAL ====================

  return (
    <KeyboardAvoidingView
      style={styles.clavier}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ImageBackground
        source={require("../../../../assets/images/asmay-icon.png")}
        resizeMode="cover"
        style={styles.container}
      >
           <View style={styles.header}>
          <TouchableOpacity onPress={() => router.navigate("/(main)/(asmay)/message")}>
              <Ionicons      
                              name={"arrow-back"} 
                              size={24} 
                             color={"white"} 
                             style={styles.backButton}
                          />
          </TouchableOpacity>
            {/*  BOUTON APPEL VIDÉO */}
          {/* <TouchableOpacity 
            style={styles.callButton}
            onPress={startVideoCall}
            disabled={!streamClient}
          >
             <Ionicons      
                              name={"call"} 
                              size={24} 
                             color={"white"} 
                          />
          </TouchableOpacity> */}
        </View>
        {/* Liste des messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun message</Text>
              <Text style={styles.emptySubtext}>
                Envoyez le premier message !
              </Text>
            </View>
          }
        />

        {/* Overlay d'enregistrement vocal */}
        {isRecordingUI && (
          <View style={styles.recordingOverlay} 
          >
            <TouchableOpacity style={styles.recordingBox} onPress={handlePressOut}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>
                  Enregistrement en cours...
                </Text>
              </View>
                  <Ionicons name="recording" color={"#396902ff"} size={40} />
              <Text style={styles.recordingTime}>
                {Math.floor(recordingDuration / 1000)}s
              </Text>
              <Text style={styles.recordingHint}>Cliquez pour envoyer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Zone de saisie */}
        <View style={styles.inputContainer}>
          {/* Bouton microphone */}
          <TouchableOpacity
            onPress={handlePressIn}
            touchSoundDisabled={false}
            delayLongPress={300}
            style={[
              styles.micButton,
              (isRecording || isRecordingUI) && styles.micButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.micIcon,
                (isRecording || isRecordingUI) && styles.micIconActive,
              ]}
            >
            <Ionicons      
                  name={"mic"} 
                  size={26} 
                    color={"#f0ecebff"} 
                          />
            </Text>
          </TouchableOpacity>

          {/* Champ de texte */}
          <Input
            placeholder="Tapez votre Asmay..."
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
            onFocus={scrollToBottom}
          />

          {/* Bouton d'envoi texte */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || isSending) && styles.disabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
               <Ionicons      
                              name={"send"} 
                              size={24} 
                             color={"white"} 

                          />
            )}
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:40,
    backgroundColor:"#203447ff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
    
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    // borderBottomWidth: 1,
    // borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 24,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  callButton: {
    backgroundColor: '#3f9e07ff',
    width: 40,
    height: 40,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  callIcon: {
    fontSize: 20,
    color: '#fff',
  },
  image: {
    height: 60,
    width: 60,
    borderRadius:30,
    position: "absolute",
    right: 0,
    top: 6,
    left: 186,
  },imag:{
   height: 60,
    width: 60,
    backgroundColor:"#6769e7ff",
    color:"#fff",
textAlign:"center",
textAlignVertical:"center",
padding:"auto",
    borderRadius:30,
    position: "absolute",
    fontSize:25,
    fontWeight:"bold",
    right: 0,
    top: 6,
    left: 186,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 20,
    color: "#fff",
    fontWeight:"bold"
  },
  emptySubtext: {
    fontSize: 14,
    color: "#d6c8c8ff",
    marginTop: 5,
  },
  messagesList: {
    padding: 30,
    paddingBottom: 20,
  },
  messageContainer: {
    width: "85%",
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3a5879ff",
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 0,
    elevation: 30,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffffff",
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 30,
  },
  messageError: {
    backgroundColor: "#ffebee",
    borderColor: "#f44336",
    borderWidth: 1,
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 20,
    maxWidth:190
  },
  clavier: {
    flex: 1,
    bottom:0
  },
  myMessageText: {
    color: "#fff",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  time: {
    fontSize: 10,
    color: "#666",
  },
  myTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  retryText: {
    fontSize: 14,
    color: "#f44336",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#203447ff",
    // borderTopWidth: 1,
    // borderTopColor: "#e0e0e0",
    paddingBottom: Platform.OS === "ios" ? 10 : 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 90,
    minWidth: 200,
    maxWidth: 225,
    borderWidth: 1,
    borderColor: "#ddd",
    color:"white",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    marginRight: 10,
    marginTop: 10,
    backgroundColor: "transparent",
    fontSize: 16,
    fontWeight:"bold",
    elevation: 4,
  },
  sendButton: {
    backgroundColor: "#007bff",
    width: 46,
    height: 46,
    borderRadius: 22,
    // borderWidth:1,
    borderColor:"#fff",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  disabled: {
    backgroundColor: "#457a78ff",
  },
  sendText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    transform: [{ rotate: "0deg" }],
  },
  // Styles pour les messages vocaux
  voiceMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 0,
    // backgroundColor:"#26163bff",
    width: "70%",
    height: 50,
  },
  voiceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  myVoiceIcon: {
    color: "#fff",
  },
  voiceMessageInfo: {
    flex: 1,
  },
  voiceMessageText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  myVoiceMessageText: {
    color: "#fff",
  },
  voiceDuration: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  myVoiceDuration: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  // Styles pour l'enregistrement
  micButton: {
    padding: 10,
    borderRadius: 34,
    borderWidth:1,
    borderColor:"#e7e4e4ff",
    backgroundColor: "transparent",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 28,
    minHeight: 28,
    elevation: 3,
  },
  micButtonActive: {
    backgroundColor: "#ffebee",
  },
  micIcon: {
    fontSize: 20,
  },
  micIconActive: {
    color: "#FF3B30",
  },
  recordingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  recordingBox: {
    backgroundColor: "#fff",
    borderTopRightRadius: 75,
    borderBottomLeftRadius: 75,
    borderTopLeftRadius:45,
    borderWidth:2,
    borderColor:"#118502ff",
    padding: 24,
    alignItems: "center",
    width: 280,
    elevation: 10,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF3B30",
    marginRight: 10,
  },
  recordingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  recordingTime: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF3B30",
    marginVertical: 12,
  },
  recordingHint: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});
