import { Client } from "@notionhq/client";
import { GetPageResponse, ListBlockChildrenResponse, SearchResponse } from "@notionhq/client/build/src/api-endpoints";

const generateModule = require('./generate.ts');
const componentModule = require('./components.ts');
const fs = require('fs-extra');

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


    const blocks: ListBlockChildrenResponse[] = await Promise.all(pagesPageBlocks.results.filter((block: any) => block.type === 'child_page').map(async function(pageBlock) {
        const pageContent = await getChildrenBlocks(notion, pageBlock.id);
        return pageContent;
    }));

    await generateModule.generateStyles();

    let html = await fs.readFileSync('./index.html', 'utf8');

    html = generateModule.generate(html, blocks[0]['results']);

    html = await componentModule.buildComponents(html);

    await fs.writeFile('./build/index.html', html, 'utf8', (err: any) => {
        if (err) return console.log(err);
        console.log('build done.', html);
    });

    return 'done.';
}

async function getChildrenBlocks(notion: Client, pageId: string): Promise<ListBlockChildrenResponse> {
    return notion.blocks.children.list({block_id: pageId})
}

main()
    .then(console.log)
    .catch(console.error);