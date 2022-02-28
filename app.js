const { Client } = require("@notionhq/client");
const generateModule = require('./generate.js');

async function main() {
    const token = process.env.NOTION_TOKEN;
    // Initializing a client
    const notion = new Client({
        auth: token,
    });

    console.log('Connected successfully to Notion');

    const allPages = await notion.search({
        sort: {
            direction: 'ascending',
            timestamp: 'last_edited_time',
        },
    });

    const mainPageMeta = allPages.results.find(page => !page.archived && page.parent.type === 'workspace');

    const mainPagecontent = await notion.pages.retrieve({ page_id: mainPageMeta.id });
    
    const mainBlocks = await notion.blocks.children.list({block_id: mainPagecontent.id});

    const pagesChild = mainBlocks.results.find(block => block.child_page?.title === 'Pages');

    const pagesPageBlocks = await getChildrenBlocks(notion, pagesChild.id);

    console.log('Pages : ', pagesPageBlocks.results.filter(block => block.type === 'child_page').map(page => page.child_page?.title));


    const blocks = await Promise.all(pagesPageBlocks.results.filter(block => block.type === 'child_page').map(async function(pageBlock) {
        const pageContent = await getChildrenBlocks(notion, pageBlock.id);
        return pageContent;
    }));

    generateModule.generate(blocks[0].results);

    return 'done.';
}

async function getChildrenBlocks(notion, pageId) {
    return notion.blocks.children.list({block_id: pageId})
}

main()
    .then(console.log)
    .catch(console.error);