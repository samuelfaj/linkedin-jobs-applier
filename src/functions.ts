import { ElementHandle } from "puppeteer";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getText = (element: ElementHandle<Element>) => element?.evaluate((el: Element) => (el as HTMLElement).textContent);

export const getTextFromElement = (element: ElementHandle<Element>) => element?.evaluate((el: Element) => (el as HTMLElement).textContent?.trim().replace(/\s+/g, ' '));