const sources = [
  {
    id: "doc_01",
    name: "Menu PDF",
    status: "Indexed"
  },
  {
    id: "doc_02",
    name: "Website hours",
    status: "Indexed"
  }
];

export default function KnowledgePage() {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Knowledge Sources</h3>
      <div className="rounded-2xl border border-neutral-200">
        <div className="grid grid-cols-3 gap-4 border-b border-neutral-200 px-4 py-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
          <span>ID</span>
          <span>Name</span>
          <span>Status</span>
        </div>
        {sources.map((source) => (
          <div key={source.id} className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
            <span>{source.id}</span>
            <span>{source.name}</span>
            <span>{source.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
