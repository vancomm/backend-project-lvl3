import os from 'os';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import nock from 'nock';
import pageLoader from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const fixturePath = getFixturePath('sample.html');

const url = new URL('https://sample.com/path/to/site.html');

const dirprefix = path.join(os.tmpdir(), 'page-loader-');
const filename = 'sample-com-path-to-site.html';

let expected;
let dirpath;
let filepath;

beforeEach(async () => {
  expected = await fs.readFile(fixturePath, 'utf-8');

  dirpath = await fs.mkdtemp(dirprefix);
  filepath = path.join(dirpath, filename);
});

test('stuff', async () => {
  const scope = nock(url.origin)
    .get(url.pathname)
    .reply(200, expected);

  const result = await pageLoader(url, dirpath);
  const actual = await fs.readFile(result, 'utf-8');

  expect(scope.isDone()).toBe(true);
  expect(result).toEqual(filepath);
  expect(actual).toEqual(expected);
});
