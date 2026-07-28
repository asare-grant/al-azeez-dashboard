import type {
  ReactNode,
} from "react";

type AssessmentStudioSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
};

export default function AssessmentStudioSection({
  eyebrow,
  title,
  description,
  children,
  action,
}: AssessmentStudioSectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              {eyebrow}
            </p>
          ) : null}

          <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            {title}
          </h2>

          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className="shrink-0">
            {action}
          </div>
        ) : null}
      </div>

      <div className="p-5 sm:p-7">
        {children}
      </div>
    </section>
  );
}