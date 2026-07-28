import type {
  LucideIcon,
} from "lucide-react";

import type {
  ReactNode,
} from "react";

type AssessmentSettingCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
};

export default function AssessmentSettingCard({
  icon: Icon,
  title,
  description,
  children,
}: AssessmentSettingCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-base font-black text-slate-950">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}