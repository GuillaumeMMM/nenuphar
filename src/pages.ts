import { PageNode } from "./models/page";

module.exports = {
    buildPagesTree: buildPagesTree
}

function buildPagesTree(mainPages: any[]): PageNode[] {
    
    const pagesTree: PageNode[] = [];

    (mainPages || []).forEach(page => {
        const pageName: string = page?.child_page?.title;
        pagesTree.push({page: {name: pageName, path: `./${pageName.toLowerCase()}.html`}, children: []});
    });
    
    return pagesTree;
}

async function buildComponent(fileName: string, indexHtml: string): Promise<string> {
    const fileHtml = fs.readFileSync(`./src/components/${fileName}.html`, 'utf8');
    console.log('build ', fileName + '.html');
    return (indexHtml || '').replace(`<nen-${fileName}></nen-${fileName}>`, fileHtml);
}