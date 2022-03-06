import { Client } from "@notionhq/client";
import { BlockObjectResponse, GetPageResponse, ListBlockChildrenResponse, PartialBlockObjectResponse, SearchResponse } from "@notionhq/client/build/src/api-endpoints";

const generateModule = require('./generate.ts');
const componentModule = require('./components.ts');
const fs = require('fs-extra');

const config = require('./nen-config.json');

async function main() {
    const token = process.env.NOTION_TOKEN;
    // Initializing a client
    const notion: Client = new Client({
        auth: token,
    });

    console.log('Connected successfully to Notion');

    const allPages: SearchResponse = await notion.search({
        sort: {
            direction: 'ascending',
            timestamp: 'last_edited_time',
        },
    });

    const workspacePage: any = allPages.results.filter(res => res.object === 'page').find((page: any) => !page.archived && page.parent.type === 'workspace');

    if (!workspacePage) {
        console.error('Could not find workspace');
        return;
    }

    const mainPagecontent: GetPageResponse = await notion.pages.retrieve({ page_id: workspacePage.id });
    
    const mainBlocks: ListBlockChildrenResponse = await notion.blocks.children.list({block_id: mainPagecontent.id});

    const pagesChild: any = mainBlocks.results.find((block: any) => block.child_page?.title === 'Pages');

    const pagesPageBlocks: ListBlockChildrenResponse = await getChildrenBlocks(notion, pagesChild.id);

    console.log('Pages : ', pagesPageBlocks.results.filter((block: any) => block.type === 'child_page').map((page: any) => page.child_page?.title));

    const pages = pagesPageBlocks.results.filter((block: any) => block.type === 'child_page');

    generateApp(notion, pages);
    
    return 'done.';
}

async function generateApp(notion: Client, pages: (PartialBlockObjectResponse | BlockObjectResponse)[]) {

    //  Delete build folder
    await fs.rmSync('./build', { recursive: true, force: true });

    //  Recreate build
    await fs.mkdir('./build');

    for (let page of pages) {
        const pageName: string = ((page as any)?.child_page?.title || 'unknown').toLowerCase();
        await buildPage(notion, page, pageName);
    }

    if (config.home) {
        await buildPage(notion, pages.find((page: any) => page?.child_page?.title === config.home) as any, 'index');
    }

    await generateModule.generateStyles();
}

async function getChildrenBlocks(notion: Client, pageId: string): Promise<ListBlockChildrenResponse> {
    return notion.blocks.children.list({block_id: pageId})
}

async function buildPage(notion: Client, page: PartialBlockObjectResponse | BlockObjectResponse, pageName: string) {

    let html = await fs.readFileSync(`./index.html`, 'utf8');
    
    const pageContent = await getChildrenBlocks(notion, page.id);

    html = generateModule.generate(html, pageContent['results']);

    html = await componentModule.buildComponents(html);

    await fs.writeFile(`./build/${pageName}.html`, html, 'utf8', (err: any) => {
        if (err) return console.log(err);
        console.log(`${pageName}.html build done.`);
    });
}

main()
    .then(console.log)
    .catch(console.error);