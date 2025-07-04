import { ElementHandle } from "puppeteer";
import { JobCardService } from "./JobCardService";
import { PuppeteerService } from "./PuppeteerSevice";
import { getTextFromElement, sleep } from "../functions";

export class ApplyService {
    private div: ElementHandle<Element> | null = null;

    constructor(private puppeteerService: PuppeteerService, private jobCardService: JobCardService) {
    }

    private async getTitle(){
        const content = await this.getContent();
        const title = await content?.$('h3');
        return await getTextFromElement(title as ElementHandle<Element>);
    }

    private async hasTitle(title: string){
        const content = await this.getContent();
        const titles = await content?.$$('h3');
        
        for(const titleElement of titles || []){
            const text = await getTextFromElement(titleElement as ElementHandle<Element>);
            if(text?.trim().toLowerCase() === title.toLowerCase()){
                return true;
            }
        }

        return false;
    }

    private async getContent(){
        return await this.div?.$('.jobs-easy-apply-modal__content') || null;
    }

    private async getNextButton(){
        const buttons = await this.div?.$$('footer[role="presentation"] button');

        for(const button of buttons || []){
            const text = await getTextFromElement(button as ElementHandle<Element>);
            if(text?.trim() === 'Next' || text?.trim() === 'Review'){
                console.log(`Next button found: true`);
                return button;
            }
        }

        return null;
    }

    private async getSubmitButton(){
        const buttons = await this.div?.$$('button');
        
        for(const button of buttons || []){
            const text = await getTextFromElement(button as ElementHandle<Element>);
            if(text?.trim() === 'Submit application'){
                console.log(`Submit button found: true`);
                return button;
            }
        }

        console.log(`Submit button found: false`);
        return null;
    }

    private async getDiscardButton(){
        const buttons = await this.puppeteerService.page?.$$('.artdeco-modal__actionbar button');
        
        for(const button of buttons || []){
            const text = await getTextFromElement(button as ElementHandle<Element>);
            if(text?.trim() === 'Discard'){
                console.log(`Discard button found: true`);
                return button;
            }
        }

        return null;
    }

    private async hasErrors(){
        const errors = await this.div?.$$('.artdeco-inline-feedback__message');
        return errors && errors.length > 0 ? true : false;
    }

    private async fillQuestions(){
        await ( await this.getNextButton())?.click();

        if(await this.hasErrors()){
            await this.closeModal();
            throw new Error('Errors found');
        }
    }

    private async closeModal(){
        const closeButton = await this.puppeteerService.page.waitForSelector('.artdeco-modal__dismiss', { timeout: 2000 });
        await closeButton?.click();

        try{
            await this.puppeteerService.page.waitForSelector('.artdeco-modal__actionbar', { timeout: 2000 });
            const discardButton = await this.getDiscardButton();
            if(discardButton){
                await discardButton.click();
            }
        }catch(e){
            console.log(`Close modal: false`);
            return;
        }
    }

    async apply(){
        const page = this.puppeteerService.page;
        this.div = await page.$('.jobs-easy-apply-modal');

        await sleep(2000);

        let i = 0;
        while(true){
            i++;

            if(i > 10){
                await this.closeModal();
                throw new Error('Too many attempts to apply');
            }

            const title = await this.getTitle();
            console.log(`Title: ${title}`);

            if(await this.hasTitle('Additional Questions')){
                await this.fillQuestions();
            }else if(await this.getSubmitButton()){
                await ( await this.getSubmitButton())?.click(); // initial screen

                await sleep(3000);
                await this.closeModal();
                return;
            }else{
                await ( await this.getNextButton())?.click();
            }

            await sleep(1000);
        }

    }
}