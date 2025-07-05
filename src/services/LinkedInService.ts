import { sleep } from "../functions";
import { PuppeteerService } from "./PuppeteerSevice";
import { DEFINES } from "../index";
import { JobCardService } from "./JobCardService";
import { ElementHandle } from "puppeteer";
import { logger } from "../helpers/Logger";

export class LinkedInService {
    constructor(private puppeteerService: PuppeteerService) {
    }

    private async scrollDown(element: ElementHandle<Element>){
        const page = this.puppeteerService.page;
        const boundingBox = await element.boundingBox();

        if (boundingBox) {
            const startX = boundingBox.x + boundingBox.width / 2;
            const startY = boundingBox.y + boundingBox.height / 2;

            await page.mouse.move(startX, startY);

            for (let i = 0; i < 2; i++) {
                await page.mouse.wheel({ deltaY: 100 });
                await sleep(300);
            }
        }
    }

    async login(){
        logger.linkedInActivity('Navigating to LinkedIn login page...');
        await this.puppeteerService.goto("https://www.linkedin.com/login");

        let loggedIn = false;

        while (!loggedIn) {
            try{
                await this.puppeteerService.page.waitForSelector(".global-nav__me-photo", { timeout: 1000 });
                loggedIn = true;
                break;
            }catch(e){
                logger.warn('Not logged in yet - waiting 5 seconds...');
                await sleep(5000);
            }
        }

        logger.success('Successfully logged into LinkedIn!');
    }

    async searchJobs(link = DEFINES.JOB_LINK, pageNumber = 0){
        const page = this.puppeteerService.page;

        logger.linkedInActivity(`Navigating to job search page (page ${pageNumber + 1})...`);
        await this.puppeteerService.goto(link);
        
        logger.startSpinner('page-load', 'Loading job listings...');
        await page.waitForSelector(".job-card-list", { timeout: 5000 });
        logger.succeedSpinner('page-load', 'Job listings loaded successfully');

        const links: string[] = [];
        let processedJobs = 0;

        let newJobs = true;

        while (newJobs) {
            newJobs = false;
            const jobCards = await page.$$(".job-card-list");

            logger.info(`Found ${jobCards.length} job cards on current view`);

            for (const jobCard of jobCards) {
                const jobCardService = new JobCardService(this.puppeteerService, jobCard);
                const link = await jobCardService.getLink();

                await this.scrollDown(jobCard);

                if(link && !links.includes(link)) {
                    links.push(link);
                    processedJobs++;
                    newJobs = true;

                    logger.robotActivity(`Processing job ${processedJobs} of page ${pageNumber + 1}...`);

                    try{
                        await jobCardService.apply();
                        logger.success(`✅ Job ${processedJobs} processed successfully`);
                    }catch(e){
                        logger.error(`❌ Error processing job ${processedJobs}`, e);
                    }
                }
            }

            const lastJobCard = jobCards[jobCards.length - 1];
            logger.debug('Scrolling to load more jobs...');
            await this.scrollDown(lastJobCard);
        }

        logger.success(`Page ${pageNumber + 1} completed - processed ${processedJobs} jobs`);
        logger.separator();

        const nextPageNumber = pageNumber + 1;
        const nextPageLink = DEFINES.JOB_LINK + '&start=' + (nextPageNumber * 25);

        logger.linkedInActivity(`Moving to page ${nextPageNumber + 1}...`);
        await this.searchJobs(nextPageLink, nextPageNumber);
    }
}