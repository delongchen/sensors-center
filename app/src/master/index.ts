import { readFile } from 'node:fs/promises'


const main = async () => {
  await readFile('index.html', 'utf8');
}

export default main
