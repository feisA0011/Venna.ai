const conversations = [
  {
    id: "conv_01",
    summary: "Opening hours for tonight",
    confidence: "High",
    status: "Answered"
  },
  {
    id: "conv_02",
    summary: "Allergen question about shellfish",
    confidence: "Low",
    status: "Escalated"
  }
];

export default function ConversationsPage() {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Conversations</h3>
      <div className="rounded-2xl border border-neutral-200">
        <div className="grid grid-cols-4 gap-4 border-b border-neutral-200 px-4 py-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <span>ID</span>
          <span>Summary</span>
          <span>Confidence</span>
          <span>Status</span>
        </div>
        {conversations.map((conv) => (
          <div key={conv.id} className="grid grid-cols-4 gap-4 px-4 py-3 text-sm">
            <span>{conv.id}</span>
            <span>{conv.summary}</span>
            <span>{conv.confidence}</span>
            <span>{conv.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
