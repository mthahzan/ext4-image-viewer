const imageSize = 451 * 1024 * 1024;
const bootSize = 1024;
const superblockSize = 1024;
const numberOfBlockGroups = 4;
const blockSize = 4096;
const inodeRatio = 16384;
const inodeSize = 256;

module.exports.imageSize = imageSize;
module.exports.bootSize = bootSize;
module.exports.superblockOffset = bootSize;
module.exports.superblockSize = superblockSize;
module.exports.numberOfBlockGroups = numberOfBlockGroups;
module.exports.blockSize = blockSize;
module.exports.inodeRatio = inodeRatio;
module.exports.inodeSize = inodeSize;
