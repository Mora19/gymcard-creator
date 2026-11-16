export const CONTACT_EMAIL = "hello@recardnize.com";
export const PROVIDER_NAME = "Moritz Klösters";
export const WHATSAPP_NUMBER = "4917642697714";
export const WHATSAPP_DISPLAY_NUMBER = "+49 176 42697714";

function buildWhatsAppUrl(base: string, message: string) {
  return `${base}?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
}

export function getWhatsAppWebUrl(message: string) {
  return buildWhatsAppUrl("https://web.whatsapp.com/send", message);
}

export function getWhatsAppAppUrl(message: string) {
  return buildWhatsAppUrl("whatsapp://send", message);
}

// Preserve existing mobile links and the server-rendered web fallback.
// The contact dialog offers a choice without guessing which apps are installed.
export function getWhatsAppUrl(message: string, userAgent = "") {
  return /Android|iPhone|iPad|iPod/i.test(userAgent)
    ? getWhatsAppAppUrl(message)
    : getWhatsAppWebUrl(message);
}
