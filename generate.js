//  Generate HTML from Notion blocks
module.exports = {
    generate: generate
};

const fs = require('fs-extra');

const htmlTags = {
    'heading_1': 'h1',
    'heading_2': 'h2',
    'heading_3': 'h3',
    'paragraph': 'p',
}

async function generate(blocks) {

    await generateStyles();

    const html = await fs.readFileSync('./index.html', 'utf8');

    const blocksHTML = blocks.map(block => generateHTMLForBlock(block)).join('');

    const newHtml = html.replace('<main id="root"></main>', `<main id="root">${blocksHTML}</main>`);

    await fs.writeFile('./build/index.html', newHtml, 'utf8', (err) => {
        if (err) return console.log(err);
        console.log('build done.')
    })
}

function generateHTMLForBlock(block) {
    if (htmlTags[block.type] && block[block.type].text) {
        return `
            <${htmlTags[block.type]} ${getClassesForTextBlock(block[block.type].text[0])}>
                ${embedTag(block[block.type].text[0], (block[block.type].text[0]?.plain_text || ''))}
            </${htmlTags[block.type]}>
        `;
    } else {
        return '';
    }
}

async function generateStyles() {
    const source = "./styles";
    const destination = "./build/styles";
    const tmp = `tmp-${Date.now()}`;

    await fs.mkdir(tmp);
    await fs.copy(source, tmp);
    await fs.move(tmp, destination, {overwrite: true});

    console.log('styles build done.')
}

function getClassesForTextBlock(block) {
    const classes = [];
    Object.keys(block?.annotations || {}).forEach(key => {
        if (block?.annotations[key]) {
            if (typeof block?.annotations[key] === 'boolean') {
                classes.push(`nen-${key}`);
            }
            if (typeof block?.annotations[key] === 'string') {
                classes.push(`nen-${key}-${block?.annotations[key]}`);
            }
        }
    });

    return classes.length > 0 ? `class="${classes.join(' ')}"` : '';
}

function embedTag(block, text) {
    if (block?.href) {
        return `<a href=${block.href} rel="noopener noreferrer" target="_blank">${text}</a>`
    }
    return `<span>${text}</span>`;
}