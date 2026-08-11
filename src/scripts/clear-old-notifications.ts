import prisma from "@/lib/prisma";

async function main() {
  const result =
    await prisma.notification.deleteMany();

  console.log(
    `Deleted ${result.count} legacy notifications.`,
  );
}

main()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });