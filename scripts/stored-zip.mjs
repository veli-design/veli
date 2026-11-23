/**
 * Build a store-method ZIP without a system `zip` binary.
 * Git for Windows ships `unzip` but not `zip`, so Windows pre-push fixtures
 * need a pure-Node archive that `unzip -p` can still read.
 *
 * @param {ReadonlyMap<string, Buffer | string> | Record<string, Buffer | string>} files
 */
export function createStoredZip(files) {
  const entries = [...(files instanceof Map ? files : Object.entries(files))].map(
    ([name, body]) => {
      if (
        typeof name !== 'string' ||
        name.length === 0 ||
        name.includes('\\') ||
        name.includes('/')
      ) {
        throw new Error(`[stored-zip] expected a single-segment file name, received "${name}"`);
      }
      const data = Buffer.isBuffer(body) ? body : Buffer.from(body, 'utf8');
      const nameBuf = Buffer.from(name, 'utf8');
      const crc = crc32(data);
      return { nameBuf, data, crc };
    },
  );

  if (entries.length === 0) throw new Error('[stored-zip] expected at least one file');

  const parts = [];
  let offset = 0;
  const centrals = [];

  for (const entry of entries) {
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0, 12);
    local.writeUInt32LE(entry.crc, 14);
    local.writeUInt32LE(entry.data.length, 18);
    local.writeUInt32LE(entry.data.length, 22);
    local.writeUInt16LE(entry.nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0, 14);
    central.writeUInt32LE(entry.crc, 16);
    central.writeUInt32LE(entry.data.length, 20);
    central.writeUInt32LE(entry.data.length, 24);
    central.writeUInt16LE(entry.nameBuf.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);

    parts.push(local, entry.nameBuf, entry.data);
    centrals.push(central, entry.nameBuf);
    offset += local.length + entry.nameBuf.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...parts, centralDirectory, end]);
}

function crc32(buffer) {
  let value = ~0;
  for (let index = 0; index < buffer.length; index += 1) {
    value ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
    }
  }
  return ~value >>> 0;
}
