module.exports.chunk = (byteArray, offset, length) => {
  return byteArray.slice(offset, offset + length);
};

module.exports.readUInt = (byteArray, offset, length) => {
  return byteArray.readUIntLE(offset, length);
};

module.exports.readUIntLE = (byteArray, offset, length) => {
  let value = 0;

  // Ensure that the length is not greater than the number of available bytes
  if (offset + length > byteArray.length) {
    throw new Error("Attempt to read beyond the bounds of the array");
  }

  // Read each byte and construct the integer
  for (let i = 0; i < length; i++) {
    value += byteArray[offset + i] * Math.pow(256, i);
  }

  return value;
};
