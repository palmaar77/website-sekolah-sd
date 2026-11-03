/**
 * Google Maps Embed & Navigation Helpers
 * Memungkinkan lokasi peta dapat diubah ke mana saja dan kapan saja:
 * - Menerima alamat lengkap (misal: "Jl. Merdeka No. 45, Bandung")
 * - Menerima nama tempat / landmark (misal: "Monumen Nasional, Jakarta")
 * - Menerima koordinat latitude, longitude (misal: "-6.2088, 106.8456")
 * - Menerima kode embed iframe lengkap (<iframe src="https://www.google.com/maps/embed?pb=..." ...>)
 * - Menerima URL share / link Google Maps biasa
 */

export function parseGoogleMapsEmbedUrl(
  input?: string | null,
  fallbackQuery = "SD Negeri Harapan Bangsa"
): string {
  const cleanInput = (input || "").trim();

  // 1. Jika pengguna menempelkan kode tag HTML <iframe> lengkap dari Google Maps
  if (cleanInput.includes("<iframe")) {
    const srcMatch = cleanInput.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1].trim();
    }
  }

  // 2. Jika sudah berupa embed URL Google Maps yang valid
  if (
    cleanInput.startsWith("http") &&
    (cleanInput.includes("/maps/embed") || cleanInput.includes("output=embed"))
  ) {
    return cleanInput;
  }

  // 3. Jika pengguna menyalin link URL pencarian Google Maps biasa (google.com/maps/place/... atau ?q=...)
  if (cleanInput.includes("google.com/maps")) {
    // Pola 1: ?q=Nama+Tempat
    const qParamMatch = cleanInput.match(/[?&]q=([^&]+)/);
    if (qParamMatch && qParamMatch[1]) {
      const decoded = decodeURIComponent(qParamMatch[1].replace(/\+/g, " "));
      return `https://maps.google.com/maps?q=${encodeURIComponent(decoded)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    // Pola 2: /place/Nama+Lokasi/
    const placeMatch = cleanInput.match(/\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const decoded = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return `https://maps.google.com/maps?q=${encodeURIComponent(decoded)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    // Pola 3: Koordinat /@lat,lng
    const coordMatch = cleanInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch && coordMatch[1] && coordMatch[2]) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 4. Jika input berupa nama alamat, kota, atau nama sekolah manual
  if (cleanInput.length > 0) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(cleanInput)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 5. Fallback ke alamat sekolah default
  return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

/**
 * Menghasilkan link langsung untuk petunjuk arah / navigasi Google Maps
 */
export function getGoogleMapsDirectionsUrl(destinationQuery: string): string {
  const query = (destinationQuery || "SD Negeri Harapan Bangsa").trim();
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

/**
 * Menghasilkan link langsung untuk membuka lokasi di Google Maps di tab baru
 */
export function getGoogleMapsSearchUrl(locationQuery: string): string {
  const query = (locationQuery || "SD Negeri Harapan Bangsa").trim();
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

