export const CONTACT_EMAIL = "moritz.kloesters@gmail.com";
export const WHATSAPP_NUMBER = "4917642697714";

// Default to the direct web client, including during server rendering.
// Mobile links use the installed app without the wa.me / api.whatsapp.com redirect.
export function getWhatsAppUrl(message: string, userAgent = "") {
  const base = /Android|iPhone|iPad|iPod/i.test(userAgent)
    ? "whatsapp://send"
    : "https://web.whatsapp.com/send";
  return `${base}?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}
