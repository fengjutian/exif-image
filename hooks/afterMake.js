
import fs from 'fs';
import path from 'path';
export default async (_, config) => {
  const localesDir = path.join(config.dir, 'out/*/win-unpacked/locales');
  const keep = /zh-CN\.pak$/;
  fs.readdirSync(localesDir)
    .filter(f => !keep.test(f))
    .forEach(f => fs.unlinkSync(path.join(localesDir, f)));
};