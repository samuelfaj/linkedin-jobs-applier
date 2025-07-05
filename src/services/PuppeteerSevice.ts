import puppeteer, { Browser, Page } from "puppeteer";
import { logger } from "../helpers/Logger";

export class PuppeteerService {
    static async init(){
        logger.robotActivity('Initializing Puppeteer browser...');
        
        const browserOptions = {
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized"],
            userDataDir: "./.puppeteer-data",
        };

        logger.debug('Browser configuration:', browserOptions);

        const browser = await puppeteer.launch(browserOptions);
        logger.success('Puppeteer browser launched successfully');

        const page = await browser.newPage();
        logger.robotActivity('New browser page created');

        return new PuppeteerService(browser, page);
    }

    constructor(public browser: Browser, public page: Page) {
        logger.robotActivity('PuppeteerService instance created');
    }

    async goto(url: string){
        logger.robotActivity(`Navigating to: ${url}`);
        await this.page.goto(url);
        logger.success(`Successfully navigated to: ${url}`);
    }
}