"use client";

import { Download, Loader2, Printer } from "lucide-react";

import { useState } from "react";

import { toast } from "react-toastify";

type ReportCardDocumentActionsProps = {
  fileName?: string;
};

function sanitiseFileName(value: string) {
  return (
    value
      .trim()

      /*
       * Remove characters Windows/macOS
       * do not allow in normal filenames.
       */
      .replace(/[<>:"/\\|?*]+/g, "-")

      .replace(/\s+/g, "-")

      .replace(/-+/g, "-")

      .replace(/^[-.]+|[-.]+$/g, "") || "student-report-card"
  );
}

export default function ReportCardDocumentActions({
  fileName = "student-report-card",
}: ReportCardDocumentActionsProps) {
  const [downloading, setDownloading] = useState(false);

  function handlePrint() {
    window.print();
  }

  async function handlePdf() {
    if (downloading) {
      return;
    }

    const element = document.getElementById("report-card-document");

    if (!element) {
      toast.error("The report card document could not be found.");

      return;
    }

    try {
      setDownloading(true);

      /*
       * Load PDF libraries only when
       * the user requests a download.
       */
      const [html2canvasModule, jsPdfModule] = await Promise.all([
        import("html2canvas-pro"),

        import("jspdf"),
      ]);

      const html2canvas = html2canvasModule.default;

      const { jsPDF } = jsPdfModule;

      /*
       * Allow browser-loaded fonts and images
       * a moment to settle before capture.
       */
      if ("fonts" in document) {
        await document.fonts.ready;
      }

      /*
       * Wait for report-card images such as
       * the logo and student photograph.
       */
      const images = Array.from(element.querySelectorAll("img"));

      await Promise.all(
        images.map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) {
                resolve();

                return;
              }

              const finish = () => {
                image.removeEventListener("load", finish);

                image.removeEventListener("error", finish);

                resolve();
              };

              image.addEventListener("load", finish);

              image.addEventListener("error", finish);
            }),
        ),
      );

      const canvas = await html2canvas(element, {
        scale: 2,

        useCORS: true,

        allowTaint: false,

        backgroundColor: "#ffffff",

        logging: false,

        /*
         * This keeps the generated
         * canvas independent of any
         * current page scrolling.
         */
        scrollX: 0,
        scrollY: -window.scrollY,

        windowWidth: element.scrollWidth,

        onclone: (clonedDocument) => {
          const clonedReport = clonedDocument.getElementById(
            "report-card-document",
          );

          if (clonedReport) {
            clonedReport.style.boxShadow = "none";

            clonedReport.style.margin = "0";

            clonedReport.style.backgroundColor = "#ffffff";
          }
        },
      });

      /*
       * A4 dimensions in millimetres.
       */
      /*
       * A4 dimensions.
       */
      /* ------------------------------------------------------------------ */
      /*                   PREMIUM A4 PAGE COMPOSITION                      */
      /* ------------------------------------------------------------------ */

      const pageWidth = 210;

      const pageHeight = 297;

      /*
       * PAGE 1
       *
       * Academic page:
       * compact margins so 6–9 subjects fit comfortably.
       */
      const firstPageMarginX = 8;

      const firstPageTop = 8;

      const firstPageBottom = 9;

      /*
       * PAGE 2+
       *
       * Summary / remarks pages:
       * more generous white space for a formal
       * institutional-document feel.
       */
      const continuationMarginX = 12;

      const continuationTop = 18;

      const continuationBottom = 13;

      const pdf = new jsPDF({
        orientation: "portrait",

        unit: "mm",

        format: "a4",

        compress: true,
      });

      /*
       * Find the semantic point where
       * page 2 should start.
       */
      const pageBreakElement = element.querySelector<HTMLElement>(
        '[data-pdf-page-break="before"]',
      );

      const elementRect = element.getBoundingClientRect();

      /*
       * html2canvas may render at a larger
       * pixel scale than the DOM.
       */
      const scaleY = canvas.height / elementRect.height;

      let manualBreakY: number | null = null;

      if (pageBreakElement) {
        const breakRect = pageBreakElement.getBoundingClientRect();

        /*
         * The logical page break sits at the top of
         * Performance Summary.
         *
         * html2canvas anti-aliases rounded borders and
         * shadows from the previous section over several
         * rendered pixels. Trim more aggressively so no
         * Academic Performance border can leak onto page 2.
         */
        const cropSafetyPixels = Math.max(10, Math.round(4 * scaleY));

        manualBreakY =
          Math.round((breakRect.top - elementRect.top) * scaleY) +
          cropSafetyPixels;

        if (manualBreakY <= 0 || manualBreakY >= canvas.height) {
          manualBreakY = null;
        }
      }

      /* ------------------------------------------------------------------ */
      /*                        CANVAS CROPPING                             */
      /* ------------------------------------------------------------------ */

      function createCanvasSlice(startY: number, endY: number) {
        const safeStart = Math.max(0, Math.round(startY));

        const safeEnd = Math.min(canvas.height, Math.round(endY));

        const height = Math.max(1, safeEnd - safeStart);

        const slice = document.createElement("canvas");

        slice.width = canvas.width;

        slice.height = height;

        const context = slice.getContext("2d");

        if (!context) {
          throw new Error("Could not create the PDF page canvas.");
        }

        context.fillStyle = "#ffffff";

        context.fillRect(0, 0, slice.width, slice.height);

        context.drawImage(
          canvas,

          0,
          safeStart,
          canvas.width,
          height,

          0,
          0,
          canvas.width,
          height,
        );

        return slice;
      }

      /* ------------------------------------------------------------------ */
      /*                         ADD PDF PAGE                               */
      /* ------------------------------------------------------------------ */

      function addCanvasPage({
        slice,
        pageIndex,
      }: {
        slice: HTMLCanvasElement;
        pageIndex: number;
      }) {
        if (pageIndex > 0) {
          pdf.addPage();
        }

        const isFirstPage = pageIndex === 0;

        /*
         * Page 1 stays compact.
         * Continuing pages get more generous margins.
         */
        const horizontalMargin = isFirstPage
          ? firstPageMarginX
          : continuationMarginX;

        const topMargin = isFirstPage ? firstPageTop : continuationTop;

        const bottomMargin = isFirstPage ? firstPageBottom : continuationBottom;

        const availableWidth = pageWidth - horizontalMargin * 2;

        const availableHeight = pageHeight - topMargin - bottomMargin;

        let renderWidth = availableWidth;

        let renderHeight = (slice.height * renderWidth) / slice.width;

        /*
         * Never cut a logical page.
         * If necessary, scale the whole logical page
         * down slightly to remain inside its paper area.
         */
        if (renderHeight > availableHeight) {
          const fitScale = availableHeight / renderHeight;

          renderWidth *= fitScale;

          renderHeight *= fitScale;
        }

        const x = (pageWidth - renderWidth) / 2;

        const imageData = slice.toDataURL("image/jpeg", 0.98);

        pdf.addImage(
          imageData,
          "JPEG",
          x,
          topMargin,
          renderWidth,
          renderHeight,
          undefined,
          "FAST",
        );
      }

      /* ------------------------------------------------------------------ */
      /*                    BUILD LOGICAL REPORT PAGES                     */
      /* ------------------------------------------------------------------ */

      if (manualBreakY) {
        /*
         * PAGE ONE
         *
         * Header
         * Student information
         * Academic performance
         * Performance summary
         * Complete attendance
         */
        const firstPageCanvas = createCanvasSlice(0, manualBreakY);

        /*
         * PAGE TWO
         *
         * Conduct & remarks
         * Signatures
         * Footer
         */
        /*
         * Create page 2 from slightly inside the logical
         * break boundary. This deliberately discards any
         * anti-aliased pixels belonging to the previous
         * academic table.
         */
        const secondPageTrim = Math.max(8, Math.round(2 * scaleY));

        const secondPageCanvas = createCanvasSlice(
          manualBreakY + secondPageTrim,
          canvas.height,
        );

        addCanvasPage({
          slice: firstPageCanvas,

          pageIndex: 0,
        });

        addCanvasPage({
          slice: secondPageCanvas,

          pageIndex: 1,
        });
      } else {
        /*
         * Safe fallback.
         *
         * If the page-break marker is ever
         * removed, still generate the PDF.
         */
        addCanvasPage({
          slice: canvas,

          pageIndex: 0,
        });
      }

      /* ------------------------------------------------------------------ */
      /*                          PAGE NUMBERS                              */
      /* ------------------------------------------------------------------ */

      const pageCount = pdf.getNumberOfPages();

      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        pdf.setPage(pageNumber);

        pdf.setFont("helvetica", "normal");

        pdf.setFontSize(6.5);

        pdf.setTextColor(148, 163, 184);

        const pageNumberRightMargin =
          pageNumber === 1 ? firstPageMarginX : continuationMarginX;

        pdf.text(
          `Page ${pageNumber} of ${pageCount}`,

          pageWidth - pageNumberRightMargin,

          pageHeight - 5,

          {
            align: "right",
          },
        );
      }

      const safeFileName = sanitiseFileName(fileName);

      pdf.save(`${safeFileName}.pdf`);

      toast.success("Report card PDF downloaded successfully.");
    } catch (error) {
      console.error("REPORT CARD PDF ERROR:", error);

      toast.error("The PDF could not be generated. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="print:hidden" data-hide-on-print="true">
      <div className="mx-auto mb-5 flex w-full max-w-[210mm] flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:flex-row sm:items-center sm:justify-between">
        <div className="px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600">
            Official Report Document
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-500">
            Download the official PDF or print a hard copy.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePdf}
            disabled={downloading}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 text-xs font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}

            {downloading ? "Creating PDF..." : "Download PDF"}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-xs font-black text-white transition hover:bg-blue-700 sm:flex-none"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
}
