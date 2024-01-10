const { open, read, writeFile } = require('../utils/fs');
const { chunk, readUInt } = require('../utils/buffer');
const { formatBufferInHex, formatInfo } = require('../utils/format');
const { imagePath, outputDirectory } = require('../constants/io');

const outputPaths = {
  hex: `${outputDirectory}/1-Superblock-Hex.txt`,
  info: `${outputDirectory}/1-Superblock-Info.txt`,
};

const bootSize = 1024;
const superblockOffset = bootSize;
const superblockSize = 1024;

const bufferToInfo = (buffer) => {
  return {
    'Total inode count': {
      label: 'Total inode count',
      value: readUInt(buffer, 0, 4),
      hex: chunk(buffer, 0, 4).toString('hex'),
    },
    'Total block count': {
      label: 'Total block count',
      value: readUInt(buffer, 4, 4),
      hex: chunk(buffer, 4, 4).toString('hex'),
    },
    'Reserved block count': {
      label: 'Reserved block count',
      value: readUInt(buffer, 8, 4),
      hex: chunk(buffer, 8, 4).toString('hex'),
    },
    'Free block count': {
      label: 'Free block count',
      value: readUInt(buffer, 12, 4),
      hex: chunk(buffer, 12, 4).toString('hex'),
    },
    'Free inode count': {
      label: 'Free inode count',
      value: readUInt(buffer, 16, 4),
      hex: chunk(buffer, 16, 4).toString('hex'),
    },
    'First data block': {
      label: 'First data block',
      value: readUInt(buffer, 20, 4),
      hex: chunk(buffer, 20, 4).toString('hex'),
    },
    'Block size': {
      label: 'Block size',
      value: 1024 << readUInt(buffer, 24, 4),
      hex: chunk(buffer, 24, 4).toString('hex'),
    },
    'Fragment size': {
      label: 'Fragment size',
      value: 1024 << readUInt(buffer, 28, 4),
      hex: chunk(buffer, 28, 4).toString('hex'),
    },
    'Blocks per group': {
      label: 'Blocks per group',
      value: readUInt(buffer, 32, 4),
      hex: chunk(buffer, 32, 4).toString('hex'),
    },
    'Fragments per group': {
      label: 'Fragments per group',
      value: readUInt(buffer, 36, 4),
      hex: chunk(buffer, 36, 4).toString('hex'),
    },
    'Inodes per group': {
      label: 'Inodes per group',
      value: readUInt(buffer, 40, 4),
      hex: chunk(buffer, 40, 4).toString('hex'),
    },
    'Mount time': {
      label: 'Mount time',
      value: readUInt(buffer, 44, 4),
      hex: chunk(buffer, 44, 4).toString('hex'),
    },
    'Write time': {
      label: 'Write time',
      value: readUInt(buffer, 48, 4),
      hex: chunk(buffer, 48, 4).toString('hex'),
    },
    'Mount count': {
      label: 'Mount count',
      value: readUInt(buffer, 52, 2),
      hex: chunk(buffer, 52, 2).toString('hex'),
    },
    'Maximal mount count': {
      label: 'Maximal mount count',
      value: readUInt(buffer, 54, 2),
      hex: chunk(buffer, 54, 2).toString('hex'),
    },
    'Magic signature': {
      label: 'Magic signature',
      value: readUInt(buffer, 56, 2).toString(16),
      hex: chunk(buffer, 56, 2).toString('hex'),
    },
    'File system state': {
      label: 'File system state',
      value: readUInt(buffer, 58, 2),
      hex: chunk(buffer, 58, 2).toString('hex'),
    },
    'Behaviour when detecting errors': {
      label: 'Behaviour when detecting errors',
      value: readUInt(buffer, 60, 2),
      hex: chunk(buffer, 60, 2).toString('hex'),
    },
    'Minor revision level': {
      label: 'Minor revision level',
      value: readUInt(buffer, 62, 2),
      hex: chunk(buffer, 62, 2).toString('hex'),
    },
    'Last check': {
      label: 'Last check',
      value: readUInt(buffer, 64, 4),
      hex: chunk(buffer, 64, 4).toString('hex'),
    },
    'Maximal time between checks': {
      label: 'Maximal time between checks',
      value: readUInt(buffer, 68, 4),
      hex: chunk(buffer, 68, 4).toString('hex'),
    },
    'OS': {
      label: 'OS',
      value: readUInt(buffer, 72, 4),
      hex: chunk(buffer, 72, 4).toString('hex'),
    },
    'Revision level': {
      label: 'Revision level',
      value: readUInt(buffer, 76, 4),
      hex: chunk(buffer, 76, 4).toString('hex'),
    },
    'Default uid for reserved blocks': {
      label: 'Default uid for reserved blocks',
      value: readUInt(buffer, 80, 2),
      hex: chunk(buffer, 80, 2).toString('hex'),
    },
    'Default gid for reserved blocks': {
      label: 'Default gid for reserved blocks',
      value: readUInt(buffer, 82, 2),
      hex: chunk(buffer, 82, 2).toString('hex'),
    },
    'First non-reserved inode': {
      label: 'First non-reserved inode',
      value: readUInt(buffer, 84, 4),
      hex: chunk(buffer, 84, 4).toString('hex'),
    },
    'Size of inode structure': {
      label: 'Size of inode structure',
      value: readUInt(buffer, 88, 2),
      hex: chunk(buffer, 88, 2).toString('hex'),
    },
    'Block group number of this superblock': {
      label: 'Block group number of this superblock',
      value: readUInt(buffer, 90, 2),
      hex: chunk(buffer, 90, 2).toString('hex'),
    },
    'Compatible feature set': {
      label: 'Compatible feature set',
      value: readUInt(buffer, 92, 4),
      hex: chunk(buffer, 92, 4).toString('hex'),
    },
    'Incompatible feature set': {
      label: 'Incompatible feature set',
      value: readUInt(buffer, 96, 4),
      hex: chunk(buffer, 96, 4).toString('hex'),
    },
    'Read-only compatible feature set': {
      label: 'Read-only compatible feature set',
      value: readUInt(buffer, 100, 4),
      hex: chunk(buffer, 100, 4).toString('hex'),
    },
    '128-bit uuid for volume': {
      label: '128-bit uuid for volume',
      value: chunk(buffer, 104, 16).toString('hex'),
      hex: chunk(buffer, 104, 16).toString('hex'),
    },
    'Volume name': {
      label: 'Volume name',
      value: chunk(buffer, 120, 16).toString().trim(),
      hex: chunk(buffer, 120, 16).toString('hex'),
    },
    // 'Directory where filesystem was last mounted': {
    //   label: 'Directory where filesystem was last mounted',
    //   value: chunk(buffer, 136, 264).toString('utf8'),
    //   hex: chunk(buffer, 136, 264).toString('hex'),
    // },
    'Algorithm usage bitmap': {
      label: 'Algorithm usage bitmap',
      value: readUInt(buffer, 264, 4),
      hex: chunk(buffer, 264, 4).toString('hex'),
    },
  };
};

module.exports.resolvSuperblock = async () => {
  console.log('Resolving superblock...');
  const fd = await open(imagePath);
  const buffer = Buffer.alloc(superblockSize);

  console.log('Reading superblock...');
  await read(fd, buffer, 0, superblockSize, superblockOffset);

  console.log('Formatting superblock hex dump...')
  const formattedHexData = formatBufferInHex(buffer);
  await writeFile(outputPaths.hex, formattedHexData);
  console.log('Superblock hex written to', outputPaths.hex);

  console.log('Resolving info from superblock hex dump...');
  const superblockInfo = bufferToInfo(buffer);
  const formattedInfo = formatInfo(superblockInfo, { labelPad: 40, hexPad: 40, valuePad: 40 });
  await writeFile(outputPaths.info, formattedInfo);
  console.log('Superblock info written to', outputPaths.info);

  console.log('Superblock resolved!');
  console.log(''); // Add a newline for readability
};
