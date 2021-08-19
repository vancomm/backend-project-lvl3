import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';
import __dirname from '../src/dirname.js';
import pageLoader, { makeFileName } from '../index.js';

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

test.each([
  ['https://google.com', 'google-com.html'],
  ['https://sample.com/path/to/site.html', 'sample-com-path-to-site.html'],
  ['https://ru.hexlet.io/courses', 'ru-hexlet-io-courses.html'],
])('makeFileName: %s', (urlString, expectedFilename) => {
  const input = new URL(urlString);
  const actual = makeFileName(input);
  expect(actual).toEqual(expectedFilename);
});

test('pageLoader', async () => {
  const scope = nock(url.origin)
    .get(url.pathname)
    .reply(200, expected);

  const result = await pageLoader(url.toString(), dirpath);
  const actual = await fs.readFile(result, 'utf-8');

  expect(scope.isDone()).toBe(true);
  expect(result).toEqual(filepath);
  expect(actual).toEqual(expected);
});
