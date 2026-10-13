# Scrollbound (SillyTavern extension)

Bind the chat you have open into a book for your Kindle or e-reader (EPUB), or export it as HTML, Markdown or plain text, straight from SillyTavern. It runs entirely in the browser — no server plugin, Python or Calibre needed.

**Alpha.** Formerly “Chat to EPUB”; the internal settings key keeps the old name so remembered series numbers carry over.

## Use

Open a chat, then wand menu → **Export chat**. Pick a **Format**: EPUB (for Kindle and e-readers), HTML (one self-contained file that opens anywhere and prints to PDF), Markdown (`.md`) or plain text (`.txt`). Then fill in:

- **Title, author, language, description** — written into the EPUB's metadata (the HTML file uses title, author, language and cover).
- **Series and book number** — groups the books of one RP together in Calibre and on Kindle. It's remembered per character, and the next book number is filled in for you.
- **Cover** — pick a JPEG or PNG. It's embedded in the file, so it shows on the device.
- **Chapters** — start a new chapter every N messages (0 = one chapter).
- **Message range** — export just messages #N to #M (the numbers ST shows when User Settings → “Message IDs” is on), so a long chat can be cut into books at scene breaks without touching the chat. The next export of the same chat starts where the last range ended.
- **Speaker names**, and whether to repeat them on every message.
- **System / narrator notices** — off by default. This includes TunnelVision summary markers and tool-call notices, so they stay out of the book unless you turn this on.

Series, description and (for Markdown/text) cover and language only appear for the formats that use them. Your browser downloads the file. Author, language and the toggles are remembered for next time.

## What carries over

Markdown (`*italics*`, `**bold**`, quotes, lists, tables, code) is rendered with SillyTavern's own Markdown settings. Straight quotes become curly, `--` becomes an em dash, `...` becomes an ellipsis. Messages hidden from the AI (`/hide`) are still part of the story and are included. Hidden reasoning (`<think>` blocks) is stripped. Only the swipe you selected is used. Images inside messages are not included.

## Install

Copy this folder into `SillyTavern/data/<your-user>/extensions/chat-to-epub/` and reload SillyTavern.


## License

[WTFPL](LICENSE) — do what the fuck you want to.
