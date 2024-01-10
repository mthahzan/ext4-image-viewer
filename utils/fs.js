const fs = require('fs');

module.exports.mkdir = (path) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports.rmdir = (path) => {
  return new Promise((resolve, reject) => {
    fs.rm(path, { recursive: true }, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports.open = (path) => {
  return new Promise((resolve, reject) => {
    fs.open(path, 'r', (err, fd) => {
      if (err) reject(err);
      resolve(fd);
    });
  });
};

module.exports.read = (fd, buffer, offset, length, position) => {
  return new Promise((resolve, reject) => {
    fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
      if (err) reject(err);
      resolve({ bytesRead, buffer });
    });
  });
};

module.exports.writeFile = (path, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports.close = (fd) => {
  return new Promise((resolve, reject) => {
    fs.close(fd, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};
