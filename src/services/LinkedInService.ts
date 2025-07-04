import { sleep } from "../functions";
import { PuppeteerService } from "./PuppeteerSevice";
import { DEFINES } from "../index";
import { JobCardService } from "./JobCardService";
import { ElementHandle } from "puppeteer";

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
        await this.puppeteerService.goto("https://www.linkedin.com/login");

        let loggedIn = false;

        while (!loggedIn) {
            try{
                await this.puppeteerService.page.waitForSelector(".global-nav__me-photo", { timeout: 1000 });
                loggedIn = true;
                break;
            }catch(e){
                console.log("Not logged in, waiting 5 seconds");
                await sleep(5000);
            }
        }

        console.log("Logged in"); 
    }

    async searchJobs(link = DEFINES.jobsLink, pageNumber = 0){
        const page = this.puppeteerService.page;

        await this.puppeteerService.goto(link);
        await page.waitForSelector(".job-card-list", { timeout: 5000 });

        const links: string[] = [];

        let newJobs = true;

        while (newJobs) {
            newJobs = false;
            const jobCards = await page.$$(".job-card-list");

            for (const jobCard of jobCards) {
                const jobCardService = new JobCardService(this.puppeteerService, jobCard);
                const link = await jobCardService.getLink();

                if(link && !links.includes(link)) {
                    links.push(link);
                    newJobs = true;

                    try{
                        await jobCardService.apply();
                    }catch(e){
                        console.error('Error applying to job', e);
                    }
                }

                const lastJobCard = jobCards[jobCards.length - 1];
                await this.scrollDown(lastJobCard);
            }
        }

        console.log(`Page ${pageNumber} done`);

        pageNumber++;

        console.log(`Going to page ${pageNumber}`); 
        await this.searchJobs(DEFINES.jobsLink + '&start=' + (pageNumber * 25), pageNumber);
    }
}