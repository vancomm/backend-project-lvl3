import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';

export const makeFileName = (url) => {
  const normalizeNamePart = (part) => part.replace(/((?<=^)[^\da-z]|(?=$)[^\da-z])/gi, '')
    .replace(/[^\da-z]/gi, '-');
  const hostname = normalizeNamePart(url.hostname);
  const [pathname] = url.pathname.split('.').map(normalizeNamePart);
  return (pathname.length === 0)
    ? `${hostname}.html`
    : `${hostname}-${pathname}.html`;
};

const pageLoader = (urlString, dirpath = process.cwd()) => {
  const url = new URL(urlString);
  const filename = makeFileName(url);
  const filepath = path.join(dirpath, filename);
  return axios.get(url.toString())
    .then((response) => fs.writeFile(filepath, response.data))
    .then(() => filepath)
    .catch((error) => {
      throw error;
    });
};

export default pageLoader;
