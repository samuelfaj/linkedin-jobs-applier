import { ElementHandle } from "puppeteer";
import { JobCardService } from "./JobCardService";
import { PuppeteerService } from "./PuppeteerSevice";
import { getTextFromElement, sleep } from "../functions";
import ChatGptHelper from "../helpers/ChatGptHelper";
import fs from 'fs';
import { DEFINES } from "..";

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

        const page = this.puppeteerService.page;

        const questions = await page.$$('[data-test-form-element]');
        for (const q of questions) {
            // 1) extrai texto da pergunta
            const labelHandle = await q.$('label');
            if (!labelHandle) continue;
            const question = (await (await labelHandle.getProperty('innerText')).jsonValue()).trim();

            console.log(`Question: ${question}`);

            let error = '';

            if(await q.$('.artdeco-inline-feedback__message')){
                error = (await getTextFromElement(await q.$('.artdeco-inline-feedback__message') as ElementHandle<Element>) || '').toLowerCase();
                console.log(`Error: ${error}`);
            }


            // 2) busca a resposta no ChatGPT
            let answer = await ChatGptHelper.sendText(
                'gpt-4.1-nano', 
                `PROFILE: ${DEFINES.ABOUT_ME}\n\n` + 
                `--------------------------------\n\n` + 
                `ROLE DESCRIPTION: ${this.jobCardService.about}\n\n` + 
                `--------------------------------\n\n` + 
                `Based on my profile, answer the following question: ${question}\n\n` + 
                `If you don't know the exact answer, or it's a bad answer, return what you think is the best answer for the all role.\n` + 
                `Return only the answer, without any other text.\n` + 
                `${error}`
            );

            if (!answer) continue;

            if(error.includes('number')){
                answer  = answer.replace(/[^0-9\.]/g, '');
            }          
            // 3) trata upload de arquivo
            const fileInput = await q.$('input[type="file"]');
            if (fileInput) {
              // ajuste o path para o seu currículo ou outro anexo
              const filePath = process.env.RESUME_PATH || '/path/to/resume.pdf';
              await fileInput.uploadFile(filePath);
              continue;
            }
          
            // 4) inputs de data
            const dateInput = await q.$('input[type="date"]');
            if (dateInput) {
              // preenche com data de hoje (YYYY-MM-DD)
              const today = new Date().toISOString().split('T')[0];
              await dateInput.type(today, { delay: 50 });
              continue;
            }
          
            // 5) inputs numéricos, email, telefone, URL, texto genérico
            const textSelector = [
              'input[type="text"]',
              'input[type="email"]',
              'input[type="tel"]',
              'input[type="url"]',
              'input[type="number"]',
              'input:not([type])' // inputs sem type declarado
            ].join(',');

            const textInput = await q.$(textSelector);

            if (textInput) {
              await textInput.click({ clickCount: 3 });
              
              const inputType = await textInput.evaluate(el => el.getAttribute('type'));
              if(inputType === 'number'){    
                await textInput.type(answer.replace(/[^0-9\.]/g, ''), { delay: 50 });
              }else{
                await textInput.type(answer, { delay: 50 });
              }
              continue;
            }
          
            // 6) textarea
            const textarea = await q.$('textarea');
            if (textarea) {
              await textarea.click();
              await textarea.type(answer, { delay: 50 });
              continue;
            }
          
            // 7) select múltiplo (multi-select)
            const multiSelect = await q.$('select[multiple]');
            if (multiSelect) {
              const selectId = await multiSelect.evaluate(el => el.getAttribute('id'));
              if (selectId) {
                await page.evaluate((sel, ans) => {
                  const s = document.querySelector(sel) as HTMLSelectElement;
                  if (!s) return;
                  // marca as primeiras opções até satisfazer um critério simples
                  Array.from(s.options).slice(0, 2).forEach(opt => {
                    opt.selected = true;
                  });
                  s.dispatchEvent(new Event('change', { bubbles: true }));
                }, `#${selectId}`, answer);
              }
              continue;
            }
          
            // 8) select simples
            const select = await q.$('select:not([multiple])');
            if (select) {
              const selectId = await select.evaluate(el => el.getAttribute('id'));
              if (selectId) {
                await page.evaluate((sel, ans) => {
                  const s = document.querySelector(sel) as HTMLSelectElement;
                  if (!s) return;
                  for (const opt of Array.from(s.options)) {
                    if (opt.text.toLowerCase().includes(ans.toLowerCase())) {
                      s.value = opt.value;
                      s.dispatchEvent(new Event('change', { bubbles: true }));
                      return;
                    }
                  }
                  // fallback: primeira opção válida
                  if (s.options.length > 1) {
                    s.selectedIndex = 1;
                    s.dispatchEvent(new Event('change', { bubbles: true }));
                  }
                }, `#${selectId}`, answer);
              }
              continue;
            }
          
            // 9) radio buttons
            const radios = await q.$$('input[type="radio"]');
            if (radios.length) {
              // tenta clicar no que tiver label combinando com a resposta
              let clicked = false;
              for (const r of radios) {
                const id = await (await r.getProperty('id')).jsonValue();
                const lab = await page.$(`label[for="${id}"]`);
                if (lab) {
                  const txt = (await (await lab.getProperty('innerText')).jsonValue()).trim();
                  if (txt.toLowerCase().includes(answer.toLowerCase())) {
                    await r.click();
                    clicked = true;
                    break;
                  }
                }
              }
              if (!clicked) await radios[0].click(); // fallback
              continue;
            }
          
            // 10) checkboxes
            const checkboxes = await q.$$('input[type="checkbox"]');
            if (checkboxes.length) {
              // marca todas ou apenas a primeira
              await checkboxes[0].click();
              continue;
            }
          
            // 11) fallback genérico, tenta um input qualquer
            const anyInput = await q.$('input');
            if (anyInput) {
              await anyInput.click({ clickCount: 3 });
              await anyInput.type(answer, { delay: 50 });
            }
          }


        await ( await this.getNextButton())?.click();
        await sleep(1500);

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