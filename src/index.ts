const puppeteer = require("puppeteer");
import { PuppeteerService } from "./services/PuppeteerSevice";
import { LinkedInService } from "./services/LinkedInService";
import fs from 'fs';

export const DEFINES  = {
    JOB_LINK: `https://www.linkedin.com/jobs/search/?currentJobId=4234489284&distance=25&f_AL=true&f_WT=2&geoId=103644278&keywords=senior%20software%20engineer&origin=JOBS_HOME_SEARCH_CARDS`,
    ABOUT_ME: fs.readFileSync(__dirname + '/../about-me.txt', 'utf8')
}

const main = async () => {
    const linkedInService = new LinkedInService(await PuppeteerService.init());
    await linkedInService.login();
    await linkedInService.searchJobs();
}

main();