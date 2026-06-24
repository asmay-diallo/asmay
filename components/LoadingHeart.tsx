// components/LoadingHeart.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width, height } = Dimensions.get("window");

interface LoadingHeartProps {
  message?: string;
  subMessage?: string;
}

export default function LoadingHeart({
  message = "Chargement...",
  subMessage = "Préparez-vous à faire de belles rencontres 💛",
}: LoadingHeartProps): React.JSX.Element {
  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotsOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animation de battement du cœur
    const heartbeat = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 100,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    heartbeat.start();

    // Animation d'opacité du halo
    const haloOpacity = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    haloOpacity.start();

    // Animation de rotation lente des particules
    const rotation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotation.start();

    // Animation de flottement
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    floating.start();

    // Animation du texte "Chargement..."
    const dotsPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(dotsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(dotsOpacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    dotsPulse.start();

    return () => {
      heartbeat.stop();
      haloOpacity.stop();
      rotation.stop();
      floating.stop();
      dotsPulse.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Fond animé avec dégradé */}
      <View style={styles.backgroundGradient}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />
      </View>

      {/* Particules en orbite */}
      <Animated.View
        style={[
          styles.orbitContainer,
          { transform: [{ rotate: spin }] },
        ]}
      >
        {[...Array(8)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                transform: [
                  { rotate: `${i * 45}deg` },
                  { translateY: -70 },
                ],
                backgroundColor:
                  i % 2 === 0 ? "#ff6b6b" : "#FFD700",
                opacity: 0.6 + (i % 3) * 0.15,
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Halo lumineux */}
      <Animated.View
        style={[
          styles.halo,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      />

      {/* Cœur principal */}
      <Animated.View
        style={[
          styles.heartContainer,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: floatAnim },
            ],
          },
        ]}
      >
        <Ionicons name="heart" size={80} color="#ff4444" />
        {/* Petit cœur superposé */}
        <Ionicons
          name="heart"
          size={50}
          color="#ff6b6b"
          style={styles.innerHeart}
        />
      </Animated.View>

      {/* Message principal */}
      <Animated.View
        style={[
          styles.messageContainer,
          { transform: [{ translateY: floatAnim }] },
        ]}
      >
        <Text style={styles.title}>Asmay</Text>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>

      {/* Points de chargement */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                opacity: dotsOpacity,
                transform: [
                  {
                    scale: dotsOpacity.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
                animationDelay: `${i * 0.2}s`,
              },
            ]}
          />
        ))}
      </View>

      {/* Sous-message */}
      <Text style={styles.subMessage}>{subMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    overflow: "hidden",
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  bgCircle1: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 68, 68, 0.08)",
  },
  bgCircle2: {
    position: "absolute",
    bottom: -150,
    left: -50,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: "rgba(255, 107, 107, 0.05)",
  },
  bgCircle3: {
    position: "absolute",
    top: "40%",
    left: -200,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(255, 215, 0, 0.04)",
  },
  orbitContainer: {
    position: "absolute",
    width: 140,
    height: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  halo: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 68, 68, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 68, 68, 0.3)",
  },
  heartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  innerHeart: {
    position: "absolute",
    opacity: 0.6,
  },
  messageContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ff4444",
    letterSpacing: 3,
    textShadowColor: "rgba(255, 68, 68, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    letterSpacing: 1,
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6b6b",
  },
  subMessage: {
    marginTop: 25,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
    paddingHorizontal: 40,
    fontStyle: "italic",
  },
});