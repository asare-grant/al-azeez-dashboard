import "server-only";

export function normaliseWhatsAppPhone(
  rawPhone:
    string,
) {
  let phone =
    rawPhone
      .trim()
      .replace(
        /[\s()-]/g,
        "",
      );

  if (
    phone.startsWith(
      "+",
    )
  ) {
    phone =
      phone.slice(
        1,
      );
  }

  /*
   * Ghana local numbers:
   *
   * 0241234567
   * becomes
   * 233241234567
   */
  if (
    /^0\d{9}$/.test(
      phone,
    )
  ) {
    phone =
      `233${phone.slice(
        1,
      )}`;
  }

  if (
    !/^\d{10,15}$/.test(
      phone,
    )
  ) {
    throw new Error(
      "The parent's WhatsApp contact number is invalid.",
    );
  }

  return phone;
}