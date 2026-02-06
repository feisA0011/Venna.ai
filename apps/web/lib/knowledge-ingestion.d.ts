export type DocumentStatus = "pending" | "approved" | "rejected";

export type IngestionJob = {
  id: string;
  venueId: string;
  url: string;
  status: string;
  logs: string[];
  createdAt: number;
};

export type KnowledgeDocument = {
  documentId: string;
  venueId: string;
  sourceUrl: string;
  content: string;
  extractedAt: number;
  hash: string;
  status: DocumentStatus;
};

export function runIngestion(input: { venueId: string; url: string }): Promise<IngestionJob>;
export function listDocuments(input: {
  venueId: string;
  status?: DocumentStatus;
}): KnowledgeDocument[];
export function reviewDocument(input: {
  venueId: string;
  documentId: string;
  status: "approved" | "rejected";
}): KnowledgeDocument;
export function getApprovedDocumentsForAnswering(venueId: string): KnowledgeDocument[];
export function __resetKnowledgeStateForTests(): void;
