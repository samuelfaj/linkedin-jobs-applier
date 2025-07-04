import puppeteer, { Browser, Page } from "puppeteer";

export class PuppeteerService {
    static async init(){
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"],
            userDataDir: "./.puppeteer-data",
        });

        const page = await browser.newPage();

        return new PuppeteerService(browser, page);
    }

    constructor(public browser: Browser, public page: Page) {
    }

    async goto(url: string){
        await this.page.goto(url);
    }
}