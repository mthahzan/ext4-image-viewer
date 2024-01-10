const { mkdir, rmdir } = require('./utils/fs');

const { outputDirectory } = require('./constants/io');
const { resolveBoot } = require('./ext/00-boot');
const { resolvSuperblock } = require('./ext/01-superblock');
const { resolvBlockGroupDescriptorTable } = require('./ext/02-bgdt');

const cleanDirectories = async () => {
  console.log('Cleaning directories...');
  await rmdir(outputDirectory);
  await mkdir(outputDirectory);

  await mkdir(`${outputDirectory}/BlockGroup-0`);
  await mkdir(`${outputDirectory}/BlockGroup-1`);
  await mkdir(`${outputDirectory}/BlockGroup-2`);
  await mkdir(`${outputDirectory}/BlockGroup-3`);
  console.log('Directories cleaned!');
}

const runActions = async () => {
  await cleanDirectories();
  await resolveBoot();
  await resolvSuperblock();
  await resolvBlockGroupDescriptorTable();
};

runActions();
