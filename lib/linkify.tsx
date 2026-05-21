import type { MouseEvent, ReactNode } from "react";

const urlPattern = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const trailingPunctuationPattern = /[.,!?;:)\]}，。！？；：）】]+$/;

export function renderLinkedText(text: string, emptyLabel = "未填寫"): ReactNode {
  if (!text) {
    return emptyLabel;
  }

  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(urlPattern)) {
    const rawMatch = match[0];
    const startIndex = match.index ?? 0;
    const trailingPunctuation = rawMatch.match(trailingPunctuationPattern)?.[0] ?? "";
    const urlText = trailingPunctuation ? rawMatch.slice(0, -trailingPunctuation.length) : rawMatch;
    const href = normalizeUrl(urlText);

    if (!href) {
      continue;
    }

    if (startIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, startIndex));
    }

    nodes.push(
      <a
        className="text-link"
        href={href}
        key={`${startIndex}-${urlText}`}
        rel="noreferrer"
        target="_blank"
        onClick={stopClickPropagation}
      >
        {formatUrlLabel(href)}
      </a>,
    );

    if (trailingPunctuation) {
      nodes.push(trailingPunctuation);
    }

    lastIndex = startIndex + rawMatch.length;
  }

  if (lastIndex === 0) {
    return text;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function normalizeUrl(urlText: string) {
  const href = urlText.toLowerCase().startsWith("www.") ? `https://${urlText}` : urlText;

  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function formatUrlLabel(href: string) {
  const hostname = new URL(href).hostname;
  return hostname.replace(/^www\./i, "");
}

function stopClickPropagation(event: MouseEvent<HTMLAnchorElement>) {
  event.stopPropagation();
}
