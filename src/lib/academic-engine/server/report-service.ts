// src/lib/academic-engine/server/report-service.ts

import "server-only";

import {
  DEFAULT_ACADEMIC_ENGINE_OPTIONS,
} from "../constants";

import {
  buildClassTermReport,
  calculateCompleteClassTermReport,
} from "../class-term-report";

import type {
  AcademicEngineOptions,
} from "../types";

import {
  loadClassTermEngineData,
} from "./data-loader";

import type {
  GenerateClassTermReportInput,
  GenerateClassTermReportResult,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                             OPTION MERGING                                 */
/* -------------------------------------------------------------------------- */

function resolveEngineOptions(
  options?:
    Partial<AcademicEngineOptions>,
): AcademicEngineOptions {
  return {
    ...DEFAULT_ACADEMIC_ENGINE_OPTIONS,
    ...options,
  };
}

/* -------------------------------------------------------------------------- */
/*                        PREVIEW CLASS REPORT                                */
/* -------------------------------------------------------------------------- */

/**
 * Generates a report even when some students or subjects
 * are incomplete.
 *
 * Use this for the administrator preview screen.
 */
export async function generateClassTermReportPreview(
  input:
    GenerateClassTermReportInput,
): Promise<GenerateClassTermReportResult> {
  const loaded =
    await loadClassTermEngineData({
      classId:
        input.classId,

      academicYear:
        input.academicYear,

      termId:
        input.termId,
    });

  if (!loaded.success) {
    return {
      success: false,

      code:
        loaded.code,

      message:
        loaded.message,

      errors:
        loaded.errors,
    };
  }

  const options =
    resolveEngineOptions(
      input.options,
    );

  const report =
    buildClassTermReport(
      loaded.data.input,
      options,
    );

  return {
    success: true,

    report,

    loader:
      loaded.data,

    warnings: [
      ...loaded.warnings,
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*                       OFFICIAL CLASS REPORT                                */
/* -------------------------------------------------------------------------- */

/**
 * Generates an official report only when the class
 * calculation is valid.
 */
export async function generateCompleteClassTermReport(
  input:
    GenerateClassTermReportInput,
): Promise<GenerateClassTermReportResult> {
  const loaded =
    await loadClassTermEngineData({
      classId:
        input.classId,

      academicYear:
        input.academicYear,

      termId:
        input.termId,
    });

  if (!loaded.success) {
    return {
      success: false,

      code:
        loaded.code,

      message:
        loaded.message,

      errors:
        loaded.errors,
    };
  }

  const options =
    resolveEngineOptions(
      input.options,
    );

  const calculated =
    calculateCompleteClassTermReport(
      loaded.data.input,
      options,
    );

  if (!calculated.success) {
    return {
      success: false,

      code:
        "CLASS_REPORT_BLOCKED",

      message:
        calculated.message,

      loader:
        loaded.data,

      errors:
        calculated.errors,
    };
  }

  return {
    success: true,

    report:
      calculated.data,

    loader:
      loaded.data,

    warnings: [
      ...loaded.warnings,
    ],
  };
}