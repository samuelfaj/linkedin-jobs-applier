const puppeteer = require("puppeteer");
import { PuppeteerService } from "./services/PuppeteerSevice";
import { LinkedInService } from "./services/LinkedInService";

export const DEFINES  = {
    jobsLink: `https://www.linkedin.com/jobs/search/?currentJobId=4234489284&distance=25&f_AL=true&f_WT=2&geoId=103644278&keywords=senior%20software%20engineer&origin=JOBS_HOME_SEARCH_CARDS`
}

const main = async () => {
    const linkedInService = new LinkedInService(await PuppeteerService.init());
    await linkedInService.login();
    await linkedInService.searchJobs();
}

main();