import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface CoinDisplayProps {
  coins: number;
  exchangeRate?: number; // 0.01 pour 1 coin = 0.01 USD
  currency?: string; // 'USD', 'EUR', etc.
  showToggle?: boolean;
}

const CoinDisplay: React.FC<CoinDisplayProps> = ({
  coins = 0,
  exchangeRate = 0.0001,
  currency = "USD",
  showToggle = true,
}) => {
  const [showCurrency, setShowCurrency] = useState(false);

  // Calcul de la conversion
  const monetaryValue = coins * exchangeRate;

  // Formatage selon la devise
  const formatCurrency = (value: number, curr: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <View style={styles.container}>
      {showToggle ? (
        <TouchableOpacity
          style={styles.displayBox}
          onPress={() => setShowCurrency(!showCurrency)}
          activeOpacity={0.7}
        >
          {showCurrency ? (
            <>
              <Text style={styles.value}>
                {formatCurrency(monetaryValue, currency)}
              </Text>
              <Text style={styles.label}>Solde 💰</Text>
              <Text style={styles.hint}>💵 Tapez pour voir en coins</Text>
            </>
          ) : (
            <>
              <Text style={styles.value}>{coins.toLocaleString("fr-FR")}</Text>
              <Text style={styles.label}>Coins</Text>
              <Text style={styles.hint}>🪙 Tapez pour convertir</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        // Affichage double simultané
        <View style={styles.dualDisplay}>
          <View style={styles.dualColumn}>
            <Text style={styles.dualValue}>
              {coins.toLocaleString("fr-FR")}
            </Text>
            <Text style={styles.dualLabel}>Coins</Text>
          </View>
          <Text style={styles.equals}>=</Text>
          <View style={styles.dualColumn}>
            <Text style={styles.dualValue}>
              {formatCurrency(monetaryValue, currency)}
            </Text>
            <Text style={styles.dualLabel}>{currency}</Text>
          </View>
        </View>
      )}

      {/* Information du taux */}
      <Text style={styles.rateInfo}>
        1 coin = 0.0001 $
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 10,
  },
  displayBox: {
    backgroundColor: "#203447ff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#36da4cff",
    width: "100%",
  },
  value: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 5,
  },
  label: {
    fontSize: 20,
    color: "#ece6e6ff",
    marginBottom: 8,
    fontWeight:"bold"
  },
  hint: {
    fontSize: 16,
    color: "#e7e1e1ff",
    fontStyle: "italic",
  },
  dualDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
  },
  dualColumn: {
    alignItems: "center",
    paddingHorizontal: 15,
  },
  dualValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
  },
  dualLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  equals: {
    fontSize: 20,
    color: "#999",
    marginHorizontal: 10,
  },
  rateInfo: {
    fontSize: 14,
    color: "rgb(204, 179, 33)",
    marginTop: 8,
    fontWeight:"bold"
  },
});

export default CoinDisplay;
