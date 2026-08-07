# Bible Study Kit for Vietnamese

This plugin aims to make Bible study easier and more productive for Vietnamese Christians (or anyone who is using the Bible in Vietnamese). The motivation behind this plugin is that I couldn't find any plugins supporting Vietnamese Bible translations.

> Whoever has my commands and keeps them is the one who loves me. The one who loves me will be loved by my Father, and I too will love them and show myself to them. John 14:21

## Installation

### Using BRAT

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from the Community Plugins in Obsidian
2. Open the command palette and run **BRAT: Add a beta plugin for testing**
3. Paste this repository URL: `https://github.com/tatthien/obsidian-bible-kit`
4. Click **Add Plugin**
5. In Settings > Community Plugins, refresh the list and enable **Bible Study for Vietnamese**

## Features

- **Inline scripture suggestions:** Type a trigger followed by a Bible reference, such as `--gi 3:16`, to insert the passage directly into the current note. Chapter references, individual verses, and verse ranges are supported.
- **Reference search:** Use the **Bible Kit: Search verses** command to look up a passage by reference and insert it at the cursor.
- **Full-text search:** Use the **Bible Kit: Full-text search** command to find verses by words or phrases and insert a selected result.
- **Scripture browser:** Open **Bible Kit: Browse Scripture** to browse by book, chapter, and verse in a dedicated sidebar view.
- **Multiple output formats:** Insert scripture as an Obsidian callout, blockquote, or normal inline HTML.
- **Configurable trigger:** Choose `--` or `@@` as the inline suggestion prefix in the plugin settings.
- **Local Bible database:** Select a local SQLite scripture database in the plugin settings; scripture content remains on your device.
- **Vietnamese Bible references:** Includes Vietnamese book names and abbreviations for all 66 books. See the [book abbreviation guide](./docs/BOOK_ABBREVIATION.md).

## License

[MIT](https://opensource.org/license/MIT)

Copyright (c) 2025, Thien Nguyen
