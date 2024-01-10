module.exports.chunk = (byteArray, offset, length) => {
  return byteArray.slice(offset, offset + length);
};

module.exports.readUInt = (byteArray, offset, length) => {
  return byteArray.readUIntLE(offset, length);
};

module.exports.readUInt32LE = (byteArray) => {
  return byteArray.readUInt32LE(0);
};

module.exports.readUInt16LE = (byteArray) => {
  return byteArray.readUInt16LE(0);
};

