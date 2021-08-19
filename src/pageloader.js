import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

const makeFileName = (url) => {
  const hostname = url.hostname.replace(/[^\da-zA-Z]/g, '-');
  const [pathname] = url.pathname.split('.').map((s) => s.replace(/[^\da-zA-Z]/g, '-'));
  return `${hostname + pathname}.html`;
};

const pageLoader = (url, dirpath) => {
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
