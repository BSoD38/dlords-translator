import { encode, decode } from "@/utils/windows-1252/windows-1252";
type MetadataTuple = [number, number][];
type Buffer = number[];

export class DLTextFile {
  // The first 4 bytes seem to be used to identify the file
  magicBytes = new Uint8Array(0x04);

  // The first part of the file is composed of a list of 32-bit, little-endian value tuples:
  // The first value is the internal identifier of the entry
  // The second value is the text offset of the entry
  // Each metadata tuple must be in the same order as the associated text entry

  // Second part of the file contains all the file's individual strings.
  // Each character is a single-byte windows-1252 character. Each text entry is separated by a NULL byte.

  // There is no clear separator between text offsets and definitions, so they must be input by the user
  textDefinitionOffset: number;

  // Processed file data in easy to manipulate array
  textEntries: DLTextEntry[] = [];

  get metadataLength(): number {
    // Number of entries * 8 bytes (metadata length for 1 entry) + metadata terminator (4 bytes)
    return this.textEntries.length * 0x08 + 0x04;
  }

  constructor(textPosition: number) {
    if ((textPosition - 0x04) % 0x08 !== 0) {
      throw new Error("You cannot have a metadata length that is non-dividable by 8!");
    }
    this.textDefinitionOffset = textPosition;
  }

  async readFile(file: File) {
    const data = await file.arrayBuffer();
    this.magicBytes = new Uint8Array(data.slice(0, 0x04));

    const metadata = this.splitMetadata(new Uint8Array(data.slice(0x04, this.textDefinitionOffset)));
    const strings = this.parseStrings(new Uint8Array(data.slice(this.textDefinitionOffset)));

    if (metadata.length !== strings.length) {
      throw new Error(
        `Strings VS metadata length mismatch! Metadata length: ${metadata.length}, strings length: ${strings.length}`
      );
    }

    for (const index in strings) {
      this.textEntries.push(new DLTextEntry(metadata[index][0], strings[index]));
    }
    console.log(this.textEntries);
  }

  littleEndianUint8ToUint32(bytes: Uint8Array): number {
    if (bytes.byteLength !== 0x04) {
      throw new Error("Can only convert 4 bytes into Uint32!");
    }
    const dataView = new DataView(bytes.buffer);
    return dataView.getUint32(0, true);
  }

  uint32ToLittleEndianUint8(value: number): Uint8Array {
    const dataView = new DataView(new Uint32Array(1).buffer);
    dataView.setUint32(0, value, true);
    return new Uint8Array(dataView.buffer);
  }

  splitMetadata(bytes: Uint8Array): MetadataTuple {
    // ID - offset
    const metadata: MetadataTuple = [];
    for (let i = 0; i < bytes.byteLength; i += 0x08) {
      metadata.push([
        this.littleEndianUint8ToUint32(bytes.slice(i, i + 0x04)),
        this.littleEndianUint8ToUint32(bytes.slice(i + 0x04, i + 0x08)),
      ]);
    }
    return metadata;
  }

  parseStrings(bytes: Uint8Array): string[] {
    const strings: string[] = [];
    let buffer: Buffer = [];

    for (const byte of bytes) {
      if (byte === 0x0) {
        strings.push(decode(new Uint8Array(buffer)));
        buffer = [];
        continue;
      }
      buffer.push(byte);
    }

    return strings;
  }

  encodeData(): Blob {
    const metadataBuffer: Uint8Array[] = [];
    const textBuffer: Uint8Array[] = [];
    let currentOffset = this.metadataLength;
    for (const textEntry of this.textEntries) {
      const currentMetadata = new Uint8Array(0x08);
      currentMetadata.set(this.uint32ToLittleEndianUint8(textEntry.id));
      currentMetadata.set(this.uint32ToLittleEndianUint8(currentOffset), 0x04);
      metadataBuffer.push(currentMetadata);

      const encodedText = encode(textEntry.text, { mode: "fatal" });
      const currentTextBuffer = new Uint8Array(encodedText.byteLength + 1);
      currentTextBuffer.set(encodedText, 0);
      currentTextBuffer.set([0x00], encodedText.byteLength);
      textBuffer.push(currentTextBuffer);
      currentOffset += currentTextBuffer.byteLength;
    }
    const metadata = mergeUint8Arrays(metadataBuffer);
    const text = mergeUint8Arrays(textBuffer);
    return new Blob([this.magicBytes, metadata, text], { type: "application/octet-stream" });
  }
}

export class DLTextEntry {
  public id: number;
  private _text: string = "";
  public isValid: boolean = true;
  public get text(): string {
    return this._text;
  }
  public set text(value: string) {
    // eslint-disable-next-line no-control-regex
    if (/^[\x00-\x7F\xA0-\xFF]+$/.test(value)) {
      this.isValid = true;
      this._text = value;
    } else {
      this.isValid = false;
    }
  }

  get byteLength(): number {
    // Length with null byte separator
    return this.text.length + 1;
  }

  constructor(id: number, text: string) {
    this.id = id;
    this.text = text;
  }
}

function mergeUint8Arrays(array: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const uint8Array of array) {
    totalLength += uint8Array.byteLength;
  }

  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const uint8Array of array) {
    merged.set(uint8Array, offset);
    offset += uint8Array.byteLength;
  }
  return merged;
}
