import prisma from "@/lib/prisma";
import TermForm from "@/components/forms/TermForm";

const TermSettingsPage = async () => {
  const term = await prisma.schoolTerm.findFirst({
    where: { isActive: true },
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-2xl font-semibold mb-6">
        Academic Term Settings
      </h1>

      <TermForm data={term} />
    </div>
  );
};

export default TermSettingsPage;
