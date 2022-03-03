
const fs = require('fs-extra');

module.exports = {
    buildComponents: buildComponents
};

async function buildComponents(indexHtml: string): Promise<string> {
    let newIndexHtml = indexHtml;

    const files: string[] = await fs.readdir('./components');

    const htmlFiles: string[] = (files || []).filter(file => file.endsWith('.html')).map(file => file.split('.html')[0]);

    return buildComponent(htmlFiles[0], newIndexHtml);
}

async function buildComponent(fileName: string, indexHtml: string): Promise<string> {
    const fileHtml = fs.readFileSync(`./components/${fileName}.html`, 'utf8');
    console.log('build ', fileName + '.html');
    return (indexHtml || '').replace(`<nen-${fileName}></nen-${fileName}>`, fileHtml);
}