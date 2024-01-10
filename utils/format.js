module.exports.formatBufferInHex = function bufferToHex(buffer) {
  let hexStr = '';

  for (let i = 0; i < buffer.length; i++) {
    // Add a byte to the string
    hexStr += buffer[i].toString(16).padStart(2, '0');

    // Add an extra space after every second byte
    hexStr += (i % 2 === 1) ? '  ' : '';

    // Add a newline after every 8 bytes
    if ((i + 1) % 16 === 0) hexStr += '\n';
  }

  return hexStr.trim();
};

module.exports.formatInfo = function printInfo(info, config = { labelPad: 30, hexPad: 15, valuePad: 20 }) {
  const labelPad = config?.labelPad ?? 30;
  const hexPad = config?.hexPad ?? 15;
  const valuePad = config?.valuePad ?? 15;

  let infoStr = `| ${'LABEL'.padEnd(labelPad)} | ${'HEXADECIMAL'.padEnd(hexPad)} | ${'VALUE'.padEnd(valuePad)} |\n`;
  infoStr += `|-${'-'.repeat(labelPad)}-+-${'-'.repeat(hexPad)}-+-${'-'.repeat(valuePad)}-|\n`;

  for (const [key, value] of Object.entries(info)) {
    const label = value.label.padEnd(labelPad);
    const hexValue = `0x${value.hex}`.padStart(hexPad);
    const printValue = `${value.value}`.padStart(valuePad);

    infoStr += `| ${label} | ${hexValue} | ${printValue} |\n`;
  }

  return infoStr.trim();
};
