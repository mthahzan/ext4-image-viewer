module.exports.chunk = (byteArray, offset, length) => {
  return byteArray.slice(offset, offset + length);
};

module.exports.readUInt = (byteArray, offset, length) => {
  return byteArray.readUIntLE(offset, length);
};
