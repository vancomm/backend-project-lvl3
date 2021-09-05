/* eslint-disable jest/no-commented-out-tests */
import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import nock from 'nock';
import __dirname from '../src/dirname.js';
import pageLoader from '../index.js';

const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);

const dirprefix = path.join(os.tmpdir(), 'page-loader-');

let dirpath;

beforeEach(async () => {
  dirpath = await fs.mkdtemp(dirprefix);
});

test.each([
  ['basic', 'https://sample.com/path/to/site.html', 'sample-com-path-to-site.html'],
  ['hexlet', 'https://ru.hexlet.io/courses', 'ru-hexlet-io-courses.html'],
])('pageLoader: %s', async (fixtureName, urlString, filename) => {
  const url = new URL(urlString);
  const expected = path.join(dirpath, filename);

  const inputPath = getFixturePath(`${fixtureName}-input.html`);
  const input = await fs.readFile(inputPath, 'utf-8');
  const scope = nock(url.origin)
    .get(url.pathname)
    .reply(200, input);

  const pathRegex = new RegExp(`${path.dirname(url.pathname)}.*`, 'g');
  const filesScope = nock(url.origin)
    .get(pathRegex)
    .reply(200, '000000000');

  const actual = await pageLoader(url.toString(), dirpath);
  // console.log(actual);
  expect(scope.isDone()).toBe(true);
  expect(filesScope.isDone()).toBe(true);
  expect(actual).toEqual(expected);

  const actualSide = await fs.readFile(actual, 'utf-8');
  const expectedPath = getFixturePath(`${fixtureName}-output.html`);
  const expectedSide = await fs.readFile(expectedPath, 'utf-8');
  expect(actualSide).toEqual(expectedSide);
});
