const { open, read, writeFile } = require('../utils/fs');
const { formatBufferInHex } = require('../utils/format');
const { imagePath, outputDirectory } = require('../constants/io');

const outputPaths = {
  hex: `${outputDirectory}/0-Boot-Hex.txt`,
  info: `${outputDirectory}/0-Boot-Info.txt`,
};

const bootSize = 1024;

module.exports.resolveBoot = async () => {
  console.log(''); // Add a newline for readability

  console.log('Resolving boot...');
  const fd = await open(imagePath);
  const buffer = Buffer.alloc(bootSize);
  await read(fd, buffer, 0, bootSize, 0);

  console.log('Formatting boot hex dump...');
  const formattedHexData = formatBufferInHex(buffer);
  await writeFile(outputPaths.hex, formattedHexData);
  console.log('Boot hex written to', outputPaths.hex);

  console.log('Boot resolved!');
  console.log(''); // Add a newline for readability
};
