
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { ARUser } from "../types/index";

const { width, height } = Dimensions.get("window");

interface ARRadarViewProps {
  users: ARUser[];
  isSendingSignal: string | null;
  onUserPress: (userId: string) => void;
  currentLocation: { lat: number; lon: number };
}

const ARRadarView: React.FC<ARRadarViewProps> = ({
  users,
  onUserPress,
  currentLocation,
  isSendingSignal,
}) => {
// States 
 const [isVisibleUserOnRadar,setIsVisibleUserOnRadar] = useState(true)

  const showUserOptions = (user: ARUser) => {
    onUserPress(user._id)
    // Alert.alert(
    //   "Signal",
    //   `Voulez-vous envoyez un signal à ${user.username} distant de  ${user.distance}m - ${user.interest_count} intérêts communs`,
    //   [
    //     { text: 'Annuler', style: 'cancel' },
    //     { text: 'Envoyer', onPress: () => onUserPress(user._id) },
    //   ]
    // );
  };

  const calculateScreenPosition = (distance: number, bearing: number) => {
    const maxDisplayDistance = 100;
    const normalizedDistance = Math.min(distance, maxDisplayDistance);
    const radarRadius = Math.min(width, height) / 2 - 50;
    const scale = radarRadius / maxDisplayDistance;

    const angle = (bearing * Math.PI) / 180;
    const x = normalizedDistance * scale * Math.sin(angle) + width / 2;
    const y = height / 2 - normalizedDistance * scale * Math.cos(angle);

    return {
      x: Math.max(35, Math.min(width - 35, x)),
      y: Math.max(35, Math.min(height - 35, y)),
    };
  };

  const getDistanceStyle = (distance: number) => {
    if (distance <= 25) return styles.markerVeryClose;
    if (distance <= 50) return styles.markerClose;
    if (distance <= 75) return styles.markerMedium;
    return styles.markerFar;
  };

  return (
    <View style={styles.container}>
      {/* Position actuelle */}
      <View style={styles.currentPosition}>
        <Text style={styles.currentPositionText}>Moi</Text>
      </View>

      {/* Cercle radar */}
      {/* <View style={styles.radarCircle} />
      <View style={styles.radarCircleInner} /> */}

      {/* Marqueurs */}
      {users.map((user) => {
        const position = calculateScreenPosition(user.distance, user.bearing);
        const isSending = isSendingSignal === user._id;
        const isVisibleUser = user.privacySettings.showOnRadar
        setIsVisibleUserOnRadar(isVisibleUser)

        if(!isVisibleUserOnRadar ){
          Alert.alert("Invisible Asmayien📡",`${user.username.toUpperCase()} est en ligne, mais son Asmay est fermé. Attendez qu'il soit activé sinon vous ne pouvez pas lui voir pour envoyer un signal sur Asmay`)
          return ;
        }

        return (
          <TouchableOpacity
            key={user._id}
            style={[
              styles.marker,
              { left: position.x - 25, top: position.y - 25 },
              isSending && styles.markerSending,
            ]}
            onPress={() => showUserOptions(user)}
            activeOpacity={0.7}
            disabled={isSending}
          >
            <View style={styles.markerContent}>
              {isSending ? (null
              ) : (
                <>
                  <View style={[styles.markerCircle, getDistanceStyle(user.distance)]}>
                    {user.profilePicture ? (
                      <Image source={{ uri: user.profilePicture }} style={styles.image} />
                    ) : (
                      <View style={styles.charAt}>
                        <Text style={styles.chaAtText}>
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </Text>
                      </View>
                    )}
                    
                  
                  </View>
                  
                  <Text style={styles.markerDistance}>{user.distance}m</Text>
                  <Text style={styles.markerName} numberOfLines={1}>
                    {user.username}
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        );
      })
      }
          
      {/* Légende */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          {users.length} utilisateur{users.length > 1 ? "s" : ""} proche{users.length > 1 ? "s" : ""}
        </Text>
        
        {isSendingSignal && (
          <View style={styles.globalSendingIndicator}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.globalSendingText}>Envoi de signal...</Text>
          </View>
        )}

     
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop:10,
  },
  radarCircle: {
    position: "absolute",
    left: width / 2 - 90,
    top: height / 2 - 190,
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    backgroundColor: "transparent",
  },
  radarCircleInner: {
    position: "absolute",
    left: width / 2 - 66,
    top: height / 2 - 164,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "transparent",
  },
  currentPosition: {
    position: "absolute",
    left: width / 2 - 36,
    top: height / 2 - 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor:"black",
    justifyContent: "center",
    alignItems: "center",
    elevation:4,
    zIndex: 1000,
  },
  currentPositionText: {
    color: "#f1f7f7ff",
    fontSize: 15,
    fontWeight: "bold",
  },
  marker: {
    position: "absolute",
    width: 50,
    height: 70,
    zIndex: 100,
    alignItems: "center",
  },
  markerSending: {
    opacity: 0.7,
    transform: [{ scale: 0.9 }],
  },
  markerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerCircle: {
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  image: {
    height: 58,
    width: 58,
    borderRadius: 30,
  },
  charAt: {
    height: 58,
    width: 58,
    borderRadius: 30,
    backgroundColor: "blue",
    alignItems: "center",
    justifyContent: "center",
  },
  chaAtText: {
    fontSize: 23,
    color: "white",
    fontWeight: "bold",
  },
  markerDistance: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  markerName: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    maxWidth: 50,
    textAlign: "center",
  },
  legend: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  legendText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  globalSendingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193, 7, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginTop: 5,
  },
  globalSendingText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 8,
  },
  
  markerVeryClose: {
    backgroundColor: "rgba(255, 59, 48, 0.9)",
    transform: [{ scale: 1.1 }],
  },
  markerClose: {
    backgroundColor: "rgba(255, 149, 0, 0.9)",
  },
  markerMedium: {
    backgroundColor: "rgba(52, 199, 89, 0.9)",
  },
  markerFar: {
    backgroundColor: "rgba(0, 122, 255, 0.9)",
    transform: [{ scale: 0.9 }],
  },
});

export default ARRadarView;