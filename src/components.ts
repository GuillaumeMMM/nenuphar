
const fs = require('fs-extra');

module.exports = {
    buildComponents: buildComponents
};

async function buildComponents(): Promise<any[]> {
    let components: any[] = [];

    const files: string[] = await fs.readdir('./src/components');
    const htmlFiles: string[] = (files || []).filter(file => file.endsWith('.html'));
    for(const htmlFile of htmlFiles) {
        let htmlContent = await fs.readFileSync(`./src/components/${htmlFile}`, 'utf8');
        components = components.concat({id: `nen-${htmlFile.split('.html')[0]}`, tag: `nen-${htmlFile.split('.html')[0]}`, template: htmlContent})
    }

    return components;
}