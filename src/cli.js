import program from 'commander';
import pageLoader from './pageloader.js';

export default () => {
  program
    .argument('<url>')
    .description('Page loader utility')
    .version('0.0.1')
    .option('-o, --output <dir>', 'output dir', `${process.cwd()}`)
    .action((url, options) => {
      pageLoader(url, options.output)
        .then(console.log)
        .catch(() => console.log('Something went wrong...'));
    });
  program.parse();
};
