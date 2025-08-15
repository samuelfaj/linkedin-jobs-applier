const puppeteer = require("puppeteer");
import { PuppeteerService } from "./services/PuppeteerSevice";
import { LinkedInService } from "./services/LinkedInService";
import { logger } from "./helpers/Logger";
import fs from 'fs';

// ("Software Engineer" OR "Full Stack Developer" OR "Senior Software Engineer" OR "Backend Engineer" OR "Frontend Engineer")  AND ("remote" OR "anywhere" OR "open to anywhere" OR "work from anywhere" OR "anywhere in the world" OR "global team" OR "worldwide" OR "open to global talent" OR "remote worldwide" OR "contractor")  AND ("United States" OR "US based" OR "USA" OR "U.S.")
export const DEFINES  = {
    JOB_LINK: `https://www.linkedin.com/jobs/search/?currentJobId=4282257402&f_TPR=r604800&f_WT=2&geoId=103644278&keywords=senior%20software%20engineer&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true&sortBy=R`,
    ABOUT_ME: fs.readFileSync(__dirname + '/../about-me.txt', 'utf8'),
    BLACKLIST: [
        'Applicantz',
        'Jobot',
        'Mindrift',
        'Turing',
        'Toptal',
        'Turing.com',
        'Remotely',
        'Workoo Technologies',
        'Scopic',
        'Outsourcely',
        'RemoteOK',
        'Crossover',
        'Gun.io',
        'Jobspresso',
        'HireAI',
        'Braintrust',
        'PeoplePerHour',
        'Andela',
        'Codementor',
        'Arc',
        'CloudDevs',
        'Lemon.io',
        'X-Team',
        'Talentify.io',
        'Remotive',
        'We Work Remotely',
        'Upwork',
        'Fiverr',
        'Jooble',
        'Indeed',
        'Monster',
        'Dice',
        'FlexJobs',
        'Himalayas',
        'Jobrapido',
        'AngelList',
        'Wellfound',
        'WPhired',
        'Topcoder',
        'Guru',
        'Truelancer'
    ], // Companies to avoid, external sites, robots.
}

const main = async () => {
    try {
        // Show welcome banner
        logger.showBanner('LinkedIn Bot');
        
        // Show welcome box
        logger.showBox(
            'LinkedIn Job Application Bot\n' +
            'Automatically applies to jobs on LinkedIn\n' +
            'With AI-powered question answering\n\n' +
            'Starting automation...',
            '🤖 LINKEDIN APPLY AGENT'
        );

        logger.separator();
        
        // Initialize services
        logger.robotActivity('Initializing LinkedIn automation bot...');
        
        logger.startSpinner('puppeteer', 'Starting Puppeteer browser...');
        const puppeteerService = await PuppeteerService.init();
        logger.succeedSpinner('puppeteer', 'Puppeteer browser started successfully');

        logger.robotActivity('Creating LinkedIn service instance...');
        const linkedInService = new LinkedInService(puppeteerService);
        
        logger.separator();
        
        // Login process
        logger.linkedInActivity('Starting LinkedIn login process...');
        logger.startSpinner('login', 'Waiting for LinkedIn login...');
        
        await linkedInService.login();
        
        logger.succeedSpinner('login', 'Successfully logged into LinkedIn');
        logger.success('LinkedIn authentication completed');
        
        logger.separator();
        
        // Job search process
        logger.jobApplication('Starting job search and application process...');
        logger.info('Target job search criteria:', {
            keywords: 'senior software engineer',
            location: 'Remote/Global',
            timePosted: 'Last 24 hours',
            jobType: 'Remote'
        });
        
        logger.startSpinner('job-search', 'Searching for available jobs...');
        
        await linkedInService.searchJobs();
        
        logger.succeedSpinner('job-search', 'Job search and application process completed');
        logger.success('All available jobs have been processed');
        
    } catch (error) {
        logger.error('Critical error in main process', error);
        process.exit(1);
    }
}

// Handle process cleanup
process.on('SIGINT', () => {
    logger.warn('Received SIGINT, cleaning up...');
    logger.cleanup();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.warn('Received SIGTERM, cleaning up...');
    logger.cleanup();
    process.exit(0);
});

// Start the application
main().catch((error) => {
    logger.error('Unhandled error in main process', error);
    logger.cleanup();
    process.exit(1);
});