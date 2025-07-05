import { ElementHandle } from "puppeteer";
import { logger } from "./helpers/Logger";

export const sleep = (ms: number) => {
    logger.debug(`Sleeping for ${ms}ms...`);
    return new Promise(resolve => setTimeout(resolve, ms));
};

export const getText = (element: ElementHandle<Element>) => {
    logger.debug('Extracting text from element...');
    return element?.evaluate((el: Element) => (el as HTMLElement).textContent);
};

export const getTextFromElement = (element: ElementHandle<Element>) => {
    logger.debug('Extracting and cleaning text from element...');
    return element?.evaluate((el: Element) => (el as HTMLElement).textContent?.trim().replace(/\s+/g, ' '));
};

// New utility functions for enhanced logging
export const logExecutionTime = async <T>(
    operation: string,
    fn: () => Promise<T>
): Promise<T> => {
    const startTime = Date.now();
    logger.debug(`Starting operation: ${operation}`);
    
    try {
        const result = await fn();
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        logger.success(`Operation completed: ${operation} (${duration}ms)`);
        return result;
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        logger.error(`Operation failed: ${operation} (${duration}ms)`, error);
        throw error;
    }
};

export const retryWithLogging = async <T>(
    operation: string,
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 1) {
                logger.warn(`Retry attempt ${attempt}/${maxRetries} for: ${operation}`);
            }
            
            const result = await fn();
            
            if (attempt > 1) {
                logger.success(`Operation succeeded on attempt ${attempt}: ${operation}`);
            }
            
            return result;
        } catch (error) {
            lastError = error;
            logger.error(`Attempt ${attempt}/${maxRetries} failed for: ${operation}`, error);
            
            if (attempt < maxRetries) {
                logger.warn(`Waiting ${delay}ms before retry...`);
                await sleep(delay);
            }
        }
    }
    
    logger.error(`All ${maxRetries} attempts failed for: ${operation}`, lastError);
    throw lastError;
};