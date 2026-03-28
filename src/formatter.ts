export type HeadingStyle = "bold" | "keep";

export interface FormatOptions {
  keepCodeFenceLanguage: boolean;
  convertLinksToPlain: boolean;
  headingStyle: HeadingStyle;
  stripHtml: boolean;
}

const DEFAULTS: FormatOptions = {
  keepCodeFenceLanguage: true,
  convertLinksToPlain: true,
  headingStyle: "bold",
  stripHtml: true
};

export function formatForTeams(input: string, opts?: Partial<FormatOptions>) {
  const options: FormatOptions = { ...DEFAULTS, ...(opts ?? {}) };
  let text = input;

  // Normalize newlines early.
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Remove invisible / odd unicode that often appears in copied chat.
  text = text
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // zero-width space/joiners
    .replace(/\u00A0/g, " "); // non-breaking space

  // Normalize smart quotes / dashes
  text = text
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-");

  // Convert/strip HTML-ish artifacts.
  if (options.stripHtml) {
    text = htmlishToText(text);
  }

  // Normalize markdown links for Teams reliability.
  if (options.convertLinksToPlain) {
    // [text](url) -> text (url) (avoid images)
    text = text.replace(
      /(^|[^!])\[(?<label>[^\]]+)\]\((?<url>[^)]+)\)/g,
      (_m, prefix, label, url) => `${prefix}${label} (${url})`
    );
  }

  // Normalize headings.
  if (options.headingStyle === "bold") {
    text = text.replace(/^[\s{0,3}#{1,6}\s+(.+?)\s*$/gm, (_m, title) => {
      return `**${title.trim()}**`;
    });
  }

  // Normalize bullet styles.
  text = text
    .replace(/^[\s*•·]\s+/gm, "- ")
    .replace(/^[\s*o]\s+/gm, "- ");

  // Ensure blank lines around code fences; optionally strip language.
  text = normalizeFencedCodeBlocks(text, options.keepCodeFenceLanguage);

  // Normalize paragraph spacing outside code fences.
  text = normalizeParagraphSpacingOutsideCode(text);

  // Trim trailing spaces
  text = text.replace(/[ \t]+$/gm, "");

  return text.trim();
}

function htmlishToText(text: string) {
  // Decode a minimal set of common entities first
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // Convert line-break-ish tags to newlines
  text = text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<\/div\s*>/gi, "\n")
    .replace(/<\/li\s*>/gi, "\n");

  // Convert list items <li> to "- "
  text = text.replace(/<li[^>]*>\s*/gi, "- ");

  // Remove remaining tags (best-effort)
  text = text.replace(/<\/?[^>]+>/g, "");

  return text;
}

function normalizeFencedCodeBlocks(text: string, keepLanguage: boolean) {
  const lines = text.split("\n");
  const out: string[] = [];

  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const fence = line.match(/^\s*```(\s*\S+)?\s*$/);
    if (fence) {
      if (!inFence) {
        inFence = true;
        const lang = (fence[1] ?? "").trim();

        if (out.length > 0 && out[out.length - 1].trim() !== "") out.push("");

        if (keepLanguage && lang) out.push("```" + lang);
        else out.push("```);
      } else {
        inFence = false;
        out.push("```",

        const next = lines[i + 1];
        if (typeof next === "string" && next.trim() !== "") out.push("");
      }
      continue;
    }

    out.push(line);
  }

  return out.join("\n");
}

function normalizeParagraphSpacingOutsideCode(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];

  let inFence = false;
  let blankStreak = 0;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      blankStreak = 0;
      continue;
    }

    if (inFence) {
      out.push(line);
      blankStreak = 0;
      continue;
    }

    if (line.trim() === "") {
      blankStreak++;
      if (blankStreak <= 2) out.push("");
      continue;
    }

    blankStreak = 0;
    out.push(line);
  }

  return out.join("\n");
}