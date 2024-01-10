# EXT4 Image info viewer

**WARNING** This is an experimental tool that I developed as part of my MSc. assignment. This has many limitations and assumptions. Not to mention my limited knowledge of the intricacies of the EXT4 file system. Use with caution and please verify the outputs you get.

This script can be useful to get lower level information about an EXT4 image.

## Requirements

- NodeJS
- Yarn

## Installation

This is not ready to be published as a standalone package, so you can clone the repository and run it locally.

```bash
git clone git@github.com:mthahzan/ext4-image-viewer.git
cd ext4-image-viewer
```

Then update the `constants/io.js` and `constants/image.js` files with the correct values.

## Usage

```bash
yarn start
```

This should yield the outputs as shown on the screenshot

<img width="301" alt="Screenshot 2024-01-10 at 11 45 16" src="https://github.com/mthahzan/ext4-image-viewer/assets/5820988/d3332701-2239-4cfb-bdbe-52a98d5e79a2">
