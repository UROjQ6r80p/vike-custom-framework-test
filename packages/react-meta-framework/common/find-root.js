import fs from 'node:fs';
import path from 'node:path';

function findRoot(dir) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
        return dir;
    }
    // console.log(dir)
    const parentDir = path.resolve(dir, '..');
    if (dir === parentDir) {
        return null;
    }
    return findRoot(parentDir);
}

export default findRoot;