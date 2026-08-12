import "server-only";

type SendFeeReminderWhatsAppInput = {
  phoneNumber:
    string;

  parentName:
    string;

  studentName:
    string;

  term:
    string;

  academicYear:
    string;

  balance:
    number;
};

function requireConfig(
  name:
    string,
) {
  const value =
    process.env[
      name
    ];

  if (
    !value
  ) {
    throw new Error(
      `${name} is not configured.`,
    );
  }

  return value;
}

export async function sendFeeReminderWhatsApp({
  phoneNumber,
  parentName,
  studentName,
  term,
  academicYear,
  balance,
}: SendFeeReminderWhatsAppInput) {
  const accessToken =
    requireConfig(
      "WHATSAPP_ACCESS_TOKEN",
    );

  const phoneNumberId =
    requireConfig(
      "WHATSAPP_PHONE_NUMBER_ID",
    );

  const apiVersion =
    requireConfig(
      "WHATSAPP_API_VERSION",
    );

  const templateName =
    requireConfig(
      "WHATSAPP_FEE_REMINDER_TEMPLATE",
    );

  const language =
    process.env
      .WHATSAPP_TEMPLATE_LANGUAGE ??
    "en";

  const response =
    await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,

      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            messaging_product:
              "whatsapp",

            to:
              phoneNumber,

            type:
              "template",

            template: {
              name:
                templateName,

              language: {
                code:
                  language,
              },

              components: [
                {
                  type:
                    "body",

                  parameters: [
                    {
                      type:
                        "text",

                      text:
                        parentName,
                    },

                    {
                      type:
                        "text",

                      text:
                        studentName,
                    },

                    {
                      type:
                        "text",

                      text:
                        term,
                    },

                    {
                      type:
                        "text",

                      text:
                        academicYear,
                    },

                    {
                      type:
                        "text",

                      text:
                        balance.toFixed(
                          2,
                        ),
                    },
                  ],
                },
              ],
            },
          }),
      },
    );

  const payload =
    await response.json();

  if (
    !response.ok
  ) {
    throw new Error(
      typeof payload?.error
        ?.message ===
        "string"
        ? payload.error
            .message
        : "WhatsApp could not send the fee reminder.",
    );
  }

  const providerMessageId =
    payload?.messages?.[0]
      ?.id;

  if (
    typeof providerMessageId !==
    "string"
  ) {
    throw new Error(
      "WhatsApp accepted the request but did not return a message identifier.",
    );
  }

  return {
    providerMessageId,
  };
}