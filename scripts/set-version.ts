/*
Set version in package.json to a specific value given as a parameter.
Accepts version number with or without "v" prefix.

Usage: npm run set-version v1.0.1
*/

import fs from 'fs';

const VERSION_REGEX = /^v?([0-9]\.[0-9]\.[0-9])$/;

const [rawVersion] = process.argv.slice(-1);
if (!rawVersion) {
  throw new Error("Missing version");
}

const matches = rawVersion.match(VERSION_REGEX);
if (matches === null) {
  throw new Error("Invalid version");
}
const version = matches[1];

const rawJSON = fs.readFileSync('package.json', 'utf-8');
const packageJSON = JSON.parse(rawJSON);

if (packageJSON.version === version) {
  console.log(`Version is already ${version}`);
  process.exit(0);
}

packageJSON.version = version;
const encoded = `${JSON.stringify(packageJSON, null, 2)}\n`;
fs.writeFileSync('package.json', encoded);
