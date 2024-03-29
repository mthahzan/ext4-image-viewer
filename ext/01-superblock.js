const { open, read, writeFile } = require('../utils/fs');
const { chunk, readUIntLE } = require('../utils/buffer');
const { formatBufferInHex, formatInfo } = require('../utils/format');
const { imagePath, outputDirectory } = require('../constants/io');
const { superblockOffset, superblockSize } = require('../constants/image');

const outputPaths = {
  hex: `${outputDirectory}/1-Superblock-Hex.txt`,
  info: `${outputDirectory}/1-Superblock-Info.txt`,
};

const bufferToInfo = (buffer) => {
  return {
    inodeCount: {
      label: 'Total inode count',
      value: readUIntLE(buffer, 0, 4),
      hex: chunk(buffer, 0, 4).toString('hex'),
    },
    blockCount: {
      label: 'Total block count',
      value: readUIntLE(buffer, 4, 4),
      hex: chunk(buffer, 4, 4).toString('hex'),
    },
    reservedBlockCount: {
      label: 'Reserved block count',
      value: readUIntLE(buffer, 8, 4),
      hex: chunk(buffer, 8, 4).toString('hex'),
    },
    freeBlockCount: {
      label: 'Free block count',
      value: readUIntLE(buffer, 12, 4),
      hex: chunk(buffer, 12, 4).toString('hex'),
    },
    freeInodeCount: {
      label: 'Free inode count',
      value: readUIntLE(buffer, 16, 4),
      hex: chunk(buffer, 16, 4).toString('hex'),
    },
    firstDataBlock: {
      label: 'First data block',
      value: readUIntLE(buffer, 20, 4),
      hex: chunk(buffer, 20, 4).toString('hex'),
    },
    blockSize: {
      label: 'Block size',
      value: 1024 << readUIntLE(buffer, 24, 4),
      hex: chunk(buffer, 24, 4).toString('hex'),
    },
    fragmentSize: {
      label: 'Fragment size',
      value: 1024 << readUIntLE(buffer, 28, 4),
      hex: chunk(buffer, 28, 4).toString('hex'),
    },
    blocksPerGroup: {
      label: 'Blocks per group',
      value: readUIntLE(buffer, 32, 4),
      hex: chunk(buffer, 32, 4).toString('hex'),
    },
    fragmentsPerGroup: {
      label: 'Fragments per group',
      value: readUIntLE(buffer, 36, 4),
      hex: chunk(buffer, 36, 4).toString('hex'),
    },
    inodesPerGroup: {
      label: 'Inodes per group',
      value: readUIntLE(buffer, 40, 4),
      hex: chunk(buffer, 40, 4).toString('hex'),
    },
    mountTime: {
      label: 'Mount time',
      value: readUIntLE(buffer, 44, 4),
      hex: chunk(buffer, 44, 4).toString('hex'),
    },
    writeTime: {
      label: 'Write time',
      value: readUIntLE(buffer, 48, 4),
      hex: chunk(buffer, 48, 4).toString('hex'),
    },
    mountCount: {
      label: 'Mount count',
      value: readUIntLE(buffer, 52, 2),
      hex: chunk(buffer, 52, 2).toString('hex'),
    },
    maximalMountCount: {
      label: 'Maximal mount count',
      value: readUIntLE(buffer, 54, 2),
      hex: chunk(buffer, 54, 2).toString('hex'),
    },
    magicSignature: {
      label: 'Magic signature',
      value: readUIntLE(buffer, 56, 2).toString(16),
      hex: chunk(buffer, 56, 2).toString('hex'),
    },
    fileSystemState: {
      label: 'File system state',
      value: readUIntLE(buffer, 58, 2),
      hex: chunk(buffer, 58, 2).toString('hex'),
    },
    errorBehaviour: {
      label: 'Behaviour when detecting errors',
      value: readUIntLE(buffer, 60, 2),
      hex: chunk(buffer, 60, 2).toString('hex'),
    },
    minorRevisionLevel: {
      label: 'Minor revision level',
      value: readUIntLE(buffer, 62, 2),
      hex: chunk(buffer, 62, 2).toString('hex'),
    },
    lastCheck: {
      label: 'Last check',
      value: readUIntLE(buffer, 64, 4),
      hex: chunk(buffer, 64, 4).toString('hex'),
    },
    maximalTimeBetweenChecks: {
      label: 'Maximal time between checks',
      value: readUIntLE(buffer, 68, 4),
      hex: chunk(buffer, 68, 4).toString('hex'),
    },
    os: {
      label: 'OS',
      value: readUIntLE(buffer, 72, 4),
      hex: chunk(buffer, 72, 4).toString('hex'),
    },
    revisionLevel: {
      label: 'Revision level',
      value: readUIntLE(buffer, 76, 4),
      hex: chunk(buffer, 76, 4).toString('hex'),
    },
    defaultUidForReservedBlocks: {
      label: 'Default uid for reserved blocks',
      value: readUIntLE(buffer, 80, 2),
      hex: chunk(buffer, 80, 2).toString('hex'),
    },
    defaultGidForReservedBlocks: {
      label: 'Default gid for reserved blocks',
      value: readUIntLE(buffer, 82, 2),
      hex: chunk(buffer, 82, 2).toString('hex'),
    },
    firstNonReservedInode: {
      label: 'First non-reserved inode',
      value: readUIntLE(buffer, 84, 4),
      hex: chunk(buffer, 84, 4).toString('hex'),
    },
    inodeStructureSize: {
      label: 'Size of inode structure',
      value: readUIntLE(buffer, 88, 2),
      hex: chunk(buffer, 88, 2).toString('hex'),
    },
    superblockBlockGroupNumber: {
      label: 'Block group number of this superblock',
      value: readUIntLE(buffer, 90, 2),
      hex: chunk(buffer, 90, 2).toString('hex'),
    },
    compatibleFeatureSet: {
      label: 'Compatible feature set',
      value: readUIntLE(buffer, 92, 4),
      hex: chunk(buffer, 92, 4).toString('hex'),
    },
    incompatibleFeatureSet: {
      label: 'Incompatible feature set',
      value: readUIntLE(buffer, 96, 4),
      hex: chunk(buffer, 96, 4).toString('hex'),
    },
    readOnlyCompatibleFeatureSet: {
      label: 'Read-only compatible feature set',
      value: readUIntLE(buffer, 100, 4),
      hex: chunk(buffer, 100, 4).toString('hex'),
    },
    volumeUuid: {
      label: '128-bit uuid for volume',
      value: chunk(buffer, 104, 16).toString('hex'),
      hex: chunk(buffer, 104, 16).toString('hex'),
    },
    volumeName: {
      label: 'Volume name',
      value: chunk(buffer, 120, 16).toString().trim(),
      hex: chunk(buffer, 120, 16).toString('hex'),
    },
    // lastMountedDirectory': {
    //   label: 'Directory where filesystem was last mounted',
    //   value: chunk(buffer, 136, 264).toString('utf8'),
    //   hex: chunk(buffer, 136, 264).toString('hex'),
    // },
    algorithmUsageBitmap: {
      label: 'Algorithm usage bitmap',
      value: readUIntLE(buffer, 264, 4),
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
