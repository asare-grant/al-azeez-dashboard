import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export const generateFeeStatementPDF = async (feeMaster: any) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // 🏫 LOAD SCHOOL LOGO
  const publicDir = path.join(process.cwd(), "public");
  let logoPath = path.join(publicDir, "logo.jpg");

  if (!fs.existsSync(logoPath)) {
    logoPath = path.join(publicDir, "logo.jpg"); // fallback to JPG
    if (!fs.existsSync(logoPath)) {
      throw new Error("School logo not found in public folder (logo.png or logo.jpg).");
    }
  }

  const logoBytes = fs.readFileSync(logoPath);
  let logoImage;
  if (logoPath.endsWith(".png")) {
    logoImage = await pdfDoc.embedPng(logoBytes);
  } else {
    logoImage = await pdfDoc.embedJpg(logoBytes);
  }

  // 🖼️ DRAW LOGO
  page.drawImage(logoImage, {
    x: 50,
    y: 770,
    width: 60,
    height: 60,
  });

  // 🏷️ LETTERHEAD
  page.drawText("AL-AZEEZ INTERNATIONAL SCHOOL", {
    x: 130,
    y: 805,
    size: 16,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText("Knowledge, Faith and Perseverance", {
    x: 130,
    y: 785,
    size: 10,
    font,
  });

  page.drawLine({
    start: { x: 50, y: 760 },
    end: { x: 545, y: 760 },
    thickness: 1,
  });

  // 📄 CONTENT
  let y = 720;
  const draw = (text: string) => {
    page.drawText(text, { x: 50, y, size: 11, font });
    y -= 22;
  };

  const paid = feeMaster.payments.reduce((s: number, p: any) => s + p.amount, 0);
  const balance = feeMaster.totalAmount - paid;

  draw(`Student: ${feeMaster.student.name} ${feeMaster.student.surname}`);
  draw(`Term: ${feeMaster.term}`);
  draw(`Academic Year: ${feeMaster.academicYear}`);
  draw("-----------------------------------");
  draw(`Total Fees: GHS ${feeMaster.totalAmount.toFixed(2)}`);
  draw(`Amount Paid: GHS ${paid.toFixed(2)}`);
  draw(`Outstanding Balance: GHS ${balance.toFixed(2)}`);
  draw("-----------------------------------");
  draw("Payment History:");

  if (feeMaster.payments.length === 0) {
    draw("No payments recorded.");
  } else {
    feeMaster.payments.forEach((p: any) => {
      draw(
        `${new Date(p.date).toLocaleDateString()} — GHS ${p.amount.toFixed(
          2
        )} (${p.method})`
      );
    });
  }

  return Buffer.from(await pdfDoc.save());
};




// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// import fs from "fs";
// import path from "path";

// export const generateFeeStatementPDF = async (feeMaster: any) => {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]); // A4
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   // 🏫 LOAD SCHOOL LOGO
//   const logoPath = path.join(process.cwd(), "public/logo.png");
//   const logoBytes = fs.readFileSync(logoPath);
//   const logoImage = await pdfDoc.embedPng(logoBytes);

//   // 🖼️ DRAW LOGO
//   page.drawImage(logoImage, {
//     x: 50,
//     y: 770,
//     width: 60,
//     height: 60,
//   });

//   // 🏷️ LETTERHEAD
//   page.drawText("AL-AZEEZ INTERNATIONAL SCHOOL", {
//     x: 130,
//     y: 805,
//     size: 16,
//     font,
//     color: rgb(0, 0, 0),
//   });

//   page.drawText("Knowledge, Faith and Perseverance", {
//     x: 130,
//     y: 785,
//     size: 10,
//     font,
//   });

//   page.drawLine({
//     start: { x: 50, y: 760 },
//     end: { x: 545, y: 760 },
//     thickness: 1,
//   });

//   // 📄 CONTENT
//   let y = 720;
//   const draw = (text: string) => {
//     page.drawText(text, { x: 50, y, size: 11, font });
//     y -= 22;
//   };

//   const paid = feeMaster.payments.reduce((s: number, p: any) => s + p.amount, 0);
//   const balance = feeMaster.totalAmount - paid;

//   draw(`Student: ${feeMaster.student.name} ${feeMaster.student.surname}`);
//   draw(`Term: ${feeMaster.term}`);
//   draw(`Academic Year: ${feeMaster.academicYear}`);
//   draw("-----------------------------------");
//   draw(`Total Fees: GHS ${feeMaster.totalAmount.toFixed(2)}`);
//   draw(`Amount Paid: GHS ${paid.toFixed(2)}`);
//   draw(`Outstanding Balance: GHS ${balance.toFixed(2)}`);
//   draw("-----------------------------------");
//   draw("Payment History:");

//   if (feeMaster.payments.length === 0) {
//     draw("No payments recorded.");
//   } else {
//     feeMaster.payments.forEach((p: any) => {
//       draw(
//         `${new Date(p.date).toLocaleDateString()} — GHS ${p.amount.toFixed(
//           2
//         )} (${p.method})`
//       );
//     });
//   }

//   return Buffer.from(await pdfDoc.save());
// };
