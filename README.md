# Scrollbound (SillyTavern extension)

Bind the chat you have open into a book for your Kindle or e-reader, or export it as HTML, Markdown or plain text, straight from SillyTavern. It runs entirely in the browser: no server plugin, Python or Calibre needed.

**Alpha.** Formerly “Chat to EPUB”; the internal settings key keeps the old name so remembered series numbers carry over.

## Formats

| Format | Good for | Notes |
|---|---|---|
| **EPUB** | Kindle and other e-readers | Cover, series and book number, chapters, table of contents. |
| **HTML** | Reading on a laptop, printing, saving as PDF | One self-contained file: styles inline, cover embedded, dark mode, and print rules (use your browser's Print → Save as PDF). |
| **Markdown** (`.md`) | Pasting elsewhere, note apps, editing | Your messages' own Markdown, untouched, with a title, optional `## Part N` headings and speaker labels. |
| **Plain text** (`.txt`) | Anything at all | Formatting stripped, speaker names in capitals. |

## Use

Open a chat, then wand menu → **Export chat**. Pick a **Format**, then fill in:

- **Title and author**, plus **language** (EPUB and HTML).
- **Series, book number and description** (EPUB only). The series groups the books of one RP together in Calibre and on Kindle. It's remembered per character, and the next book number is filled in for you.
- **Cover** (EPUB and HTML): a JPEG or PNG. It's embedded in the file, so it shows on the device.
- **Chapters**: start a new chapter every N messages (0 = one chapter).
- **Message range**: export just messages #N to #M (the numbers ST shows when User Settings → “Message IDs” is on), so a long chat can be cut into books at scene breaks without touching the chat. The next export of the same chat starts where the last range ended.
- **Speaker names**, and whether to repeat them on every message.
- **System / narrator notices**: off by default. This includes TunnelVision summary markers and tool-call notices, so they stay out of the book unless you turn this on.

Your browser downloads the file. The format, author, language and the toggles are remembered for next time.

## What carries over

Markdown (`*italics*`, `**bold**`, quotes, lists, tables, code) is rendered with SillyTavern's own Markdown settings. In EPUB, HTML and plain text, straight quotes become curly, `--` becomes an em dash and `...` becomes an ellipsis; the Markdown export leaves your text exactly as written. Messages hidden from the AI (`/hide`) are still part of the story and are included. Hidden reasoning (`<think>` blocks) is stripped. Only the swipe you selected is used. Images inside messages are not included.

## Install

In SillyTavern, open **Extensions → Install extension** and paste this repository's URL, or copy this folder into `SillyTavern/data/<your-user>/extensions/scrollbound/` and reload SillyTavern.

## License

[WTFPL](LICENSE) — do what the fuck you want to.
