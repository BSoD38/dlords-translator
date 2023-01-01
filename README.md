# dlords-translator

[Try it here!](https://dlords.tysil.io/)

This is a standalone tool I created to facilitate translation for the game "Dungeon Lords".

This is made for the C1.5 version of the game, otherwise known as the "Collector's Edition".
It should work on earlier versions of the game, but I'm not too sure about the MMXII/Steam versions.

## Technical info
### How does it work?
Dungeon Lords stores its text in external .DAT files. The files I know of and that can be parsed correctly 
are `mname.dat`, `iname.dat`, `pname.dat` and `D6STRING.DAT`.
There are other text files, `TEXTPAK.000` and `NPCDATA.PAK`, but `TEXTPAK.000` seems to store its text slightly
differently, making my tool fail, and `TEXTPAK.000` seems to pack several .DAT files together, with several metadata
chunks, making my tool fail.

For "normal" text files, the files are structured as such:

* The first 4 bytes of the file contains "magic bytes" about the file, probably its internal identifier. It must always be there.
* Then follows a chunk of metadata for each text entry in the file. Each text entry has an 8 byte metadata, with the
first 4 bytes containing the text's internal ID, and the other 4 bytes containing its offset within the file.
* After the metadata chunk, there's the actual text. It is encoded in ANSI/windows-1252 format. Each text entry is
separated NULL character (`0x00`). Each text entry is in the same order as the list of metadata.

The tool parses the file by first reading the metadata and storing each ID value. Then it parses the text and assigns
each ID to its corresponding text entry.

When re-encoding the file, the tool will rebuild the metadata chunk by calculating the offset of each entry, and map it
to the corresponding ID. After this, it will simply rebuild the text entries by encoding the strings back into ANSI,
and append a NULL character to each entry.

After this, the magic bytes, metadata chunk, and text chunk are merged into a single blob and downloaded on the computer
so it can be copied into the game's directory.

The game actually has a "file override" feature for these text files depending on the game language.
Each language has a prefix of some sort for each text file. For example, the prefix for French files is "f". The game
will load text files with the language prefix in priority if it is found (e.g. fmname.dat), then falls back to the 
original english version with no language prefix (e.g. mname.dat). Since I wrote this tool for the French version,
all files will be prefixed with "f" when downloaded. But feel free to rename the file to whatever you need.

### How was that done?
This is entirely done with standard web JavaScript/TypeScript and Vue 3. I slightly modified the 
[windows-1252 package](https://github.com/mathiasbynens/windows-1252) so it better caters to my needs for decoding and
re-encoding the text as unsigned 8-bit array buffers.

### Why?
Quite an important question, indeed!

The French version of Dungeon Lords is only half-translated. All NPC dialogue and quest objectives are in French, but
item names, NPC names, object names and monster names are still in English. I think that this sucks, so I wanted to
complete the work for them.

I also thought this would be a fun challenge, since I wanted to experiment with file manipulation in JavaScript.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
