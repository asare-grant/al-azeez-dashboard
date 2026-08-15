import {
  KeyRound,
} from "lucide-react";

type RoleItem = {
  id:
    number;

  key:
    string;

  name:
    string;

  type:
    "SYSTEM" |
    "CUSTOM";
};

export default function UserRoleBadges({
  roles,
}: {
  roles:
    RoleItem[];
}) {
  if (
    roles.length ===
    0
  ) {
    return (
      <span className="inline-flex items-center rounded-full border border-dashed border-slate-200 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400">
        No role assigned
      </span>
    );
  }

  const visible =
    roles.slice(
      0,
      2,
    );

  const remaining =
    roles.length -
    visible.length;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map(
        (
          role,
        ) => (
          <span
            key={
              role.id
            }
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.09em] ${
              role.type ===
              "CUSTOM"
                ? "border-violet-200 bg-violet-50 text-violet-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            <KeyRound className="h-2.5 w-2.5" />

            {
              role.name
            }
          </span>
        ),
      )}

      {remaining >
      0 ? (
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-black text-slate-500">
          +{
            remaining
          }
        </span>
      ) : null}
    </div>
  );
}