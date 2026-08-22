// scripts/audit-permission-integrity.ts

import fs from "node:fs";
import path from "node:path";

import {
  permissionCatalogue,
} from "../src/lib/access-control/permission-catalogue";

import {
  systemRoles,
} from "../src/lib/access-control/system-roles";

/* ========================================================================== */
/* CONFIG                                                                     */
/* ========================================================================== */

const ROOT =
  process.cwd();

const SRC =
  path.join(
    ROOT,
    "src",
  );

const EXTENSIONS =
  new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
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
  ]);

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

type PermissionReference = {
  permission:
    string;

  file:
    string;

  line:
    number;

  source:
    string;
};

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

function normalize(
  value:
    string,
) {
  return value
    .trim()
    .toLowerCase();
}

function walk(
  directory:
    string,
): string[] {
  if (
    !fs.existsSync(
      directory,
    )
  ) {
    return [];
  }

  const results:
    string[] =
    [];

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
        ...walk(
          fullPath,
        ),
      );

      continue;
    }

    if (
      EXTENSIONS.has(
        path.extname(
          entry.name,
        ),
      )
    ) {
      results.push(
        fullPath,
      );
    }
  }

  return results;
}

function getLineNumber(
  source:
    string,
  index:
    number,
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

function relative(
  file:
    string,
) {
  return path
    .relative(
      ROOT,
      file,
    )
    .replaceAll(
      "\\",
      "/",
    );
}

/* ========================================================================== */
/* CATALOGUE                                                                  */
/* ========================================================================== */

const catalogueKeys =
  permissionCatalogue.map(
    (
      permission,
    ) =>
      normalize(
        permission.key,
      ),
  );

const catalogueKeySet =
  new Set(
    catalogueKeys,
  );

/* ========================================================================== */
/* CATALOGUE VALIDATION                                                       */
/* ========================================================================== */

const duplicateCatalogueKeys =
  catalogueKeys.filter(
    (
      key,
      index,
    ) =>
      catalogueKeys.indexOf(
        key,
      ) !==
      index,
  );

if (
  duplicateCatalogueKeys.length >
  0
) {
  console.error(
    "\nDuplicate permission catalogue keys detected:",
  );

  for (
    const key of
    Array.from(
      new Set(
        duplicateCatalogueKeys,
      ),
    )
  ) {
    console.error(
      `  - ${key}`,
    );
  }

  process.exit(
    1,
  );
}

/* ========================================================================== */
/* SYSTEM ROLE REFERENCES                                                     */
/* ========================================================================== */

const invalidSystemRoleReferences:
  {
    role:
      string;

    permission:
      string;
  }[] =
  [];

for (
  const role of
  systemRoles
) {
  for (
    const rawPermission of
    role.permissions
  ) {
    const permission =
      normalize(
        rawPermission,
      );

    if (
      !catalogueKeySet.has(
        permission,
      )
    ) {
      invalidSystemRoleReferences.push({
        role:
          role.key,

        permission,
      });
    }
  }
}

/* ========================================================================== */
/* APPLICATION PERMISSION REFERENCES                                          */
/* ========================================================================== */

const files =
  walk(
    SRC,
  );

const references:
  PermissionReference[] =
  [];

/*
 * Exact permission reference patterns.
 *
 * These deliberately target authorization APIs
 * rather than arbitrary strings such as UI text.
 */
const patterns:
  {
    source:
      string;

    regex:
      RegExp;
  }[] =
  [
    {
      source:
        ".can()",

      regex:
        /\.can\s*\(\s*["'`]([a-z0-9_.-]+)["'`]\s*\)/gi,
    },

    {
      source:
        "hasPermission()",

      regex:
        /\bhasPermission\s*\(\s*["'`]([a-z0-9_.-]+)["'`]\s*\)/gi,
    },

    {
      source:
        "hasAnyPermission()/hasAllPermissions()",

      regex:
        /\b(?:hasAnyPermission|hasAllPermissions)\s*\(\s*\[\s*([\s\S]*?)\]\s*\)/gi,
    },

    {
      source:
        "anyPermissions/allPermissions",

      regex:
        /\b(?:anyPermissions|allPermissions)\s*:\s*\[\s*([\s\S]*?)\]/gi,
    },

    {
      source:
        "permissions option",

      regex:
        /\bpermissions\s*:\s*\[\s*([\s\S]*?)\]/gi,
    },
  ];

/* ========================================================================== */
/* ARRAY STRING EXTRACTION                                                    */
/* ========================================================================== */

function extractStringsFromArrayBody(
  value:
    string,
) {
  const results:
    string[] =
    [];

  const stringRegex =
    /["'`]([a-z0-9_.-]+)["'`]/gi;

  for (
    const match of
    value.matchAll(
      stringRegex,
    )
  ) {
    if (
      match[1]
    ) {
      results.push(
        normalize(
          match[1],
        ),
      );
    }
  }

  return results;
}

/* ========================================================================== */
/* SCAN                                                                       */
/* ========================================================================== */

for (
  const file of
  files
) {
  const source =
    fs.readFileSync(
      file,
      "utf8",
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

      if (
        pattern.source ===
          ".can()" ||
        pattern.source ===
          "hasPermission()"
      ) {
        const permission =
          normalize(
            match[1] ??
            "",
          );

        if (
          permission
        ) {
          references.push({
            permission,

            file:
              relative(
                file,
              ),

            line:
              getLineNumber(
                source,
                index,
              ),

            source:
              pattern.source,
          });
        }

        continue;
      }

      const body =
        match[1] ??
        "";

      const permissions =
        extractStringsFromArrayBody(
          body,
        );

      for (
        const permission of
        permissions
      ) {
        references.push({
          permission,

          file:
            relative(
              file,
            ),

          line:
            getLineNumber(
              source,
              index,
            ),

          source:
            pattern.source,
        });
      }
    }
  }
}

/* ========================================================================== */
/* FILTER TO LIKELY PERMISSIONS                                               */
/* ========================================================================== */

/*
 * Prevent unrelated arrays such as:
 *
 * ["admin", "teacher"]
 *
 * from being treated as permission keys.
 *
 * Permission keys in your catalogue are namespaced
 * and therefore contain a dot.
 */
const permissionReferences =
  references.filter(
    (
      reference,
    ) =>
      reference.permission.includes(
        ".",
      ),
  );

/* ========================================================================== */
/* UNKNOWN REFERENCES                                                         */
/* ========================================================================== */

const unknownReferences =
  permissionReferences.filter(
    (
      reference,
    ) =>
      !catalogueKeySet.has(
        reference.permission,
      ),
  );

/* ========================================================================== */
/* UNUSED CATALOGUE PERMISSIONS                                               */
/* ========================================================================== */

const referencedKeys =
  new Set(
    permissionReferences.map(
      (
        reference,
      ) =>
        reference.permission,
    ),
  );

for (
  const role of
  systemRoles
) {
  for (
    const permission of
    role.permissions
  ) {
    referencedKeys.add(
      normalize(
        permission,
      ),
    );
  }
}

const unusedCatalogueKeys =
  catalogueKeys.filter(
    (
      permission,
    ) =>
      !referencedKeys.has(
        permission,
      ),
  );

/* ========================================================================== */
/* REPORT                                                                     */
/* ========================================================================== */

console.log();
console.log(
  "==========================================================================",
);

console.log(
  " PERMISSION CATALOGUE INTEGRITY AUDIT",
);

console.log(
  "==========================================================================",
);

console.log();

console.log(
  `Catalogue permissions: ${catalogueKeys.length}`,
);

console.log(
  `Source files scanned: ${files.length}`,
);

console.log(
  `Permission references found: ${permissionReferences.length}`,
);

console.log();

console.log(
  "SYSTEM ROLE VALIDATION",
);

console.log(
  "--------------------------------------------------------------------------",
);

if (
  invalidSystemRoleReferences.length ===
  0
) {
  console.log(
    "PASS — every predefined role permission exists in the catalogue.",
  );
} else {
  console.log(
    `FAIL — ${invalidSystemRoleReferences.length} invalid role permission reference(s).`,
  );

  for (
    const issue of
    invalidSystemRoleReferences
  ) {
    console.log(
      `  ${issue.role}: ${issue.permission}`,
    );
  }
}

console.log();

console.log(
  "APPLICATION REFERENCES",
);

console.log(
  "--------------------------------------------------------------------------",
);

if (
  unknownReferences.length ===
  0
) {
  console.log(
    "PASS — every detected application permission exists in the catalogue.",
  );
} else {
  console.log(
    `FAIL — ${unknownReferences.length} unknown permission reference(s).`,
  );

  for (
    const reference of
    unknownReferences
  ) {
    console.log();
    console.log(
      `  ${reference.permission}`,
    );

    console.log(
      `    ${reference.file}:${reference.line}`,
    );

    console.log(
      `    via ${reference.source}`,
    );
  }
}

console.log();

console.log(
  "UNUSED CATALOGUE PERMISSIONS",
);

console.log(
  "--------------------------------------------------------------------------",
);

if (
  unusedCatalogueKeys.length ===
  0
) {
  console.log(
    "Every catalogue permission is currently referenced.",
  );
} else {
  console.log(
    `${unusedCatalogueKeys.length} permission(s) are not directly detected in application authorization code.`,
  );

  for (
    const permission of
    unusedCatalogueKeys
  ) {
    console.log(
      `  ? ${permission}`,
    );
  }

  console.log();
  console.log(
    "Unused does NOT automatically mean incorrect; some permissions may be reserved for upcoming features or resolved dynamically.",
  );
}

/* ========================================================================== */
/* RESULT                                                                     */
/* ========================================================================== */

const failed =
  invalidSystemRoleReferences.length >
    0 ||
  unknownReferences.length >
    0;

console.log();

if (
  failed
) {
  console.log(
    "INTEGRITY AUDIT FAILED.",
  );

  console.log();

  process.exitCode =
    1;
} else {
  console.log(
    "INTEGRITY AUDIT PASSED.",
  );

  console.log();
}