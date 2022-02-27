//  Generate HTML from Notion blocks
module.exports = {
    generate: generate
};

const fs = require('fs');

async function generate(blocks) {

    const html = await fs.readFileSync('./index.html', 'utf8');

    const blocksHTML = blocks.map(block => generateHTMLForBlock(block)).join('');

    const newHtml = html.replace('<body></body>', `<div id="root">${blocksHTML}</div>`);

    console.log(newHtml)

    await fs.writeFile('./build/index.html', newHtml, 'utf8', (err) => {
        if (err) return console.log(err);
        console.log('build done.')
    })
}

function generateHTMLForBlock(block) {
    switch (block.type) {
        case 'heading_1': {
            return `<h1>${block.heading_1.text[0].plain_text}</h1>`;
        }
        case 'paragraph': {
            return `<p>${block.paragraph.text[0].plain_text}</p>`;
        }
        default: return '';
    }
}