// src/lib/academic-engine/server/index.ts

export {
  adaptDatabaseResult,
  adaptDatabaseResults,
} from "./result-adapter";

export type {
  AcademicResultDatabaseRow,
} from "./result-adapter";

export {
  loadClassTermEngineData,
} from "./data-loader";

export {
  generateClassTermReportPreview,
  generateCompleteClassTermReport,
} from "./report-service";

export {
  AcademicEngineLoaderError,
  getAcademicEngineLoaderErrorMessage,
} from "./errors";

export type {
  AcademicEngineLoaderIssue,
  AcademicEngineLoaderIssueCode,
  GenerateClassTermReportInput,
  GenerateClassTermReportResult,
  LoadedAcademicConfiguration,
  LoadedClassTermEngineData,
  LoadClassTermEngineInput,
  LoadClassTermEngineResult,
} from "./types";