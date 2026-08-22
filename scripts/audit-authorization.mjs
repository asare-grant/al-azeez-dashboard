// scripts/audit-authorization.mjs

import fs from "node:fs";
import path from "node:path";

/* ========================================================================== */
/* CONFIG                                                                     */
/* ========================================================================== */

const ROOT =
  process.cwd();

const SOURCE_DIRS = [
  path.join(
    ROOT,
    "src",
  ),
];

const INCLUDED_EXTENSIONS =
  new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
  ]);

const EXCLUDED_DIRECTORIES =
  new Set([
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "coverage",
    "generated",

    /*
     * Never audit generated/local audit tooling.
     */
    "audit-reports",
  ]);

/* ========================================================================== */
/* FILE CLASSIFICATION                                                        */
/* ========================================================================== */

function classifyFileKind(
  relativePath,
) {
  const normalized =
    relativePath
      .replaceAll(
        "\\",
        "/",
      )
      .toLowerCase();

  if (
    normalized.includes(
      "/app/api/",
    )
  ) {
    return "API_ROUTE";
  }

  if (
    normalized.includes(
      "/actions",
    ) ||
    normalized.endsWith(
      "/actions.ts",
    ) ||
    normalized.endsWith(
      "/actions.tsx",
    )
  ) {
    return "SERVER_ACTION";
  }

  if (
    normalized.includes(
      "/lib/",
    )
  ) {
    return "SERVICE";
  }

  if (
    normalized.includes(
      "/app/",
    ) &&
    normalized.endsWith(
      "/layout.tsx",
    )
  ) {
    return "LAYOUT";
  }

  if (
    normalized.includes(
      "/app/",
    ) &&
    (
      normalized.endsWith(
        "/page.tsx",
      ) ||
      normalized.endsWith(
        "/page.ts",
      )
    )
  ) {
    return "PAGE";
  }

  if (
    normalized.includes(
      "/components/",
    )
  ) {
    return "COMPONENT";
  }

  return "OTHER";
}

/* ========================================================================== */
/* AUDIT PATTERNS                                                             */
/* ========================================================================== */

const patterns = [
  /* ------------------------------------------------------------------------ */
  /* CRITICAL ROUTING                                                         */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "ROLE_DERIVED_ROUTE",

    severity:
      "CRITICAL",

    migrationClass:
      "REDIRECT",

    description:
      "A route/path appears to be constructed directly from a role.",

    recommendation:
      "Route through /dashboard or getRoleDashboardPath() instead of constructing /${role}.",

    regex:
      /`\/\$\{\s*(?:role|roleValue|roleKey|user\.role|profile\.role)\s*\}`/g,
  },

  /* ------------------------------------------------------------------------ */
  /* DIRECT LEGACY AUTHORIZATION                                              */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "DIRECT_ADMIN_CHECK",

    severity:
      "HIGH",

    migrationClass:
      "LEGACY_ROLE_GUARD",

    description:
      "Direct Admin role comparison detected.",

    recommendation:
      "Classify as ownership or authorization. Workspace/action authorization should move to RBAC.",

    regex:
      /\b(?:role|roleValue|roleKey|legacyRole|user\.role|profile\.role)\s*(?:===|!==|==|!=)\s*["'`]admin["'`]/g,
  },

  {
    category:
      "DIRECT_SUPER_ADMIN_CHECK",

    severity:
      "MEDIUM",

    migrationClass:
      "LEGACY_ROLE_GUARD",

    description:
      "Direct Super Admin role comparison detected.",

    recommendation:
      "Keep only when trust hierarchy specifically requires Super Admin; otherwise prefer permission/trust policy.",

    regex:
      /\b(?:role|roleValue|roleKey|legacyRole|user\.role|profile\.role)\s*(?:===|!==|==|!=)\s*["'`]super_admin["'`]/g,
  },

  {
    category:
      "DIRECT_TEACHER_CHECK",

    severity:
      "REVIEW",

    migrationClass:
      "ROLE_SCOPE_REVIEW",

    description:
      "Teacher role comparison detected.",

    recommendation:
      "Likely valid for teacher ownership/scope. Migrate only if it controls workspace/action authorization.",

    regex:
      /\b(?:role|roleValue|roleKey|legacyRole|user\.role|profile\.role)\s*(?:===|!==|==|!=)\s*["'`]teacher["'`]/g,
  },

  {
    category:
      "DIRECT_STUDENT_CHECK",

    severity:
      "REVIEW",

    migrationClass:
      "ROLE_SCOPE_REVIEW",

    description:
      "Student role comparison detected.",

    recommendation:
      "Usually identity/ownership. Preserve unless it is being used as general authorization.",

    regex:
      /\b(?:role|roleValue|roleKey|legacyRole|user\.role|profile\.role)\s*(?:===|!==|==|!=)\s*["'`]student["'`]/g,
  },

  {
    category:
      "DIRECT_PARENT_CHECK",

    severity:
      "REVIEW",

    migrationClass:
      "ROLE_SCOPE_REVIEW",

    description:
      "Parent role comparison detected.",

    recommendation:
      "Usually identity/ownership. Preserve unless it is being used as general authorization.",

    regex:
      /\b(?:role|roleValue|roleKey|legacyRole|user\.role|profile\.role)\s*(?:===|!==|==|!=)\s*["'`]parent["'`]/g,
  },

  {
    category:
      "DIRECT_ACCOUNT_CHECK",

    severity:
      "REVIEW",

    migrationClass:
      "ROLE_SCOPE_REVIEW",

    description:
      "Account persona role comparison detected.",

    recommendation:
      "Inspect whether this is finance identity or workspace authorization.",

    regex:
      /\b(?:role|roleValue|roleKey|legacyRole|user\.role|profile\.role)\s*(?:===|!==|==|!=)\s*["'`]account["'`]/g,
  },

  /* ------------------------------------------------------------------------ */
  /* ROLE ARRAYS                                                              */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "HARDCODED_ROLE_ARRAY",

    severity:
      "MEDIUM",

    migrationClass:
      "LEGACY_ROLE_GUARD",

    description:
      "Hard-coded application role array detected.",

    recommendation:
      "For navigation/workspace authorization prefer permission-aware policies.",

    regex:
      /\[[^\]\n]*(?:["'`]admin["'`]|["'`]teacher["'`]|["'`]student["'`]|["'`]parent["'`]|["'`]account["'`]|["'`]super_admin["'`])[^\]\n]*\]/g,
  },

  /* ------------------------------------------------------------------------ */
  /* CLERK CLAIM SOURCES                                                      */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "SESSION_METADATA_ROLE_SOURCE",

    severity:
      "HIGH",

    migrationClass:
      "CLAIMS",

    description:
      "Direct sessionClaims.metadata usage detected.",

    recommendation:
      "Prefer centralized identity/profile resolution. If role data is required, normalize consistently.",

    regex:
      /sessionClaims\s*\??\.\s*metadata/g,
  },

  {
    category:
      "SESSION_PUBLIC_METADATA_SOURCE",

    severity:
      "MEDIUM",

    migrationClass:
      "CLAIMS",

    description:
      "Direct sessionClaims.publicMetadata usage detected.",

    recommendation:
      "Acceptable for identity extraction, but authorization should preferably use Access Context/Actor.",

    regex:
      /sessionClaims\s*\??\.\s*publicMetadata/g,
  },

  {
    category:
      "PUBLIC_METADATA_ROLE_SOURCE",

    severity:
      "MEDIUM",

    migrationClass:
      "CLAIMS",

    description:
      "Direct publicMetadata.role usage detected.",

    recommendation:
      "Use centralized role/profile normalization unless this is identity synchronization.",

    regex:
      /publicMetadata\s*\.\s*role/g,
  },

  /* ------------------------------------------------------------------------ */
  /* TRANSITIONAL ROUTE AUTHORIZATION                                         */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "REQUIRE_ROUTE_ROLE",

    severity:
      "MEDIUM",

    migrationClass:
      "LEGACY_ROUTE_GUARD",

    description:
      "Legacy requireRouteRole() authorization detected.",

    recommendation:
      "Migrate to requireRouteAccess() with RBAC permission support.",

    regex:
      /\brequireRouteRole\s*\(/g,
  },

  {
    category:
      "ROUTE_ACCESS_MAP",

    severity:
      "MEDIUM",

    migrationClass:
      "LEGACY_ROUTE_GUARD",

    description:
      "routeAccessMap dependency detected.",

    recommendation:
      "Transitional only. Eventually replace with centralized permission-aware route authorization.",

    regex:
      /\brouteAccessMap\b/g,
  },

  /* ------------------------------------------------------------------------ */
  /* LEGACY ROLE                                                              */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "LEGACY_ROLE_REFERENCE",

    severity:
      "REVIEW",

    migrationClass:
      "LEGACY_ROLE",

    description:
      "legacyRole reference detected.",

    recommendation:
      "Keep only for migration compatibility or identity bridging. Avoid as permanent authorization.",

    regex:
      /\blegacyRole\b/g,
  },

  /* ------------------------------------------------------------------------ */
  /* MUTATION SIGNALS                                                         */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "MUTATION_DELETE",

    severity:
      "HIGH",

    migrationClass:
      "MUTATION_RISK",

    description:
      "DELETE-style mutation detected.",

    recommendation:
      "Verify exact server-side permission enforcement.",

    regex:
      /\b(?:delete|deleteMany|remove|revoke|archive)\s*\(/gi,
  },

  {
    category:
      "MUTATION_CREATE",

    severity:
      "REVIEW",

    migrationClass:
      "MUTATION_RISK",

    description:
      "Create-style mutation detected.",

    recommendation:
      "Verify exact create permission is enforced server-side.",

    regex:
      /\b(?:create|createMany)\s*\(/gi,
  },

  {
    category:
      "MUTATION_UPDATE",

    severity:
      "REVIEW",

    migrationClass:
      "MUTATION_RISK",

    description:
      "Update-style mutation detected.",

    recommendation:
      "Verify exact update permission is enforced server-side.",

    regex:
      /\b(?:update|updateMany|upsert)\s*\(/gi,
  },

  /* ------------------------------------------------------------------------ */
  /* AUTHENTICATION SIGNALS                                                   */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "DIRECT_AUTH",

    severity:
      "INFO",

    migrationClass:
      "AUTH_ONLY_REVIEW",

    description:
      "Direct Clerk auth() usage.",

    recommendation:
      "Not automatically wrong. Inspect only when it is also acting as authorization.",

    regex:
      /\bawait\s+auth\s*\(/g,
  },

  {
    category:
      "CURRENT_USER",

    severity:
      "INFO",

    migrationClass:
      "AUTH_ONLY_REVIEW",

    description:
      "Direct Clerk currentUser() usage.",

    recommendation:
      "Not automatically wrong. Inspect if authorization depends directly on Clerk role metadata.",

    regex:
      /\bawait\s+currentUser\s*\(/g,
  },

  /* ------------------------------------------------------------------------ */
  /* GOOD RBAC SIGNALS                                                        */
  /* ------------------------------------------------------------------------ */

  {
    category:
      "ACCESS_ACTOR",

    severity:
      "GOOD",

    migrationClass:
      "CENTRALIZED",

    description:
      "Central Access Control actor resolution.",

    recommendation:
      "Good centralized authorization pattern.",

    regex:
      /\bgetCurrentAccessActor\s*\(/g,
  },

  {
    category:
      "ACCESS_CONTEXT",

    severity:
      "GOOD",

    migrationClass:
      "CENTRALIZED",

    description:
      "Effective Access Control context resolution.",

    recommendation:
      "Good centralized authorization pattern.",

    regex:
      /\bgetCurrentAccessContext\s*\(/g,
  },

  {
    category:
      "REQUIRE_ROUTE_ACCESS",

    severity:
      "GOOD",

    migrationClass:
      "CENTRALIZED",

    description:
      "Permission-aware route guard usage.",

    recommendation:
      "Good route authorization pattern.",

    regex:
      /\brequireRouteAccess\s*\(/g,
  },

  {
    category:
      "RBAC_CAN",

    severity:
      "GOOD",

    migrationClass:
      "CENTRALIZED",

    description:
      "Exact Access Control permission check.",

    recommendation:
      "Preferred for action-level authorization.",

    regex:
      /\.can\s*\(\s*["'`][^"'`]+["'`]\s*\)/g,
  },

  {
    category:
      "PERMISSION_PREFIX",

    severity:
      "REVIEW",

    migrationClass:
      "PREFIX_POLICY",

    description:
      "Permission-prefix authorization detected.",

    recommendation:
      "Good for workspace/navigation visibility; sensitive actions should use exact permissions.",

    regex:
      /\.startsWith\s*\(\s*["'`][a-z0-9_.-]+\./gi,
  },
];

/* ========================================================================== */
/* FILE WALK                                                                  */
/* ========================================================================== */

function walkDirectory(
  directory,
) {
  const results =
    [];

  if (
    !fs.existsSync(
      directory,
    )
  ) {
    return results;
  }

  const entries =
    fs.readdirSync(
      directory,
      {
        withFileTypes:
          true,
      },
    );

  for (
    const entry of
    entries
  ) {
    if (
      EXCLUDED_DIRECTORIES.has(
        entry.name,
      )
    ) {
      continue;
    }

    const fullPath =
      path.join(
        directory,
        entry.name,
      );

    if (
      entry.isDirectory()
    ) {
      results.push(
        ...walkDirectory(
          fullPath,
        ),
      );

      continue;
    }

    const extension =
      path.extname(
        entry.name,
      );

    if (
      INCLUDED_EXTENSIONS.has(
        extension,
      )
    ) {
      results.push(
        fullPath,
      );
    }
  }

  return results;
}

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function getLineNumber(
  source,
  index,
) {
  return source
    .slice(
      0,
      index,
    )
    .split(
      "\n",
    )
    .length;
}

function cleanSnippet(
  value,
) {
  return value
    .replace(
      /\s+/g,
      " ",
    )
    .trim()
    .slice(
      0,
      220,
    );
}

/* ========================================================================== */
/* COMMENT-ONLY DETECTION                                                     */
/* ========================================================================== */

function isCommentOnlyLine({
  source,
  index,
}) {
  const lineStart =
    source.lastIndexOf(
      "\n",
      Math.max(
        0,
        index - 1,
      ),
    ) +
    1;

  const lineEndCandidate =
    source.indexOf(
      "\n",
      index,
    );

  const lineEnd =
    lineEndCandidate ===
    -1
      ? source.length
      : lineEndCandidate;

  const line =
    source
      .slice(
        lineStart,
        lineEnd,
      )
      .trim();

  /*
   * Skip ordinary single-line comments and the body
   * lines of block/JSDoc comments.
   */
  if (
    line.startsWith(
      "//",
    ) ||
    line.startsWith(
      "*",
    ) ||
    line.startsWith(
      "/*",
    ) ||
    line.startsWith(
      "*/",
    )
  ) {
    return true;
  }

  return false;
}

function buildContext({
  source,
  lineNumber,
  radius = 4,
}) {
  const sourceLines =
    source.split(
      "\n",
    );

  const start =
    Math.max(
      0,
      lineNumber -
        radius -
        1,
    );

  const end =
    Math.min(
      sourceLines.length,
      lineNumber +
        radius,
    );

  return sourceLines
    .slice(
      start,
      end,
    )
    .map(
      (
        line,
        index,
      ) => {
        const actualLine =
          start +
          index +
          1;

        const marker =
          actualLine ===
          lineNumber
            ? ">"
            : " ";

        return `${marker} ${String(
          actualLine,
        ).padStart(
          5,
          " ",
        )} | ${line}`;
      },
    )
    .join(
      "\n",
    );
}

/* ========================================================================== */
/* MUTATION AUTHORIZATION HEURISTIC                                           */
/* ========================================================================== */

function analyzeMutationRisk({
  source,
  finding,
}) {
  if (
    finding.migrationClass !==
    "MUTATION_RISK"
  ) {
    return finding;
  }

  const lines =
    source.split(
      "\n",
    );

  const start =
    Math.max(
      0,
      finding.line -
        35,
    );

  const end =
    Math.min(
      lines.length,
      finding.line +
        15,
    );

  const nearby =
    lines
      .slice(
        start,
        end,
      )
      .join(
        "\n",
      );

  const hasExactPermission =
    /\.can\s*\(\s*["'`][^"'`]+["'`]\s*\)/.test(
      nearby,
    ) ||
    /\bhasPermission\s*\(/.test(
      nearby,
    ) ||
    /\brequirePermission\s*\(/.test(
      nearby,
    );

  const hasActor =
    /\bgetCurrentAccessActor\s*\(/.test(
      nearby,
    );

  const hasAuthOnly =
    /\bawait\s+auth\s*\(/.test(
      nearby,
    );

  if (
    hasExactPermission
  ) {
    return {
      ...finding,

      severity:
        "GOOD",

      migrationClass:
        "MUTATION_PROTECTED",

      description:
        `${finding.description} Nearby exact RBAC permission enforcement was detected.`,

      recommendation:
        "Review for correctness, but this mutation appears to have explicit authorization.",
    };
  }

  if (
    hasActor
  ) {
    return {
      ...finding,

      severity:
        "MEDIUM",

      description:
        `${finding.description} Access Actor is nearby, but no exact permission was detected by the heuristic.`,

      recommendation:
        "Confirm the mutation checks the correct exact permission before execution.",
    };
  }

  if (
    hasAuthOnly
  ) {
    return {
      ...finding,

      severity:
        "CRITICAL",

      description:
        `${finding.description} Authentication was detected nearby, but no RBAC permission check was found.`,

      recommendation:
        "Add an explicit server-side permission guard before this mutation.",
    };
  }

  return {
    ...finding,

    severity:
      "CRITICAL",

    description:
      `${finding.description} No nearby authorization signal was detected.`,

    recommendation:
      "Inspect immediately and add exact server-side RBAC protection if missing.",
  };
}

/* ========================================================================== */
/* AUDIT                                                                      */
/* ========================================================================== */

const files =
  SOURCE_DIRS.flatMap(
    walkDirectory,
  );

let findings =
  [];

for (
  const file of
  files
) {
  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  const relativeFile =
    path
      .relative(
        ROOT,
        file,
      )
      .replaceAll(
        "\\",
        "/",
      );

  const fileKind =
    classifyFileKind(
      relativeFile,
    );

  for (
    const pattern of
    patterns
  ) {
    const regex =
      new RegExp(
        pattern.regex.source,
        pattern.regex.flags,
      );

    for (
      const match of
      source.matchAll(
        regex,
      )
    ) {
      const index =
        match.index ??
        0;

      /*
 * Do not count examples or retired code that exist only
 * inside comment lines.
 */
if (
  isCommentOnlyLine({
    source,
    index,
  })
) {
  continue;
}

      const lineNumber =
        getLineNumber(
          source,
          index,
        );

      const finding = {
        category:
          pattern.category,

        severity:
          pattern.severity,

        migrationClass:
          pattern.migrationClass,

        description:
          pattern.description,

        recommendation:
          pattern.recommendation,

        file:
          relativeFile,

        fileKind,

        line:
          lineNumber,

        match:
          cleanSnippet(
            match[0],
          ),

        context:
          buildContext({
            source,

            lineNumber,
          }),
      };

      findings.push(
        analyzeMutationRisk({
          source,

          finding,
        }),
      );
    }
  }
}

/* ========================================================================== */
/* DEDUPLICATE                                                                */
/* ========================================================================== */

const seen =
  new Set();

findings =
  findings.filter(
    (
      finding,
    ) => {
      const key =
        [
          finding.file,
          finding.line,
          finding.category,
          finding.match,
        ].join(
          "::",
        );

      if (
        seen.has(
          key,
        )
      ) {
        return false;
      }

      seen.add(
        key,
      );

      return true;
    },
  );

/* ========================================================================== */
/* SORT                                                                       */
/* ========================================================================== */

const severityOrder = {
  CRITICAL:
    0,

  HIGH:
    1,

  MEDIUM:
    2,

  REVIEW:
    3,

  INFO:
    4,

  GOOD:
    5,
};

findings.sort(
  (
    a,
    b,
  ) => {
    const severityDifference =
      (
        severityOrder[
          a.severity
        ] ??
        99
      ) -
      (
        severityOrder[
          b.severity
        ] ??
        99
      );

    if (
      severityDifference !==
      0
    ) {
      return severityDifference;
    }

    const fileDifference =
      a.file.localeCompare(
        b.file,
      );

    if (
      fileDifference !==
      0
    ) {
      return fileDifference;
    }

    return (
      a.line -
      b.line
    );
  },
);

/* ========================================================================== */
/* GROUPING                                                                   */
/* ========================================================================== */

function countBy(
  values,
  selector,
) {
  const map =
    new Map();

  for (
    const value of
    values
  ) {
    const key =
      selector(
        value,
      );

    map.set(
      key,
      (
        map.get(
          key,
        ) ??
        0
      ) +
        1,
    );
  }

  return map;
}

const bySeverity =
  countBy(
    findings,
    (
      finding,
    ) =>
      finding.severity,
  );

const byCategory =
  countBy(
    findings,
    (
      finding,
    ) =>
      finding.category,
  );

const byMigrationClass =
  countBy(
    findings,
    (
      finding,
    ) =>
      finding.migrationClass,
  );

const byFileKind =
  countBy(
    findings,
    (
      finding,
    ) =>
      finding.fileKind,
  );

/* ========================================================================== */
/* SCORE                                                                      */
/* ========================================================================== */

const migrationRiskScore =
  (
    bySeverity.get(
      "CRITICAL",
    ) ??
    0
  ) *
    10 +
  (
    bySeverity.get(
      "HIGH",
    ) ??
    0
  ) *
    5 +
  (
    bySeverity.get(
      "MEDIUM",
    ) ??
    0
  ) *
    2 +
  (
    bySeverity.get(
      "REVIEW",
    ) ??
    0
  );

const migratedSignals =
  bySeverity.get(
    "GOOD",
  ) ??
  0;

/* ========================================================================== */
/* CONSOLE                                                                    */
/* ========================================================================== */

console.log(
  "\n============================================================",
);

console.log(
  " AUTHORIZATION MIGRATION AUDIT",
);

console.log(
  "============================================================\n",
);

console.log(
  `Files scanned:          ${files.length}`,
);

console.log(
  `Total findings:         ${findings.length}`,
);

console.log(
  `Migration risk score:   ${migrationRiskScore}`,
);

console.log(
  `Good RBAC signals:      ${migratedSignals}`,
);

console.log();

/* ========================================================================== */
/* SEVERITY SUMMARY                                                           */
/* ========================================================================== */

console.log(
  "SEVERITY SUMMARY",
);

console.log(
  "------------------------------------------------------------",
);

for (
  const severity of
  [
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "REVIEW",
    "INFO",
    "GOOD",
  ]
) {
  console.log(
    `${severity.padEnd(
      14,
    )} ${
      bySeverity.get(
        severity,
      ) ??
      0
    }`,
  );
}

console.log();

/* ========================================================================== */
/* MIGRATION CLASS SUMMARY                                                    */
/* ========================================================================== */

console.log(
  "MIGRATION CLASS SUMMARY",
);

console.log(
  "------------------------------------------------------------",
);

for (
  const [
    key,
    count,
  ] of
  Array.from(
    byMigrationClass.entries(),
  ).sort(
    (
      a,
      b,
    ) =>
      b[1] -
      a[1],
  )
) {
  console.log(
    `${key.padEnd(
      28,
    )} ${count}`,
  );
}

console.log();

/* ========================================================================== */
/* FILE TYPE SUMMARY                                                          */
/* ========================================================================== */

console.log(
  "FILE TYPE SUMMARY",
);

console.log(
  "------------------------------------------------------------",
);

for (
  const [
    key,
    count,
  ] of
  Array.from(
    byFileKind.entries(),
  ).sort(
    (
      a,
      b,
    ) =>
      b[1] -
      a[1],
  )
) {
  console.log(
    `${key.padEnd(
      20,
    )} ${count}`,
  );
}

/* ========================================================================== */
/* PRIORITY FINDINGS                                                          */
/* ========================================================================== */

console.log(
  "\n============================================================",
);

console.log(
  " PRIORITY MIGRATION FINDINGS",
);

console.log(
  "============================================================",
);

const priorityFindings =
  findings.filter(
    (
      finding,
    ) =>
      finding.severity ===
        "CRITICAL" ||
      finding.severity ===
        "HIGH" ||
      finding.severity ===
        "MEDIUM",
  );

if (
  priorityFindings.length ===
  0
) {
  console.log(
    "\nNo Critical / High / Medium findings.",
  );
} else {
  for (
    const finding of
    priorityFindings
  ) {
    console.log(
      `\n[${finding.severity}] ${finding.category}`,
    );

    console.log(
      `${finding.file}:${finding.line}`,
    );

    console.log(
      `File kind: ${finding.fileKind}`,
    );

    console.log(
      `Migration class: ${finding.migrationClass}`,
    );

    console.log(
      `Match: ${finding.match}`,
    );

    console.log(
      "Context:",
    );

    console.log(
      finding.context,
    );

    console.log(
      `Recommendation: ${finding.recommendation}`,
    );
  }
}

/* ========================================================================== */
/* REVIEW FINDINGS                                                            */
/* ========================================================================== */

console.log(
  "\n============================================================",
);

console.log(
  " REVIEW FINDINGS",
);

console.log(
  "============================================================",
);

const reviewFindings =
  findings.filter(
    (
      finding,
    ) =>
      finding.severity ===
      "REVIEW",
  );

console.log(
  `\n${reviewFindings.length} item(s) require human classification.`,
);

/* ========================================================================== */
/* OUTPUT                                                                     */
/* ========================================================================== */

const outputDirectory =
  path.join(
    ROOT,
    "audit-reports",
  );

fs.mkdirSync(
  outputDirectory,
  {
    recursive:
      true,
  },
);

const timestamp =
  new Date()
    .toISOString()
    .replace(
      /[:.]/g,
      "-",
    );

const baseName =
  `authorization-migration-audit-${timestamp}`;

const jsonPath =
  path.join(
    outputDirectory,
    `${baseName}.json`,
  );

const textPath =
  path.join(
    outputDirectory,
    `${baseName}.txt`,
  );

const markdownPath =
  path.join(
    outputDirectory,
    `${baseName}.md`,
  );

/* ========================================================================== */
/* JSON                                                                       */
/* ========================================================================== */

fs.writeFileSync(
  jsonPath,
  JSON.stringify(
    {
      generatedAt:
        new Date()
          .toISOString(),

      filesScanned:
        files.length,

      totalFindings:
        findings.length,

      migrationRiskScore,

      migratedSignals,

      severitySummary:
        Object.fromEntries(
          bySeverity,
        ),

      categorySummary:
        Object.fromEntries(
          byCategory,
        ),

      migrationClassSummary:
        Object.fromEntries(
          byMigrationClass,
        ),

      fileKindSummary:
        Object.fromEntries(
          byFileKind,
        ),

      findings,
    },
    null,
    2,
  ),
);

/* ========================================================================== */
/* TEXT                                                                       */
/* ========================================================================== */

const textReport = [
  "AUTHORIZATION MIGRATION AUDIT",
  "=============================",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Files scanned: ${files.length}`,
  `Total findings: ${findings.length}`,
  `Migration risk score: ${migrationRiskScore}`,
  `Good RBAC signals: ${migratedSignals}`,
  "",
  "SEVERITY SUMMARY",
  "----------------",
  ...[
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "REVIEW",
    "INFO",
    "GOOD",
  ].map(
    (
      severity,
    ) =>
      `${severity}: ${
        bySeverity.get(
          severity,
        ) ??
        0
      }`,
  ),
  "",
  "MIGRATION CLASS SUMMARY",
  "-----------------------",
  ...Array.from(
    byMigrationClass.entries(),
  ).map(
    (
      [
        key,
        count,
      ],
    ) =>
      `${key}: ${count}`,
  ),
  "",
  "DETAILED FINDINGS",
  "-----------------",
  ...findings.flatMap(
    (
      finding,
    ) => [
      "",
      `[${finding.severity}] ${finding.category}`,
      `${finding.file}:${finding.line}`,
      `File kind: ${finding.fileKind}`,
      `Migration class: ${finding.migrationClass}`,
      `Match: ${finding.match}`,
      "Context:",
      finding.context,
      `Description: ${finding.description}`,
      `Recommendation: ${finding.recommendation}`,
    ],
  ),
].join(
  "\n",
);

fs.writeFileSync(
  textPath,
  textReport,
);

/* ========================================================================== */
/* MARKDOWN                                                                   */
/* ========================================================================== */

const markdownLines = [
  "# Authorization Migration Audit",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Executive Summary",
  "",
  `- Files scanned: **${files.length}**`,
  `- Total findings: **${findings.length}**`,
  `- Migration risk score: **${migrationRiskScore}**`,
  `- Good RBAC signals: **${migratedSignals}**`,
  "",
  "## Severity Summary",
  "",
  "| Severity | Count |",
  "|---|---:|",
  ...[
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "REVIEW",
    "INFO",
    "GOOD",
  ].map(
    (
      severity,
    ) =>
      `| ${severity} | ${
        bySeverity.get(
          severity,
        ) ??
        0
      } |`,
  ),
  "",
  "## Migration Classes",
  "",
  "| Class | Count |",
  "|---|---:|",
  ...Array.from(
    byMigrationClass.entries(),
  )
    .sort(
      (
        a,
        b,
      ) =>
        b[1] -
        a[1],
    )
    .map(
      (
        [
          key,
          count,
        ],
      ) =>
        `| ${key} | ${count} |`,
    ),
  "",
  "## Priority Findings",
  "",
];

for (
  const finding of
  priorityFindings
) {
  markdownLines.push(
    `### ${finding.severity} — ${finding.category}`,
    "",
    `**File:** \`${finding.file}:${finding.line}\``,
    "",
    `**File type:** ${finding.fileKind}`,
    "",
    `**Migration class:** ${finding.migrationClass}`,
    "",
    `**Match:** \`${finding.match.replaceAll(
      "`",
      "\\`",
    )}\``,
    "",
    "```ts",
    finding.context,
    "```",
    "",
    `**Recommendation:** ${finding.recommendation}`,
    "",
  );
}

markdownLines.push(
  "## Review Queue",
  "",
  `There are **${reviewFindings.length}** findings requiring human classification.`,
  "",
);

for (
  const finding of
  reviewFindings
) {
  markdownLines.push(
    `### ${finding.category}`,
    "",
    `\`${finding.file}:${finding.line}\``,
    "",
    "```ts",
    finding.context,
    "```",
    "",
    `Recommendation: ${finding.recommendation}`,
    "",
  );
}

fs.writeFileSync(
  markdownPath,
  markdownLines.join(
    "\n",
  ),
);

/* ========================================================================== */
/* FINAL OUTPUT                                                               */
/* ========================================================================== */

console.log(
  "\n============================================================",
);

console.log(
  " REPORTS WRITTEN",
);

console.log(
  "============================================================",
);

console.log(
  path.relative(
    ROOT,
    textPath,
  ),
);

console.log(
  path.relative(
    ROOT,
    jsonPath,
  ),
);

console.log(
  path.relative(
    ROOT,
    markdownPath,
  ),
);

console.log();