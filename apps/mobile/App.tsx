import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

type EscalationThreadMessage = {
  id: string;
  role: "guest" | "staff";
  message: string;
  createdAt: number;
  verifiedAnswer?: boolean;
};

type Escalation = {
  id: string;
  reason: string;
  userMessage: string;
  createdAt: number;
  status: string;
  thread: EscalationThreadMessage[];
};

type Session = {
  baseUrl: string;
  venueId: string;
  userId: string;
};

const styles = {
  container: { flex: 1, backgroundColor: "#fff" },
  body: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" as const, color: "#111" },
  card: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 12,
    padding: 12,
    gap: 8
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: "#111"
  },
  button: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#111"
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff"
  }
};

export default function App() {
  const [draftSession, setDraftSession] = useState<Session>({
    baseUrl: "http://localhost:3000",
    venueId: "demo-venue",
    userId: "staff_demo"
  });
  const [session, setSession] = useState<Session | null>(null);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedEscalation = useMemo(
    () => escalations.find((item) => item.id === selectedId) ?? null,
    [escalations, selectedId]
  );

  const request = useCallback(
    async (path: string, init?: RequestInit) => {
      if (!session) {
        throw new Error("Not logged in");
      }
      const response = await fetch(`${session.baseUrl}${path}`, {
        ...init,
        headers: {
          "content-type": "application/json",
          "x-venna-user-id": session.userId,
          ...(init?.headers ?? {})
        }
      });
      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        const message = typeof payload.error === "string" ? payload.error : "Request failed";
        throw new Error(message);
      }
      return payload;
    },
    [session]
  );

  const loadEscalations = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const payload = await request(
        `/api/dashboard/escalations?venueId=${encodeURIComponent(session.venueId)}&status=open`
      );
      const nextEscalations = Array.isArray(payload.escalations)
        ? (payload.escalations as Escalation[])
        : [];
      setEscalations(nextEscalations);
      setSelectedId((current) => {
        if (nextEscalations.length === 0) {
          return null;
        }
        if (current && nextEscalations.some((item) => item.id === current)) {
          return current;
        }
        return nextEscalations[0].id;
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to fetch escalations");
    } finally {
      setLoading(false);
    }
  }, [request, session]);


  useEffect(() => {
    if (session) {
      loadEscalations();
    }
  }, [loadEscalations, session]);

  const sendReply = useCallback(
    async ({ resolve, verifiedAnswer }: { resolve: boolean; verifiedAnswer: boolean }) => {
      if (!selectedEscalation || !reply.trim()) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        await request(`/api/dashboard/escalations/${selectedEscalation.id}/reply`, {
          method: "POST",
          body: JSON.stringify({
            venueId: session?.venueId,
            message: reply.trim(),
            resolve,
            verifiedAnswer
          })
        });
        setReply("");
        await loadEscalations();
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Unable to reply");
      } finally {
        setLoading(false);
      }
    },
    [loadEscalations, reply, request, selectedEscalation, session?.venueId]
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>Venna Staff Login</Text>
          <View style={styles.card}>
            <Text>Backend URL</Text>
            <TextInput
              autoCapitalize="none"
              value={draftSession.baseUrl}
              onChangeText={(value) => setDraftSession((s) => ({ ...s, baseUrl: value }))}
              style={styles.input}
              placeholder="http://localhost:3000"
            />
            <Text>Venue ID</Text>
            <TextInput
              autoCapitalize="none"
              value={draftSession.venueId}
              onChangeText={(value) => setDraftSession((s) => ({ ...s, venueId: value }))}
              style={styles.input}
              placeholder="demo-venue"
            />
            <Text>User ID (dev token)</Text>
            <TextInput
              autoCapitalize="none"
              value={draftSession.userId}
              onChangeText={(value) => setDraftSession((s) => ({ ...s, userId: value }))}
              style={styles.input}
              placeholder="staff_demo"
            />
            <Pressable
              onPress={async () => {
                setSession(draftSession);
              }}
              style={styles.button}
            >
              <Text style={{ color: "#fff", textAlign: "center", fontWeight: "600" }}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Open Escalations</Text>
        <View style={styles.card}>
          <Text>Venue: {session.venueId}</Text>
          <Text>User: {session.userId}</Text>
          <Pressable onPress={loadEscalations} style={styles.buttonSecondary}>
            <Text style={{ textAlign: "center", fontWeight: "600" }}>Refresh</Text>
          </Pressable>
        </View>

        {loading ? <ActivityIndicator color="#111" /> : null}
        {error ? <Text style={{ color: "#7f1d1d" }}>{error}</Text> : null}

        {escalations.map((item) => (
          <Pressable key={item.id} onPress={() => setSelectedId(item.id)} style={styles.card}>
            <Text style={{ fontSize: 12, color: "#525252" }}>{item.id}</Text>
            <Text style={{ fontWeight: "600", color: "#111" }}>{item.reason}</Text>
            <Text numberOfLines={2} style={{ color: "#262626" }}>
              {item.userMessage}
            </Text>
            {selectedId === item.id ? <Text style={{ color: "#111" }}>Selected</Text> : null}
          </Pressable>
        ))}

        {selectedEscalation ? (
          <View style={styles.card}>
            <Text style={{ fontWeight: "700", color: "#111" }}>Escalation thread</Text>
            {selectedEscalation.thread.map((message) => (
              <View key={message.id} style={{ borderWidth: 1, borderColor: "#e5e5e5", borderRadius: 8, padding: 8 }}>
                <Text style={{ fontSize: 12, color: "#525252" }}>
                  {message.role === "guest" ? "Guest" : "Staff"}
                  {message.verifiedAnswer ? " • Verified Answer" : ""}
                </Text>
                <Text style={{ color: "#111", marginTop: 2 }}>{message.message}</Text>
              </View>
            ))}

            <TextInput
              value={reply}
              onChangeText={setReply}
              style={[styles.input, { minHeight: 80, textAlignVertical: "top" as const }]}
              multiline
              placeholder="Write a quick reply"
            />

            <Pressable onPress={() => sendReply({ resolve: false, verifiedAnswer: false })} style={styles.buttonSecondary}>
              <Text style={{ textAlign: "center", fontWeight: "600" }}>Reply</Text>
            </Pressable>
            <Pressable onPress={() => sendReply({ resolve: true, verifiedAnswer: false })} style={styles.buttonSecondary}>
              <Text style={{ textAlign: "center", fontWeight: "600" }}>Reply & Resolve</Text>
            </Pressable>
            <Pressable onPress={() => sendReply({ resolve: true, verifiedAnswer: true })} style={styles.button}>
              <Text style={{ textAlign: "center", fontWeight: "600", color: "#fff" }}>
                Reply as Verified Answer
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={{ color: "#525252" }}>No escalation selected.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
