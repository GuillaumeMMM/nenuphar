export class Page {
    public name: string = '';
    public path: string = './';
}

export class PageNode {
    public page: Page = new Page();
    public children: Page[] = [];
}