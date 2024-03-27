import { readdir, readFile, lstat, rm } from 'node:fs/promises'
import path from 'node:path'
import fs from 'node:fs'

const distDir = process.argv[2]

async function findNodeModulesDir(dir: string) {
  const files = await readdir(dir)
  const findDir: string[] = []
  for (let i = 0; i < files.length; i++) {
    const dirName = files[i];
    if (dirName.startsWith('.')) {
      continue
    }

    if (dirName === 'node_modules') {
      const lockFilePath = path.join(dir, dirName, '.package-lock.json')
      const packageFilePath = path.join(dir, 'package.json')
      if (fs.existsSync(lockFilePath) && fs.existsSync(packageFilePath)) {
        try {
          const lockFile = await readFile(lockFilePath, 'utf-8')
          const packageFile = await readFile(packageFilePath, 'utf-8')
          const lockFileObj = JSON.parse(lockFile)
          const packageFileObj = JSON.parse(packageFile)
          if (lockFileObj.name === packageFileObj.name) {
            findDir.push(path.join(dir, dirName))
          }
        } catch (error) {

        }
      }
    } else {
      const childDir = path.join(dir, dirName)
      const dirStat = await lstat(childDir)

      if (dirStat.isDirectory()) {
        findDir.push(...(await findNodeModulesDir(childDir)))
      }
    }
  }
  return findDir
}

async function main() {
  console.time('use time')
  console.time('findDir')
  const findDir = await findNodeModulesDir(distDir)
  console.timeEnd('findDir')
  console.log('findDir', findDir)
  for (let i = 0; i < findDir.length; i++) {
    const dir = findDir[i];
    await rm(dir, { recursive: true })
  }
  console.timeEnd('use time')
}

(async () => {
  await main()
})()


