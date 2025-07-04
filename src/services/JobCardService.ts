import { ElementHandle } from "puppeteer";
import { PuppeteerService } from "./PuppeteerSevice";
import { getText, getTextFromElement, sleep } from "../functions";
import { ApplyService } from "./ApplyService";

export class JobCardService {
    public jobDetails: ElementHandle<Element> | null = null;
    public title: string | null = null;
    public about: string | null = null;

    constructor(private puppeteerService: PuppeteerService, private jobCard: ElementHandle<Element>) {
    }

    private async getJobDetails(){;
        return await this.puppeteerService.page.$(".jobs-details");
    }

    async getLink(): Promise<string | null>{
        const link = await this.jobCard.$('.job-card-container__link');
        return link?.evaluate((el: Element) => (el as HTMLAnchorElement).href) || null;
    }

    async apply(){
        const jobCard = this.jobCard;

        const link = await jobCard.$('.job-card-container__link');

        if(link) {
            await link.click();
            console.log(`======================`);

            await sleep(1000);

            let easyApplyButton: ElementHandle<Element> | null = null;

            try{
                easyApplyButton = await this.puppeteerService.page.waitForSelector('.jobs-apply-button--top-card button', { timeout: 1000 });
            }catch(e){
                console.log('No easy apply button found');
                return;
            }

            const jobDetails = await this.getJobDetails();
            this.jobDetails = jobDetails;

            const title = await jobDetails?.$(".job-details-jobs-unified-top-card__job-title");
            const titleText = await getTextFromElement(title as ElementHandle<Element>);
            this.title = titleText || null;
            console.log(`Title: ${titleText}`);

            const about = await jobDetails?.$(".jobs-description__container");
            const aboutText = await getTextFromElement(about as ElementHandle<Element>);
            this.about = aboutText || null;
            console.log('About the job:')
            console.log(aboutText);

            if(easyApplyButton) {
                await easyApplyButton.click();
                await this.puppeteerService.page.waitForSelector('.jobs-easy-apply-modal', { timeout: 2000 });

                const applyService = new ApplyService(this.puppeteerService, this);
                await applyService.apply();
            }

            console.log(`======================`);
        }
    }
}