import type {
  UserAccountStatus,
} from "@prisma/client";

import {
  Ban,
  CheckCircle2,
  Clock3,
  PauseCircle,
} from "lucide-react";

const config = {
  ACTIVE: {
    label:
      "Active",

    icon:
      CheckCircle2,

    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  PENDING: {
    label:
      "Pending",

    icon:
      Clock3,

    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  SUSPENDED: {
    label:
      "Suspended",

    icon:
      PauseCircle,

    className:
      "border-orange-200 bg-orange-50 text-orange-700",
  },

  DISABLED: {
    label:
      "Disabled",

    icon:
      Ban,

    className:
      "border-red-200 bg-red-50 text-red-700",
  },
} satisfies Record<
  UserAccountStatus,
  {
    label:
      string;

    icon:
      typeof CheckCircle2;

    className:
      string;
  }
>;

export default function UserStatusBadge({
  status,
}: {
  status:
    UserAccountStatus;
}) {
  const item =
    config[
      status
    ];

  const Icon =
    item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.11em] ${item.className}`}
    >
      <Icon className="h-3 w-3" />

      {
        item.label
      }
    </span>
  );
}