// Plain-text, Markdown and single-file HTML exports. Same message rules as the EPUB
// build (epub.js); no DOM and no dependencies, so it runs in the browser and in Node tests.

import { isRealSystemMessage, THINK_RE } from './epub.js';
import { escapeXml, htmlToXhtml } from './xhtml.js';

const prettyName = (name) => String(name).replace(/_/g, ' ');

/** Messages that belong in the book, as { name, cls, raw } in order. */
function selectMessages(messages, { includeSystem = false } = {}) {
    const out = [];
    for (const msg of messages) {
        const raw = String(msg.mes ?? '').trim();
        if (!raw) continue;
        const isSystem = isRealSystemMessage(msg);
        if (isSystem && !includeSystem) continue;
        const text = raw.replace(THINK_RE, '').trim();
        if (!text) continue;
        out.push({
            name: msg.name || (msg.is_user ? 'You' : 'Character'),
            cls: isSystem ? 'system' : msg.is_user ? 'user' : 'char',
            raw: text,
        });
    }
    return out;
}

function chunk(list, size) {
    const n = size > 0 ? size : list.length || 1;
    const out = [];
    for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n));
    return out;
}

/** Name label shown before a message, or '' if the same speaker is continuing. */
function labeller({ showNames = true, nameEveryMessage = false }) {
    let last = null;
    return (m) => {
        const show = showNames && m.cls !== 'system' && (m.name !== last || nameEveryMessage);
        last = m.name;
        return show ? prettyName(m.name) : '';
    };
}

function htmlToPlain(html) {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n\n')
        .replace(/<li[^>]*>/gi, '- ')
        .replace(/<hr\s*\/?>/gi, '\n* * *\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

const toBytes = (s) => new TextEncoder().encode(s);

/** Markdown: the messages' own Markdown, untouched, with headings and speaker labels added. */
export function buildMarkdown({ messages, meta, options = {} }) {
    const sel = selectMessages(messages, options);
    if (!sel.length) throw new Error('This chat has no visible messages to export.');
    const label = labeller(options);
    const parts = [`# ${meta.title}`, `*${meta.author}*`];
    chunk(sel, options.chapterEvery).forEach((group, i) => {
        if (options.chapterEvery > 0) parts.push(`## Part ${i + 1}`);
        for (const m of group) {
            const name = label(m);
            const body = m.cls === 'system' ? m.raw.split('\n').map((l) => `> ${l}`).join('\n') : m.raw;
            parts.push(name ? `**${name}**\n\n${body}` : body);
        }
    });
    return { bytes: toBytes(parts.join('\n\n') + '\n'), count: sel.length };
}

/** Plain text: Markdown rendered, then stripped of formatting. */
export function buildText({ messages, meta, options = {}, markdownToHtml }) {
    const sel = selectMessages(messages, options);
    if (!sel.length) throw new Error('This chat has no visible messages to export.');
    const label = labeller(options);
    const parts = [meta.title, meta.author];
    chunk(sel, options.chapterEvery).forEach((group, i) => {
        if (options.chapterEvery > 0) parts.push(`PART ${i + 1}`);
        for (const m of group) {
            const name = label(m);
            const body = htmlToPlain(htmlToXhtml(markdownToHtml(m.raw)));
            if (!body) continue;
            const text = m.cls === 'system' ? `[${body}]` : body;
            parts.push(name ? `${name.toUpperCase()}\n${text}` : text);
        }
    });
    return { bytes: toBytes(parts.join('\n\n') + '\n'), count: sel.length };
}

const HTML_STYLE = `
body { font-family: Georgia, serif; line-height: 1.5; max-width: 42em; margin: 2em auto; padding: 0 1em; color: #222; background: #fdfcf9; }
h1.title { text-align: center; margin: 1.5em 0 0.2em; }
p.byline { text-align: center; font-style: italic; margin-bottom: 2em; }
h2 { text-align: center; margin: 2em 0 1em; }
nav.toc { margin: 0 0 2em; text-align: center; }
nav.toc a { margin: 0 0.5em; }
div.msg { margin: 0 0 1.1em; }
div.msg p { margin: 0 0 0.6em; }
p.speaker { font-variant: small-caps; font-weight: bold; letter-spacing: 0.04em; margin-bottom: 0.15em; }
div.user { margin-left: 1.2em; padding-left: 0.7em; border-left: 2px solid #888; }
div.system { text-align: center; font-style: italic; color: #555; }
blockquote { margin: 0.5em 1.2em; font-style: italic; }
pre, code { font-family: monospace; font-size: 0.9em; white-space: pre-wrap; }
hr { margin: 1.2em 30%; }
table { border-collapse: collapse; } td, th { border: 1px solid #888; padding: 0.2em 0.5em; }
img.cover { display: block; max-width: 18em; max-height: 28em; margin: 1em auto; }
@media (prefers-color-scheme: dark) { body { background: #1b1b1d; color: #ddd; } div.user { border-color: #777; } div.system { color: #aaa; } }
@media print { body { background: #fff; color: #000; max-width: none; } h2 { page-break-before: always; } }
`;

function toBase64(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
}

/** One self-contained HTML file: styles inline, cover embedded, dark mode and print rules included. */
export function buildHtml({ messages, meta, cover, options = {}, markdownToHtml }) {
    const sel = selectMessages(messages, options);
    if (!sel.length) throw new Error('This chat has no visible messages to export.');
    const label = labeller(options);
    const groups = chunk(sel, options.chapterEvery);
    const sections = [];
    let count = 0;
    groups.forEach((group, i) => {
        const msgs = [];
        for (const m of group) {
            const body = htmlToXhtml(markdownToHtml(m.raw));
            if (!body.replace(/<[^>]*>/g, '').trim()) continue;
            const name = label(m);
            const lbl = name ? `<p class="speaker">${escapeXml(name)}</p>\n` : '';
            msgs.push(`<div class="msg ${m.cls}">\n${lbl}${body}\n</div>`);
            count++;
        }
        const heading = options.chapterEvery > 0 ? `<h2 id="part-${i + 1}">Part ${i + 1}</h2>\n` : '';
        sections.push(`<section>\n${heading}${msgs.join('\n')}\n</section>`);
    });
    const toc = options.chapterEvery > 0 && groups.length > 1
        ? `<nav class="toc">${groups.map((_, i) => `<a href="#part-${i + 1}">Part ${i + 1}</a>`).join(' ')}</nav>\n`
        : '';
    let coverTag = '';
    if (cover && cover.bytes) {
        const png = cover.bytes[0] === 0x89;
        coverTag = `<img class="cover" alt="Cover" src="data:image/${png ? 'png' : 'jpeg'};base64,${toBase64(cover.bytes)}"/>\n`;
    }
    const lang = escapeXml(meta.language || 'en');
    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${escapeXml(meta.title)}</title><meta name="author" content="${escapeXml(meta.author)}"/>
<style>${HTML_STYLE}</style></head>
<body>
${coverTag}<h1 class="title">${escapeXml(meta.title)}</h1>
<p class="byline">${escapeXml(meta.author)}</p>
${toc}${sections.join('\n')}
</body>
</html>
`;
    return { bytes: toBytes(html), count };
}
