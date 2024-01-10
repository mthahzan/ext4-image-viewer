const { open, read, writeFile } = require('../utils/fs');
const { chunk, readUInt } = require('../utils/buffer');
const { formatBufferInHex, formatInfo } = require('../utils/format');
const { imagePath, outputDirectory } = require('../constants/io');
const { blockSize, inodeRatio, inodeSize, imageSize, numberOfBlockGroups } = require('../constants/image');

const outputPaths = {
  all: {
    hex: `${outputDirectory}/2-BGDT-Hex.txt`,
  },
  descriptor: {
    hex: (index) => `${outputDirectory}/BlockGroup-${index}/0-Descriptor-Hex.txt`,
    info: (index) => `${outputDirectory}/BlockGroup-${index}/0-Descriptor-Info.txt`,
  },
  blockBitmap: {
    hex: (index) => `${outputDirectory}/BlockGroup-${index}/1-BlockBitmap-Hex.txt`,
  },
  inodeBitmap: {
    hex: (index) => `${outputDirectory}/BlockGroup-${index}/2-InodeBitmap-Hex.txt`,
    info: (index) => `${outputDirectory}/BlockGroup-${index}/2-InodeBitmap-Info.txt`,
  },
  inodeTable: {
    hex: (index) => `${outputDirectory}/BlockGroup-${index}/3-InodeTable-Hex.txt`,
  },
  inode: {
    hex: (index, inodeIndex) => `${outputDirectory}/BlockGroup-${index}/4-Inode-${inodeIndex}-Hex.txt`,
    info: (index, inodeIndex) => `${outputDirectory}/BlockGroup-${index}/4-Inode-${inodeIndex}-Info.txt`,
  },
};

const bgdtOffset = blockSize;
const bgdtSize = blockSize;

const numberOfInodesPerBlockGroup = imageSize / inodeRatio / numberOfBlockGroups;
const inodeTableSize = inodeSize * numberOfInodesPerBlockGroup;

const bgdtBufferToInfo = (buffer) => {
  return {
    blockBitmapBlockLower: {
      label: 'Block bitmap block lower',
      value: readUInt(buffer, 0, 2),
      hex: chunk(buffer, 0, 2).toString('hex'),
    },
    blockBitmapBlockUpper: {
      label: 'Block bitmap block upper',
      value: readUInt(buffer, 2, 2),
      hex: chunk(buffer, 2, 2).toString('hex'),
    },
    // 'Block bitmap block': {
    //   label: 'Block bitmap block',
    //   value: readUInt(buffer, 0, 4),
    //   hex: chunk(buffer, 0, 4).toString('hex'),
    // },
    inodeBitmapBlockLower: {
      label: 'Inode bitmap block lower',
      value: readUInt(buffer, 4, 2),
      hex: chunk(buffer, 4, 2).toString('hex'),
    },
    inodeBitmapBlockUpper: {
      label: 'Inode bitmap block upper',
      value: readUInt(buffer, 6, 2),
      hex: chunk(buffer, 6, 2).toString('hex'),
    },
    // inodeBitmapBlock: {
    //   label: 'Inode bitmap block',
    //   value: readUInt(buffer, 4, 4),
    //   hex: chunk(buffer, 4, 4).toString('hex'),
    // },
    inodeTableBlockLower: {
      label: 'Inode table block lower',
      value: readUInt(buffer, 8, 2),
      hex: chunk(buffer, 8, 2).toString('hex'),
    },
    inodeTableBlockUpper: {
      label: 'Inode table block upper',
      value: readUInt(buffer, 10, 2),
      hex: chunk(buffer, 10, 2).toString('hex'),
    },
    // inodeTableBlock: {
    //   label: 'Inode table block',
    //   value: readUInt(buffer, 8, 4),
    //   hex: chunk(buffer, 8, 4).toString('hex'),
    // },
    freeBlockCountLower: {
      label: 'Free block count lower',
      value: readUInt(buffer, 12, 2),
      hex: chunk(buffer, 12, 2).toString('hex'),
    },
    freeBlockCountUpper: {
      label: 'Free block count upper',
      value: readUInt(buffer, 14, 2),
      hex: chunk(buffer, 14, 2).toString('hex'),
    },
    // freeBlockCount: {
    //   label: 'Free blocks count',
    //   value: readUInt(buffer, 12, 2),
    //   hex: chunk(buffer, 12, 2).toString('hex'),
    // },
    freeInodeCountLower: {
      label: 'Free inode count lower',
      value: readUInt(buffer, 16, 2),
      hex: chunk(buffer, 16, 2).toString('hex'),
    },
    freeInodeCountUpper: {
      label: 'Free inode count upper',
      value: readUInt(buffer, 18, 2),
      hex: chunk(buffer, 18, 2).toString('hex'),
    },
    // freeInodeCount: {
    //   label: 'Free inodes count',
    //   value: readUInt(buffer, 14, 2),
    //   hex: chunk(buffer, 14, 2).toString('hex'),
    // },
    usedDirectoryCountLower: {
      label: 'Used directory count lower',
      value: readUInt(buffer, 20, 2),
      hex: chunk(buffer, 20, 2).toString('hex'),
    },
    usedDirectoryCountUpper: {
      label: 'Used directory count upper',
      value: readUInt(buffer, 22, 2),
      hex: chunk(buffer, 22, 2).toString('hex'),
    },
    // usedDirectoryCount: {
    //   label: 'Used directories count',
    //   value: readUInt(buffer, 16, 2),
    //   hex: chunk(buffer, 16, 2).toString('hex'),
    // },
  };
};

const inodeExtentOfLeafNodeBufferToInfo = (buffer) => {
  const result = {};
  const entries = buffer.readUInt16LE(2);

  for (let i = 0; i < entries; i++) {
    const entryOffset = 12 + (i * 12);
    const block = {
      label: `Extent ${i + 1}: Logical block numbers`,
      value: readUInt(buffer, entryOffset, 4),
      hex: chunk(buffer, entryOffset, 4).toString('hex'),
    };
    const length = {
      label: `Extent ${i + 1}: No. of blocks`,
      value: readUInt(buffer, entryOffset + 4, 2),
      hex: chunk(buffer, entryOffset + 4, 2).toString('hex'),
    };
    const upper = {
      label: `Extent ${i + 1}: 1st block upper 16-bit`,
      value: readUInt(buffer, entryOffset + 6, 2),
      hex: chunk(buffer, entryOffset + 6, 2).toString('hex'),
    };
    const lower = {
      label: `Extent ${i + 1}: 1st block lower 32-bit`,
      value: readUInt(buffer, entryOffset + 8, 4),
      hex: chunk(buffer, entryOffset + 8, 4).toString('hex'),
    };

    result.block = block;
    result.length = length;
    result.upper = upper;
    result.lower = lower;
  }

  return result;
};

const inodeExtentOfIndexNodeBufferToInfo = (buffer) => {
  const result = {};
  const entries = buffer.readUInt16LE(2);

  for (let i = 0; i < entries; i++) {
    const entryOffset = 12 + (i * 12);
    const block = {
      label: `Extent index ${i + 1}: Block`,
      value: readUInt(buffer, entryOffset, 4),
      hex: chunk(buffer, entryOffset, 4).toString('hex'),
    };
    const leafNodeBlock = {
      label: `Extent index ${i + 1}: Leaf node block`,
      value: readUInt(buffer, entryOffset + 4, 4),
      hex: chunk(buffer, entryOffset + 4, 4).toString('hex'),
    };
    const start = {
      label: `Extent index ${i + 1}: Start`,
      value: readUInt(buffer, entryOffset + 8, 2),
      hex: chunk(buffer, entryOffset + 8, 2).toString('hex'),
    };

    result[`Extent index ${i + 1}: Block`] = block;
    result[`Extent index ${i + 1}: Leaf node block`] = leafNodeBlock;
    result[`Extent index ${i + 1}: Start`] = start;
  }

  return result;
};

const inodeTableBufferToInfo = (buffer) => {
  const iblockBuffer = buffer.slice(40, 88);
  const iblockExtentHeaderBuffer = iblockBuffer.slice(0, 12);

  let result = {
    mode: {
      label: 'Mode',
      value: readUInt(buffer, 0, 2),
      hex: chunk(buffer, 0, 2).toString('hex'),
    },
    ownerUid: {
      label: 'Owner UID',
      value: readUInt(buffer, 2, 2),
      hex: chunk(buffer, 2, 2).toString('hex'),
    },
    size: {
      label: 'Size',
      value: readUInt(buffer, 4, 4),
      hex: chunk(buffer, 4, 4).toString('hex'),
    },
    accessTime: {
      label: 'Access time',
      value: readUInt(buffer, 8, 4),
      hex: chunk(buffer, 8, 4).toString('hex'),
    },
    createdTime: {
      label: 'Creation time',
      value: readUInt(buffer, 12, 4),
      hex: chunk(buffer, 12, 4).toString('hex'),
    },
    modifiedTime: {
      label: 'Modification time',
      value: readUInt(buffer, 16, 4),
      hex: chunk(buffer, 16, 4).toString('hex'),
    },
    deletedTime: {
      label: 'Deletion time',
      value: readUInt(buffer, 20, 4),
      hex: chunk(buffer, 20, 4).toString('hex'),
    },
    groupId: {
      label: 'Group ID',
      value: readUInt(buffer, 24, 2),
      hex: chunk(buffer, 24, 2).toString('hex'),
    },
    hardLinkCount: {
      label: 'Hard link count',
      value: readUInt(buffer, 26, 2),
      hex: chunk(buffer, 26, 2).toString('hex'),
    },
    'Lower 32-bits of block count': {
      label: 'Lower 32-bits of block count',
      value: readUInt(buffer, 28, 4),
      hex: chunk(buffer, 28, 4).toString('hex'),
    },
    'Flags': {
      label: 'Flags',
      value: readUInt(buffer, 32, 4),
      hex: chunk(buffer, 32, 4).toString('hex'),
    },
    'OS specific value 1': {
      label: 'OS specific value 1',
      value: readUInt(buffer, 36, 4),
      hex: chunk(buffer, 36, 4).toString('hex'),
    },

    // struct ext4_extent_header {
    //   __le16  eh_magic;       /* probably will support different formats */
    //   __le16  eh_entries;     /* number of valid entries */
    //   __le16  eh_max;         /* capacity of store in entries */
    //   __le16  eh_depth;       /* has tree real underlying blocks? */ 
    //   __le32  eh_generation;  /* generation of the tree */ 
    // };
    'Extent header: Magic signature': {
      label: 'Extent header: Magic signature',
      value: chunk(iblockExtentHeaderBuffer, 0, 2).toString('hex'),
      hex: chunk(iblockExtentHeaderBuffer, 0, 2).toString('hex'),
    },
    'Extent header: Number of entries': {
      label: 'Extent header: Number of entries',
      value: readUInt(iblockExtentHeaderBuffer, 2, 2),
      hex: chunk(iblockExtentHeaderBuffer, 2, 2).toString('hex'),
    },
    'Extent header: Max no. of entries': {
      label: 'Extent header: Capacity of entries',
      value: readUInt(iblockExtentHeaderBuffer, 4, 2),
      hex: chunk(iblockExtentHeaderBuffer, 4, 2).toString('hex'),
    },
    'Extent header: Depth': {
      label: 'Extent header: Depth',
      value: readUInt(iblockExtentHeaderBuffer, 6, 2),
      hex: chunk(iblockExtentHeaderBuffer, 6, 2).toString('hex'),
    },
    'Extent header: Generation': {
      label: 'Extent header: Generation',
      value: readUInt(iblockExtentHeaderBuffer, 8, 4),
      hex: chunk(iblockExtentHeaderBuffer, 8, 4).toString('hex'),
    },
  };

  // Checking if this is leaf node
  // When the depth is zero, then the entries are ext4_extents otherwise ext4_extent_idxs
  // Extents are arranged as a tree. Each node of the tree begins with a struct ext4_extent_header. If the node is an interior node (eh.eh_depth > 0), the header is followed by eh.eh_entries instances of struct ext4_extent_idx; each of these index entries points to a block containing more nodes in the extent tree. If the node is a leaf node (eh.eh_depth == 0), then the header is followed by eh.eh_entries instances of struct ext4_extent; these instances point to the file's data blocks. The root node of the extent tree is stored in inode.i_block, which allows for the first four extents to be recorded without the use of extra metadata blocks.
  // https://www.kernel.org/doc/html/latest/filesystems/ext4/ifork.html
  const depth = buffer.readUInt16LE(6);
  console.log('depth', depth);
  if (depth === 0) {
    result = {
      ...result,
      ...inodeExtentOfLeafNodeBufferToInfo(iblockBuffer),
    };
  } else {
    result = {
      ...result,
      ...inodeExtentOfIndexNodeBufferToInfo(iblockBuffer),
    };
  }

  result = {
    ...result,
    'File version': {
      label: 'File version',
      value: readUInt(buffer, 104, 4),
      hex: chunk(buffer, 104, 4).toString('hex'),
    },
    'File ACL': {
      label: 'File ACL',
      value: readUInt(buffer, 108, 4),
      hex: chunk(buffer, 108, 4).toString('hex'),
    },
    'File size upper': {
      label: 'File size upper',
      value: readUInt(buffer, 112, 4),
      hex: chunk(buffer, 112, 4).toString('hex'),
    },
    // 'Fragment address': {
    //   label: 'Fragment address',
    //   value: readUInt(buffer, 116, 4),
    // },
    // 'Union of file ACL and fragment address': {
    //   label: 'Union of file ACL and fragment address',
    //   value: readUInt(buffer, 120, 4),
    // },
    // 'Union of file ACL and fragment address': {
    //   label: 'Union of file ACL and fragment address',
    //   value: readUInt(buffer, 124, 4),
    // },
    // 'Union of file ACL and fragment address': {
    //   label: 'Union of file ACL and fragment address',
    //   value: readUInt(buffer, 128, 4),
    // },
    'Extra size': {
      label: 'Extra size',
      value: readUInt(buffer, 128, 2),
      hex: chunk(buffer, 128, 2).toString('hex'),
    },
    'Upper 16-bits of the inode checksum': {
      label: 'Upper 16-bits of the inode checksum',
      value: readUInt(buffer, 134, 2),
      hex: chunk(buffer, 134, 2).toString('hex'),
    },
    'Extra change time bits': {
      label: 'Extra change time bits',
      value: readUInt(buffer, 136, 4),
      hex: chunk(buffer, 136, 4).toString('hex'),
    },
    'Extra modification time bits': {
      label: 'Extra modification time bits',
      value: readUInt(buffer, 140, 4),
      hex: chunk(buffer, 140, 4).toString('hex'),
    },
    'Extra access time bits': {
      label: 'Extra access time bits',
      value: readUInt(buffer, 144, 4),
      hex: chunk(buffer, 144, 4).toString('hex'),
    },
    'File creation time': {
      label: 'File creation time',
      value: readUInt(buffer, 148, 4),
      hex: chunk(buffer, 148, 4).toString('hex'),
    },
    'Extra file creation time bits': {
      label: 'Extra file creation time bits',
      value: readUInt(buffer, 152, 4),
      hex: chunk(buffer, 152, 4).toString('hex'),
    },
    'Upper 32-bits for version number': {
      label: 'Upper 32-bits for version number',
      value: readUInt(buffer, 156, 4),
      hex: chunk(buffer, 156, 4).toString('hex'),
    },
    'Project ID': {
      label: 'Project ID',
      value: readUInt(buffer, 160, 4),
      hex: chunk(buffer, 160, 4).toString('hex'),
    },
  };

  return result;
};

module.exports.resolvBlockGroupDescriptorTable = async () => {
  console.log('Resolving block group descriptor table...');
  const fd = await open(imagePath);
  const buffer = Buffer.alloc(bgdtSize);

  console.log('Reading block group descriptor table...');
  await read(fd, buffer, 0, bgdtSize, bgdtOffset);

  console.log('Formatting block group descriptor table hex dump...')
  const formattedHexData = formatBufferInHex(buffer);
  await writeFile(outputPaths.all.hex, formattedHexData);
  console.log('block group descriptor table hex written to', outputPaths.all.hex);

  console.log('Resolving block group descriptors...');
  const blockGroupDescriptors = [];
  const blockGroupDescriptorInfos = [];
  for (let i = 0; i < 1; i++) {
    console.log(''); // Add a newline for readability
    const blockGroupDescriptor = chunk(buffer, i * 64, 64);

    console.log(`Writing block group descriptor ${i} hex...`);
    const formattedHexData = formatBufferInHex(blockGroupDescriptor);
    await writeFile(`${outputPaths.descriptor.hex(i)}`, formattedHexData);
    console.log(`block group descriptor ${i} hex written to ${outputPaths.descriptor.hex(i)}`);

    console.log(`Resolving block group descriptor ${i} info...`);
    const blockGroupDescriptorInfo = bgdtBufferToInfo(blockGroupDescriptor);
    const formattedInfo = formatInfo(blockGroupDescriptorInfo);
    await writeFile(`${outputPaths.descriptor.info(i)}`, formattedInfo);
    console.log(`block group descriptor ${i} info written to ${outputPaths.descriptor.info(i)}`);

    console.log(`Resolving block group ${i} block bitmap...`);
    // const blockBitmapOffset = blockGroupDescriptorInfo.blockBitmapBlock.value * blockSize;
    const blockBitmapOffset = blockGroupDescriptorInfo.blockBitmapBlockLower.value * blockSize;
    const blockBitmapSize = blockSize;
    const blockBitmapBuffer = Buffer.alloc(blockBitmapSize);
    await read(fd, blockBitmapBuffer, 0, blockBitmapSize, blockBitmapOffset);
    const formattedBlockBitmapHexData = formatBufferInHex(blockBitmapBuffer);
    await writeFile(`${outputPaths.blockBitmap.hex(i)}`, formattedBlockBitmapHexData);
    console.log(`block group ${i} block bitmap hex written to ${outputPaths.blockBitmap.hex(i)}`);

    console.log(`Resolving block group ${i} inode bitmap...`);
    // const inodeBitmapOffset = blockGroupDescriptorInfo.inodeBitmapBlock.value * blockSize;
    const inodeBitmapOffset = blockGroupDescriptorInfo.inodeBitmapBlockLower.value * blockSize;
    const inodeBitmapSize = blockSize;
    const inodeBitmapBuffer = Buffer.alloc(inodeBitmapSize);
    await read(fd, inodeBitmapBuffer, 0, inodeBitmapSize, inodeBitmapOffset);
    const formattedInodeBitmapHexData = formatBufferInHex(inodeBitmapBuffer);
    await writeFile(`${outputPaths.inodeBitmap.hex(i)}`, formattedInodeBitmapHexData);
    console.log(`block group ${i} inode bitmap hex written to ${outputPaths.inodeBitmap.hex(i)}`);

    console.log(`Resolving block group ${i} inode table...`);
    // const inodeTableOffset = blockGroupDescriptorInfo.inodeTableBlock.value * blockSize;
    const inodeTableOffset = blockGroupDescriptorInfo.inodeTableBlockLower.value * blockSize;
    // const inodeTableSize = blockSize * 4;
    const inodeTableBuffer = Buffer.alloc(inodeTableSize);
    await read(fd, inodeTableBuffer, 0, inodeTableSize, inodeTableOffset);
    const formattedInodeTableHexData = formatBufferInHex(inodeTableBuffer);
    await writeFile(`${outputPaths.inodeTable.hex(i)}`, formattedInodeTableHexData);
    console.log(`block group ${i} inode table hex written to ${outputPaths.inodeTable.hex(i)}`);

    console.log(`Resolving block group ${i} inode table info...`);
    // For some reason the 8xx block fails to resolve inode table info
    // For the purpose of this assignment we will only resolve the first 500 inodes
    // TODO: Fix this issue
    for (let j = 0; j < Math.min(numberOfInodesPerBlockGroup, 500); j++) {
      console.log(`Resolving block group ${i} inode ${j + 1} info...`);
      const inodeOffset = j * inodeSize;
      const inodeBuffer = chunk(inodeTableBuffer, inodeOffset, inodeSize);

      // Checking if the inode is empty
      if (inodeBuffer.readUInt16LE(0) === 0) {
        console.log(`block group ${i} inode ${j} is empty, skipping...`);
        continue;
      }

      const formattedInodeHexData = formatBufferInHex(inodeBuffer);
      await writeFile(`${outputPaths.inode.hex(i, j + 1)}`, formattedInodeHexData);
      console.log(`block group ${i} inode ${j + 1} hex written to ${outputPaths.inode.hex(i, j)}`);

      const inodeInfo = inodeTableBufferToInfo(inodeBuffer);
      const formattedInfo = formatInfo(inodeInfo, { labelPad: 50 });

      await writeFile(`${outputPaths.inode.info(i, j + 1)}`, formattedInfo);
      console.log(`block group ${i} inode ${j + 1} info written to ${outputPaths.inode.info(i, j)}`);
      console.log(''); // Add a newline for readability
    }
    console.log(`block group ${i} inode table info written to ${outputPaths.inode.info(i)}`);

    // const fileBlockBuffer = Buffer.alloc(blockSize);
    // const fileBlockOffset = 33282 * blockSize;
    // await read(fd, fileBlockBuffer, 0, blockSize, fileBlockOffset);
    // const formattedFileBlockHexData = formatBufferInHex(fileBlockBuffer);
    // await writeFile(`./outputs/FILE.txt`, formattedFileBlockHexData);

    blockGroupDescriptors.push(blockGroupDescriptor);
    blockGroupDescriptorInfos.push(blockGroupDescriptorInfo);
    console.log(''); // Add a newline for readability
  }

  // console.log('Resolving info from block group descriptor table hex dump...');
  // const block group descriptor tableInfo = bufferToInfo(buffer);
  // const formattedInfo = formatInfo(block group descriptor tableInfo);
  // await writeFile(outputPaths.info, formattedInfo);
  // console.log('block group descriptor table info written to', outputPaths.info);

  console.log('block group descriptor table resolved!');
  console.log(''); // Add a newline for readability
};
