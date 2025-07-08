// This file defines the TypeScript types for our application data.

// Defines the structure for the count of each heading level.
export interface HeadingsCount {
  h1: number;
  h2: number;
  h3: number;
  h4: number;
  h5: number;
  h6: number;
  // We can also use an index signature for more flexibility:
  // [key: string]: number;
}

// Represents the status of the analysis process for a URL.
export type AnalysisStatus = 'queued' | 'running' | 'done' | 'error';

// This is the main type for a single analysis result record.
// It corresponds to the `analysis_results` table in the database.
export interface AnalysisResult {
  id: number;
  url: string;
  status: AnalysisStatus;
  htmlVersion?: string;
  pageTitle?: string;
  headingsCountJson?: HeadingsCount;
  internalLinksCount?: number;
  externalLinksCount?: number;
  inaccessibleLinksCount?: number;
  hasLoginForm?: boolean;
  createdAt: string; // Timestamps are typically strings in ISO format
  updatedAt: string;
}
