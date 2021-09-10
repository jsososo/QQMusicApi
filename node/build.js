const fs = require('fs');
const path = require('path');

let routes = `module.exports = {
`;

const blackSet = new Set(['data', 'index'])
fs.readdirSync(path.join(__dirname, '../routes')).forEach(file => {
  const filename = file.replace(/\.js$/, '');
  if (!blackSet.has(filename)) {
    routes += `  ${filename}: require('../routes/${filename}'),
`;
  }
})
routes += `}
`;

fs.writeFileSync(path.join(__dirname, 'routes.js'), routes);
