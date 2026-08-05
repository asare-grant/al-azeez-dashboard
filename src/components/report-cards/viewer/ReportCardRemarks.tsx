import {
  CalendarDays,
  MessageSquareText,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

type ReportCardRemarksProps = {
  conduct:
    | string
    | null;

  classTeacherRemark:
    | string
    | null;

  headTeacherRemark:
    | string
    | null;

  promotionStatus:
    | string
    | null;

  nextTermBegins:
    | Date
    | string
    | null;
};

function formatDate(
  value:
    | Date
    | string
    | null,
) {
  if (!value) {
    return "Not configured";
  }

  return new Intl.DateTimeFormat(
    "en-GH",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(new Date(value));
}

export default function ReportCardRemarks({
  conduct,
  classTeacherRemark,
  headTeacherRemark,
  promotionStatus,
  nextTermBegins,
}: ReportCardRemarksProps) {
  return (
    <section className="grid gap-5 lg:grid-cols-2">
      <RemarkCard
        icon={
          UserRoundCheck
        }
        eyebrow="Conduct"
        title={
          conduct ||
          "Not recorded"
        }
        description="Student behaviour and general conduct for the academic term."
      />

      <RemarkCard
        icon={
          ShieldCheck
        }
        eyebrow="Promotion"
        title={
          promotionStatus ||
          "Not recorded"
        }
        description="Promotion or progression status after the terminal assessment."
      />

      <RemarkCard
        icon={
          MessageSquareText
        }
        eyebrow="Class Teacher"
        title="Teacher’s remark"
        description={
          classTeacherRemark ||
          "No class teacher remark has been entered."
        }
      />

      <RemarkCard
        icon={
          MessageSquareText
        }
        eyebrow="Head Teacher"
        title="Head teacher’s remark"
        description={
          headTeacherRemark ||
          "No head teacher remark has been entered."
        }
      />

      <div className="lg:col-span-2">
        <RemarkCard
          icon={
            CalendarDays
          }
          eyebrow="Next Term"
          title={formatDate(
            nextTermBegins,
          )}
          description="Expected reopening date for the next academic term."
        />
      </div>
    </section>
  );
}

function RemarkCard({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon:
    typeof ShieldCheck;

  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
            {eyebrow}
          </p>

          <h3 className="mt-2 text-lg font-black text-slate-950">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}