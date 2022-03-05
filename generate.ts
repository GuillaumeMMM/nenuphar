import { BlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

//  Generate HTML from Notion blocks
module.exports = {
    generate: generate,
    generateStyles: generateStyles
};

const fs = require('fs-extra');

const htmlTags: {[key: string]: string} = {
    'heading_1': 'h1',
    'heading_2': 'h2',
    'heading_3': 'h3',
    'paragraph': 'p',
}

function generate(html: string, blocks: BlockObjectResponse[]) {

    const blocksHTML = blocks.map(block => generateHTMLForBlock(block)).join('');

    const newHtml = html.replace('<div id="root-content"></div>', `<div id="root-content">${blocksHTML}</div>`);

    return newHtml;
}

function generateHTMLForBlock(block: BlockObjectResponse) {
    if (htmlTags[block.type] && Object.keys(htmlTags).includes(block.type)) {
        return `
            <div class="nen-block-container">
                ${((block as any)[block.type].text || []).map((blockElm: any) => generateHTMLForBlockElement(block.type, blockElm)).join(' ')}
            </div>
        `;
    } else {
        return '';
    }
}

function generateHTMLForBlockElement(type: string, blockElement: any) {
    const mainTag = getTagForType(type);
    const classes = getClassesForTextBlock(blockElement);
    return `
        <${mainTag} ${classes}>
            ${embedTag(blockElement, (blockElement?.plain_text || ''))}
        </${mainTag}>
    `;
}

async function generateStyles() {
    const source = "./src/styles";
    const destination = "./build/styles";
    const tmp = `tmp-${Date.now()}`;

    await fs.mkdir(tmp);
    await fs.copy(source, tmp);
    await fs.move(tmp, destination, {overwrite: true});

    console.log('styles build done.')
}

function getClassesForTextBlock(block: RichTextItemResponse) {
    const classes: string[] = [];
    const annotations: any = block?.annotations || {};
    Object.keys(annotations).forEach(key => {
        if (annotations[key]) {
            if (typeof annotations[key] === 'boolean') {
                classes.push(`nen-${key}`);
            }
            if (typeof annotations[key] === 'string') {
                classes.push(`nen-${key}-${annotations[key]}`);
            }
        }
    });

    return classes.length > 0 ? `class="${classes.join(' ')}"` : '';
}

function getTagForType(blockType: string): string {
    let tag: string = 'span';
    switch (blockType) {
        case 'heading_1': { tag = 'h1'; break; }
        case 'heading_2': { tag = 'h2'; break; }
        case 'heading_3': { tag = 'h3'; break; }
    }
    return tag;
}

function embedTag(block: RichTextItemResponse, text: string) {
    if (block?.href) {
        return `<a href=${block.href} rel="noopener noreferrer" target="_blank">${text}</a>`
    }
    return `${text}`;
}