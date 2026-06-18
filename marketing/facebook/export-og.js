const fs = require('fs');
const path = require('path');
const { Resvg } = require('/tmp/png-export/node_modules/@resvg/resvg-js');

const html = fs.readFileSync(path.resolve(__dirname, 'og-share.html'), 'utf8');
const svg = html.match(/<svg[\s\S]*<\/svg>/)[0];
const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
const png = resvg.render().asPng();
fs.writeFileSync(path.resolve(__dirname, 'og-share.png'), png);
console.log('saved og-share.png', png.length, 'bytes');
