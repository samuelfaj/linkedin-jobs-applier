import { ElementHandle } from "puppeteer";
import { PuppeteerService } from "./PuppeteerSevice";
import { getTextFromElement, sleep } from "../functions";
import { ApplyService } from "./ApplyService";
import ChatGptHelper, { extractJsonFromResponse } from "../helpers/ChatGptHelper";
import { logger } from "../helpers/Logger";
import { DEFINES } from "..";
import fs from 'fs';

const formatJobSaveUrl = (url: string) => {
    const id = url.split('currentJobId=')[1].split('&')[0];
    return `https://www.linkedin.com/jobs/search/?currentJobId=${id}`;
}

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
            if(text?.toLowerCase().includes(`Easy Apply limit`.toLowerCase())){
                logger.warn('LinkedIn Easy Apply limit reached!', { message: text });
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

        const jobCardText = await getTextFromElement(jobCard as ElementHandle<Element>);
        const blackListedCompany = DEFINES.BLACKLIST.find(blackListedCompany => jobCardText?.toLowerCase().includes(blackListedCompany.toLowerCase()));

        if(blackListedCompany){
            logger.warn(`${blackListedCompany?.toLowerCase()} job card found - skipping...`);
            return;
        }

        const link = await jobCard.$('.job-card-container__link');

        if(link) {
            await link.click();
            logger.separator();
            logger.linkedInActivity('Processing new job card...');

            await sleep(1000);

            let easyApplyButton: ElementHandle<Element> | null = null;

            try{
                easyApplyButton = await this.puppeteerService.page.waitForSelector('.jobs-apply-button--top-card button', { timeout: 1000 });

                const easyApplyButtonText = await getTextFromElement(easyApplyButton as ElementHandle<Element>);

                if(!easyApplyButtonText?.toLowerCase().includes('easy apply'.toLowerCase())){
                    easyApplyButton = null;
                    logger.robotActivity('Easy Apply button not found');
                }else{
                    logger.robotActivity('Easy Apply button found');
                }
            }catch(e){
                logger.warn('No Easy Apply button found - skipping job');
                return;
            }

            const jobDetails = await this.getJobDetails();
            this.jobDetails = jobDetails;

            const title = await jobDetails?.$(".job-details-jobs-unified-top-card__job-title");
            const titleText = await getTextFromElement(title as ElementHandle<Element>);
            this.title = titleText || null;
            
            logger.jobApplication(`📋 Job Title: ${titleText}`);

            const about = await jobDetails?.$(".jobs-description__container");
            const aboutText = await getTextFromElement(about as ElementHandle<Element>);
            this.about = aboutText || null;
            
            logger.showBox(
                aboutText?.substring(0, 200) + '...' || 'No description available',
                '📝 Job Description Preview'
            );

            // Check for application limit
            if(await this.hasReachedLimit()){
                logger.error('🔴 You have reached the LinkedIn Easy Apply limit');
                logger.warn('Waiting 1 hour before next attempt...');
                await sleep(60 * 60 * 1000); // 1 hour
                process.exit(1);
            }

            if(easyApplyButton) {
                logger.startSpinner('job-analysis', 'AI is analyzing job compatibility...');
                
                const answer = await ChatGptHelper.sendText(
                    'gpt-5-nano', 
                    `${DEFINES.ABOUT_ME}\n\n`+ 
                    `HARD RULE: IT CANNOT BE A GOOD FIT IF IT REQUIRES TO LIVE IN USA OR BE A USA CITIZEN.\n\n`+
                    `IF THE JOB SAY THAT IT HIRES FROM ANYWHERE IN THE WORLD OR LATAM OR BRAZIL, AND IF it's a GOOD FIT, you can rate close to 100.\n\n`+
                    `Based on the context and my profile, answer if this job is a good fit for me and if it attends to my expectations / requirements.`+ 
                    `Return a JSON and ONLY a JSON: {"isGoodFit": "YES" | "NO", "reason": "string", "rate": 0-100}.`+ 
                    `JOB DESCRIPTION: ${this.about}`
                );

                const json = extractJsonFromResponse(answer || '{}');

                if(json?.isGoodFit === 'YES'){
                    if(json.isGoodFit === 'YES' && json.rate > 90){
                        const url = this.puppeteerService.page.url();
                        fs.appendFileSync(__dirname + '/../job-cards.csv', `${json.rate};${json.reason};${formatJobSaveUrl(url)}\n`);
                    }

                    logger.succeedSpinner('job-analysis', `AI determined this job is a good fit: ${answer}`);
                    logger.success('🟢 This job matches your profile - proceeding with application');

                    await easyApplyButton.click();
                    
                    await sleep(1000);
                    
                    // Double-check for application limit after clicking
                    if(await this.hasReachedLimit()){
                        logger.error('🔴 Application limit reached during application process');
                        logger.warn('Waiting 1 hour before retry...');
                        await sleep(60 * 60 * 1000); // 1 hour
                        process.exit(1);
                    }

                    await this.puppeteerService.page.waitForSelector('.jobs-easy-apply-modal', { timeout: 2000 });

                    const applyService = new ApplyService(this.puppeteerService, this);
                    await applyService.apply();
                }else{
                    logger.failSpinner('job-analysis', `AI determined this job is not a good fit: ${answer}`);
                    logger.warn('🔴 This job does not match your profile - skipping application');
                }
            }else{
                // No easy apply button found

                const answer = await ChatGptHelper.sendText(
                    'gpt-5-nano', 
                    `${DEFINES.ABOUT_ME}\n\n`+ 
                    `HARD RULE: IT CANNOT BE A GOOD FIT IF IT REQUIRES TO LIVE IN USA OR BE A USA CITIZEN.\n\n`+
                    `IF THE JOB SAY THAT IT HIRES FROM ANYWHERE IN THE WORLD OR LATAM OR BRAZIL, AND IF it's a GOOD FIT, you can rate close to 100.\n\n`+
                    `Based on the context and my profile, answer if this job is a good fit for me and if it attends to my expectations / requirements.`+ 
                    `Return a JSON and ONLY a JSON: {"isGoodFit": "YES" | "NO", "reason": "string", "rate": 0-100}.`+ 
                    `JOB DESCRIPTION: ${this.about}`
                );

                if(answer){
                    const json = extractJsonFromResponse(answer);
    
                    if(json){
                        logger.succeedSpinner('job-analysis', `AI determined this job is a good fit: ${answer}`);
                        logger.success(answer);
    
                        if(json.isGoodFit === 'YES' && json.rate > 80){
                            const url = this.puppeteerService.page.url();
                            fs.appendFileSync(__dirname + '/../job-cards.csv', `${json.rate};${json.reason};${formatJobSaveUrl(url)}\n`);
                        }
                    }
                }
            }

            logger.separator();
        }
    }
}