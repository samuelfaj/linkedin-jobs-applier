import { ElementHandle } from "puppeteer";
import { PuppeteerService } from "./PuppeteerSevice";
import { getTextFromElement, sleep } from "../functions";
import { ApplyService } from "./ApplyService";
import ChatGptHelper from "../helpers/ChatGptHelper";
import { DEFINES } from "..";

export class JobCardService {
    public jobDetails: ElementHandle<Element> | null = null;
    public title: string | null = null;
    public about: string | null = null;

    constructor(private puppeteerService: PuppeteerService, private jobCard: ElementHandle<Element>) {
    }

    private async hasReachedLimit(){
        const feedbackLines = await this.puppeteerService.page.$$('.artdeco-inline-feedback__message');

        for(const feedbackLine of feedbackLines){
            const text = await getTextFromElement(feedbackLine as ElementHandle<Element>);
            console.log(`Feedback: ${text}`);
            if(text?.toLowerCase().includes(`Easy Apply limit`.toLowerCase())){
                return true;
            }
        }
        
        return false;
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

            if(await this.hasReachedLimit()){
                console.log('🔴 You have reached the limit of applications');
                await sleep(60 * 60 * 1000); // 1 hour
                process.exit(1);
            }

            if(easyApplyButton) {
                const answer = await ChatGptHelper.sendText(
                    'gpt-4.1-nano', 
                    `PROFILE: ${DEFINES.ABOUT_ME}\n\nBased on my profile, answer if this job is a good fit for me. Return only the "YES" or "NO", without any other text.`
                );

                if(answer?.toLocaleLowerCase().includes('yes')){
                    console.log('🟢 This job is a good fit');

                    await easyApplyButton.click();
                    
                    await sleep(1000);
                    if(await this.hasReachedLimit()){
                        console.log('🔴 You have reached the limit of applications');
                        await sleep(60 * 60 * 1000); // 1 hour
                        process.exit(1);
                    }

                    await this.puppeteerService.page.waitForSelector('.jobs-easy-apply-modal', { timeout: 2000 });

                    const applyService = new ApplyService(this.puppeteerService, this);
                    await applyService.apply();
                }else{
                    console.log('🔴 This job is not a good fit');
                }
            }

            console.log(`======================`);
        }
    }
}