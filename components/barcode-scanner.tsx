import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onScan(data);
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.text, { color: colors.foreground }]}>
          Camera permission required
        </Text>
        <Text style={[styles.subtext, { color: colors.muted }]}>
          We need camera access to scan food barcodes.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.button, { backgroundColor: colors.surface, marginTop: 12 }]}
        >
          <Text style={[styles.buttonText, { color: colors.foreground }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      
      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.scanArea}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.instructionText}>
            {scanned ? "Barcode scanned!" : "Point camera at barcode"}
          </Text>
          {scanned && (
            <TouchableOpacity
              onPress={() => setScanned(false)}
              style={styles.scanAgainButton}
            >
              <Text style={styles.scanAgainText}>Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  header: {
    padding: 16,
    alignItems: "flex-end",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "300",
  },
  scanArea: {
    alignSelf: "center",
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#FFFFFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  footer: {
    padding: 32,
    alignItems: "center",
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scanAgainButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
  },
  scanAgainText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
  },
});
