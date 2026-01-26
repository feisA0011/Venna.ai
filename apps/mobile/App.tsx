import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";

const mockEscalations = [
  {
    id: "esc_01",
    reason: "Low confidence allergen request",
    conversation: "Does the lobster bisque contain dairy?",
    status: "open"
  },
  {
    id: "esc_02",
    reason: "Reservation modification",
    conversation: "Can we move our booking to 8pm?",
    status: "open"
  }
];

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => mockEscalations.find((item) => item.id === selectedId) ?? null,
    [selectedId]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Escalations</Text>
        {mockEscalations.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => setSelectedId(item.id)}
            style={{
              borderWidth: 1,
              borderColor: "#e5e5e5",
              padding: 12,
              borderRadius: 12
            }}
          >
            <Text style={{ fontSize: 12, color: "#666" }}>{item.id}</Text>
            <Text style={{ fontSize: 14, fontWeight: "500" }}>{item.reason}</Text>
          </TouchableOpacity>
        ))}
        {selected && (
          <View style={{ borderWidth: 1, borderColor: "#111", padding: 12, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, color: "#666" }}>Conversation</Text>
            <Text style={{ marginTop: 4 }}>{selected.conversation}</Text>
            <TouchableOpacity
              style={{
                marginTop: 12,
                backgroundColor: "#111",
                paddingVertical: 10,
                borderRadius: 10
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>Reply / Resolve</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
