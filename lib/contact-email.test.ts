import { describe, it, expect } from "vitest";
import { renderContactEmail } from "./contact-email";

const MESSAGE = {
  name: "Rina",
  email: "rina@example.com",
  message: "Halo, saya ingin bertanya soal proyek.",
};

describe("renderContactEmail", () => {
  it("puts the sender's name in the subject", () => {
    expect(renderContactEmail(MESSAGE).subject).toBe("New contact from Rina");
  });

  it("flattens newlines that could inject mail headers", () => {
    const rendered = renderContactEmail({
      ...MESSAGE,
      name: "Rina\r\nBcc: victim@example.com",
    });

    expect(rendered.subject).not.toContain("\r");
    expect(rendered.subject).not.toContain("\n");
    expect(rendered.subject).toBe("New contact from Rina Bcc: victim@example.com");
  });

  it("escapes markup in the HTML part", () => {
    const rendered = renderContactEmail({
      ...MESSAGE,
      name: "<script>alert(1)</script>",
      message: '<a href="https://evil.example">Reset your password</a>',
    });

    expect(rendered.html).not.toContain("<script>");
    expect(rendered.html).not.toContain("<a href=\"https://evil.example\"");
    expect(rendered.html).toContain("&lt;script&gt;");
    expect(rendered.html).toContain("&lt;a href=&quot;https://evil.example&quot;&gt;");
  });

  it("escapes the address inside both the text and the mailto href", () => {
    /* Zod rejects this shape before it reaches the renderer, but the renderer
       must not depend on that to stay safe. */
    const rendered = renderContactEmail({
      ...MESSAGE,
      email: 'x" onmouseover="alert(1)',
    });

    expect(rendered.html).not.toContain('onmouseover="alert(1)"');
    expect(rendered.html).toContain("&quot;");
  });

  it("keeps the plain-text part as typed", () => {
    const rendered = renderContactEmail({
      ...MESSAGE,
      message: "baris satu\nbaris dua <b>tebal</b>",
    });

    expect(rendered.text).toContain("baris satu\nbaris dua <b>tebal</b>");
  });

  it("turns message newlines into breaks in HTML", () => {
    const rendered = renderContactEmail({
      ...MESSAGE,
      message: "baris satu\nbaris dua",
    });

    expect(rendered.html).toContain("baris satu<br>baris dua");
  });

  it("renders an ordinary message without changing its text", () => {
    const rendered = renderContactEmail(MESSAGE);

    expect(rendered.html).toContain("Halo, saya ingin bertanya soal proyek.");
    expect(rendered.html).toContain('<a href="mailto:rina@example.com">');
    expect(rendered.html).toContain("<strong>Name:</strong> Rina");
  });
});
