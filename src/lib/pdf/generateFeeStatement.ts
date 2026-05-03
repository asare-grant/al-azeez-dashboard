// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// import fs from "fs";
// import path from "path";

// export const generateFeeStatementPDF = async (feeMaster: any) => {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]); // A4
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   // 🏫 LOAD SCHOOL LOGO
//   const publicDir = path.join(process.cwd(), "public");
//   let logoPath = path.join(publicDir, "logo.jpg");

//   if (!fs.existsSync(logoPath)) {
//     logoPath = path.join(publicDir, "logo.jpg"); // fallback to JPG
//     if (!fs.existsSync(logoPath)) {
//       throw new Error("School logo not found in public folder (logo.png or logo.jpg).");
//     }
//   }

//   const logoBytes = fs.readFileSync(logoPath);
//   let logoImage;
//   if (logoPath.endsWith(".png")) {
//     logoImage = await pdfDoc.embedPng(logoBytes);
//   } else {
//     logoImage = await pdfDoc.embedJpg(logoBytes);
//   }

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







// import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
// import fs from "fs";
// import path from "path";

// export const generateFeeStatementPDF = async (feeMaster: any) => {
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([595, 842]);

//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
//   const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//   const publicDir = path.join(process.cwd(), "public");

//   let logoPath = path.join(publicDir, "logo.png");

//   if (!fs.existsSync(logoPath)) {
//     logoPath = path.join(publicDir, "logo.jpg");
//   }

//   if (!fs.existsSync(logoPath)) {
//     throw new Error("School logo not found. Add logo.png or logo.jpg inside public folder.");
//   }

//   const logoBytes = fs.readFileSync(logoPath);
//   const logoImage = logoPath.endsWith(".png")
//     ? await pdfDoc.embedPng(logoBytes)
//     : await pdfDoc.embedJpg(logoBytes);

//   page.drawImage(logoImage, {
//     x: 50,
//     y: 770,
//     width: 60,
//     height: 60,
//   });

//   page.drawText("AL-AZEEZ INTERNATIONAL SCHOOL", {
//     x: 130,
//     y: 805,
//     size: 16,
//     font: boldFont,
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

//   let y = 725;

//   const draw = (
//     text: string,
//     x = 50,
//     size = 11,
//     selectedFont = font
//   ) => {
//     page.drawText(text, {
//       x,
//       y,
//       size,
//       font: selectedFont,
//       color: rgb(0, 0, 0),
//     });
//     y -= 20;
//   };

//   const paid = feeMaster.payments.reduce(
//     (sum: number, payment: any) => sum + payment.amount,
//     0
//   );

//   const balance = feeMaster.totalAmount - paid;

//   draw("FEE STATEMENT / INVOICE", 50, 14, boldFont);
//   y -= 10;

//   draw(`Student: ${feeMaster.student.name} ${feeMaster.student.surname}`);
//   draw(`Student ID: ${feeMaster.student.studentID ?? "N/A"}`);
//   draw(`Class: ${feeMaster.student.class?.name ?? "N/A"}`);
//   draw(`Grade: ${feeMaster.student.grade?.level ?? "N/A"}`);
//   draw(`Student Type: ${feeMaster.student.studentType ?? "N/A"}`);
//   draw(`Boarding Type: ${feeMaster.student.boardingType ?? "N/A"}`);
//   draw(`Term: ${feeMaster.term}`);
//   draw(`Academic Year: ${feeMaster.academicYear}`);

//   y -= 10;

//   draw("Fee Breakdown", 50, 12, boldFont);

//   page.drawText("Fee Type", { x: 50, y, size: 10, font: boldFont });
//   page.drawText("Amount", { x: 430, y, size: 10, font: boldFont });
//   y -= 15;

//   page.drawLine({
//     start: { x: 50, y },
//     end: { x: 545, y },
//     thickness: 0.5,
//   });

//   y -= 18;

//   if (!feeMaster.details || feeMaster.details.length === 0) {
//     draw("No fee details found.");
//   } else {
//     feeMaster.details.forEach((item: any) => {
//       const feeName = item.structure?.type?.name ?? "Fee Item";
//       const amount = item.amount ?? item.structure?.amount ?? 0;

//       page.drawText(feeName, {
//         x: 50,
//         y,
//         size: 10,
//         font,
//       });

//       page.drawText(`GHS ${amount.toFixed(2)}`, {
//         x: 430,
//         y,
//         size: 10,
//         font,
//       });

//       y -= 18;
//     });
//   }

//   y -= 10;

//   page.drawLine({
//     start: { x: 50, y },
//     end: { x: 545, y },
//     thickness: 0.5,
//   });

//   y -= 25;

//   draw(`Total Fees: GHS ${feeMaster.totalAmount.toFixed(2)}`, 50, 11, boldFont);
//   draw(`Amount Paid: GHS ${paid.toFixed(2)}`, 50, 11, boldFont);
//   draw(`Outstanding Balance: GHS ${balance.toFixed(2)}`, 50, 11, boldFont);

//   y -= 10;

//   draw("Payment History", 50, 12, boldFont);

//   if (!feeMaster.payments || feeMaster.payments.length === 0) {
//     draw("No payments recorded.");
//   } else {
//     feeMaster.payments.forEach((payment: any) => {
//       draw(
//         `${new Date(payment.date).toLocaleDateString()} - GHS ${payment.amount.toFixed(
//           2
//         )} - ${payment.method}`
//       );
//     });
//   }

//   y -= 30;

//   draw("Generated by Al-Azeez International School", 50, 9);

//   return Buffer.from(await pdfDoc.save());
// };





import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export const generateFeeStatementPDF = async (feeMaster: any) => {
  const payments = feeMaster.payments ?? [];
  const lineItems = feeMaster.details ?? [];

  const paid = payments.reduce(
    (sum: number, payment: any) => sum + payment.amount,
    0
  );

  const balance = feeMaster.totalAmount - paid;

  const receiptWidth = 226; // 80mm POS receipt width
  const baseHeight = 360 + lineItems.length * 22 + payments.length * 24;
  const receiptHeight = Math.max(baseHeight, 520);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([receiptWidth, receiptHeight]);

  const font = await pdfDoc.embedFont(StandardFonts.Courier);
  const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

  let y = receiptHeight - 25;

  const centerText = (text: string, size = 9, selectedFont = font) => {
    const textWidth = selectedFont.widthOfTextAtSize(text, size);

    page.drawText(text, {
      x: (receiptWidth - textWidth) / 2,
      y,
      size,
      font: selectedFont,
      color: rgb(0, 0, 0),
    });

    y -= size + 5;
  };

  const drawText = (text: string, x = 10, size = 8, selectedFont = font) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: selectedFont,
      color: rgb(0, 0, 0),
    });

    y -= size + 5;
  };

  const drawRow = (
    left: string,
    right: string,
    size = 8,
    selectedFont = font
  ) => {
    const rightWidth = selectedFont.widthOfTextAtSize(right, size);

    page.drawText(left.slice(0, 22), {
      x: 10,
      y,
      size,
      font: selectedFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(right, {
      x: receiptWidth - rightWidth - 10,
      y,
      size,
      font: selectedFont,
      color: rgb(0, 0, 0),
    });

    y -= size + 5;
  };

  const line = () => {
    drawText("-------------------------------------------", 10, 8, font);
  };

  const formatMoney = (amount: number) => `GHS ${Number(amount).toFixed(2)}`;

  // LOGO + SCHOOL NAME
  const publicDir = path.join(process.cwd(), "public");
  let logoPath = path.join(publicDir, "logo.jpg");

  if (!fs.existsSync(logoPath)) {
    logoPath = path.join(publicDir, "logo.jpg");
  }

  if (fs.existsSync(logoPath)) {
    const logoBytes = fs.readFileSync(logoPath);

    const logoImage = logoPath.endsWith(".png")
      ? await pdfDoc.embedPng(logoBytes)
      : await pdfDoc.embedJpg(logoBytes);

    page.drawImage(logoImage, {
      x: 10,
      y: y - 8,
      width: 28,
      height: 28,
    });
  }

  page.drawText("AL-AZEEZ INTERNATIONAL SCHOOL", {
    x: 42,
    y: y + 4,
    size: 10,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  y -= 4;

  centerText("Knowledge, Faith and Perseverance", 7);

  y -= 10;
  centerText("FEE RECEIPT / STATEMENT", 9, boldFont);

  line();

  drawText(`Date: ${new Date().toLocaleDateString()}`);
  drawText(`Invoice No: ${feeMaster.id}`);
  drawText(`Student: ${feeMaster.student.name} ${feeMaster.student.surname}`);
  // drawText(`Student ID: ${feeMaster.student.studentID ?? "N/A"}`);
  drawText(`Class: ${feeMaster.student.class?.name ?? "N/A"}`);
  // drawText(`Grade: ${feeMaster.student.grade?.level ?? "N/A"}`);
  // drawText(`Type: ${feeMaster.student.studentType ?? "N/A"}`);
  drawText(`Boarding Status: ${feeMaster.student.boardingType.toUpperCase() ?? "N/A"}`);
  drawText(`Academic Term: ${feeMaster.term}`);
  drawText(`Academic Year: ${feeMaster.academicYear}`);

  line();

  drawRow("FEE ITEM", "AMOUNT", 8, boldFont);
  line();

  if (lineItems.length === 0) {
    drawText("No fee items found.");
  } else {
    lineItems.forEach((item: any) => {
      const feeName = item.structure?.type?.name ?? "Fee Item";
      const amount = item.amount ?? item.structure?.amount ?? 0;

      drawRow(feeName, formatMoney(amount));
    });
  }

  line();

  drawRow("TOTAL FEES", formatMoney(feeMaster.totalAmount), 9, boldFont);
  drawRow("AMOUNT PAID", formatMoney(paid), 9, boldFont);
  drawRow("BALANCE", formatMoney(balance), 9, boldFont);

  line();

  drawText("PAYMENT HISTORY", 10, 8, boldFont);

  if (payments.length === 0) {
    drawText("No payment recorded.");
  } else {
    payments.forEach((payment: any) => {
      const date = new Date(payment.date).toLocaleDateString();

      drawRow(date, formatMoney(payment.amount));
      drawText(`Method: ${payment.method}`, 10, 7);
    });
  }

  line();

  y -= 10;

  centerText("Thank you!", 9, boldFont);
  centerText("Please keep this receipt safe.", 7);
  centerText("Generated by Al-Azeez Int. School", 7);

  return Buffer.from(await pdfDoc.save());
};