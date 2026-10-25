import { describe, it, expect } from "vitest";
import { escapeHtml, escapeHtmlWithLineBreaks } from "./escape-html";

describe("escapeHtml", () => {
  it("escapes every character that can change HTML structure", () => {
    expect(escapeHtml(`<script>alert("x") & 'y'</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;) &amp; &#39;y&#39;&lt;/script&gt;",
    );
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeHtml("Halo, saya ingin bertanya soal proyek.")).toBe(
      "Halo, saya ingin bertanya soal proyek.",
    );
  });

  it("escapes an existing entity so it renders literally", () => {
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
  });

  it("escapes a phishing link into visible text", () => {
    const injected = '<a href="https://evil.example">Reset your password</a>';
    expect(escapeHtml(injected)).not.toContain("<a ");
    expect(escapeHtml(injected)).toContain("&lt;a href=");
  });
});

describe("escapeHtmlWithLineBreaks", () => {
  it("turns newlines into breaks after escaping", () => {
    expect(escapeHtmlWithLineBreaks("baris satu\nbaris dua")).toBe(
      "baris satu<br>baris dua",
    );
  });

  it("normalises CRLF and bare CR", () => {
    expect(escapeHtmlWithLineBreaks("a\r\nb\rc")).toBe("a<br>b<br>c");
  });

  it("never lets escaped markup become a tag", () => {
    expect(escapeHtmlWithLineBreaks("<b>x</b>\ny")).toBe(
      "&lt;b&gt;x&lt;/b&gt;<br>y",
    );
  });
});
