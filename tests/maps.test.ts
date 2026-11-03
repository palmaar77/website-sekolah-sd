import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { parseGoogleMapsEmbedUrl, getGoogleMapsDirectionsUrl, getGoogleMapsSearchUrl } from "../src/lib/maps.ts";

describe("Google Maps URL Parser & Formatter", () => {
  test("harus menghasilkan embed URL dari alamat teks biasa", () => {
    const embedUrl = parseGoogleMapsEmbedUrl("Jl. Sudirman No. 1, Jakarta");
    assert.match(embedUrl, /^https:\/\/maps\.google\.com\/maps\?q=/);
    assert.ok(embedUrl.includes(encodeURIComponent("Jl. Sudirman No. 1, Jakarta")));
  });

  test("harus menghasilkan embed URL dari koordinat lat/lng", () => {
    const embedUrl = parseGoogleMapsEmbedUrl("-6.2088,106.8456");
    assert.match(embedUrl, /^https:\/\/maps\.google\.com\/maps\?q=/);
    assert.ok(embedUrl.includes("-6.2088"));
  });

  test("harus mengekstrak src jika input berupa tag iframe", () => {
    const iframeSnippet = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123" width="600" height="450"></iframe>';
    const embedUrl = parseGoogleMapsEmbedUrl(iframeSnippet);
    assert.equal(embedUrl, "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d123");
  });

  test("harus mengembalikan URL jika sudah merupakan Google Maps embed URL", () => {
    const existingEmbed = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d999";
    const result = parseGoogleMapsEmbedUrl(existingEmbed);
    assert.equal(result, existingEmbed);
  });

  test("harus menggunakan fallback address jika embed input kosong", () => {
    const embedUrl = parseGoogleMapsEmbedUrl("", "SD Negeri 01 Pagi");
    assert.ok(embedUrl.includes(encodeURIComponent("SD Negeri 01 Pagi")));
  });

  test("harus menghasilkan directions URL dan search URL yang valid", () => {
    const dirUrl = getGoogleMapsDirectionsUrl("SD Negeri Harapan Bangsa");
    const searchUrl = getGoogleMapsSearchUrl("SD Negeri Harapan Bangsa");
    assert.ok(dirUrl.includes("api=1&destination="));
    assert.ok(searchUrl.includes("api=1&query="));
  });
});

