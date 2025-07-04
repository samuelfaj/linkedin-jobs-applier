# LinkedIn Apply Agent

An automated job application bot for LinkedIn that streamlines the process of applying to jobs using LinkedIn's Easy Apply feature.

## ⚠️ Important Disclaimer

This tool is for educational and personal use only. Please be aware that:
- Automated job applications may violate LinkedIn's Terms of Service
- Use at your own risk - your LinkedIn account could be suspended or banned
- Always review job postings carefully before applying
- Consider the ethics of automated applications in your job search strategy
- This tool should complement, not replace, a thoughtful job search approach

## Features

- **Automated Login**: Waits for manual login to LinkedIn
- **Job Search**: Automatically searches through LinkedIn job listings
- **Easy Apply**: Applies to jobs using LinkedIn's Easy Apply feature
- **Job Details Extraction**: Captures job titles and descriptions
- **Pagination Support**: Continues through multiple pages of results
- **Error Handling**: Robust error handling for failed applications

## Requirements

- [Bun](https://bun.sh/) runtime
- Node.js (if not using Bun)
- Chrome/Chromium browser (for Puppeteer)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/samuelfaj/linkedIn-apply-agent.git
cd linkedIn-apply-agent
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

## Configuration

1. **Job Search URL**: Update the `jobsLink` in `src/index.ts` with your desired job search criteria:
```typescript
export const DEFINES = {
    jobsLink: `https://www.linkedin.com/jobs/search/?currentJobId=4234489284&distance=25&f_AL=true&f_WT=2&geoId=103644278&keywords=senior%20software%20engineer&origin=JOBS_HOME_SEARCH_CARDS`
}
```

2. **Search Parameters**: Modify the URL parameters to match your preferences:
   - `keywords`: Job title or skills
   - `distance`: Distance in miles
   - `f_AL=true`: Easy Apply filter
   - `f_WT=2`: Remote work filter
   - `geoId`: Location ID

## Usage

1. Start the application:
```bash
bun start
# or
npm start
```

2. The browser will open automatically
3. **Manual Login**: Log in to your LinkedIn account manually when prompted
4. The bot will automatically:
   - Navigate to the job search page
   - Scroll through job listings
   - Apply to jobs with Easy Apply enabled
   - Continue to next pages automatically

## Project Structure

```
src/
├── index.ts                 # Main entry point
├── functions.ts             # Utility functions
└── services/
    ├── ApplyService.ts      # Handles job application process
    ├── JobCardService.ts    # Manages individual job cards
    ├── LinkedInService.ts   # LinkedIn navigation and search
    └── PuppeteerService.ts  # Browser automation
```

## How It Works

1. **Initialization**: Launches a Puppeteer browser instance
2. **Login**: Waits for manual LinkedIn login
3. **Job Search**: Navigates to the specified job search URL
4. **Job Processing**: For each job:
   - Extracts job details (title, description)
   - Checks for Easy Apply button
   - Initiates application process
5. **Pagination**: Automatically moves to next page of results
6. **Continuous Operation**: Runs indefinitely until stopped

## Customization

### Modifying Job Search Criteria
Edit the `DEFINES.jobsLink` in `src/index.ts` to change:
- Job keywords
- Location
- Experience level
- Work type (remote, hybrid, on-site)
- Date posted

### Adding Custom Application Logic
Extend the `ApplyService` class to handle:
- Custom cover letters
- Answering application questions
- Uploading different resumes

## Troubleshooting

**Browser Issues**:
- Ensure Chrome/Chromium is installed
- Check Puppeteer data directory permissions

**Login Problems**:
- Manually log in when the browser opens
- Check for 2FA requirements

**Application Failures**:
- Some jobs may not have Easy Apply enabled
- Network timeouts may occur with slow connections

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

If you encounter issues:
1. Check the console output for error messages
2. Ensure you're logged into LinkedIn
3. Verify your job search URL is correct
4. Create an issue on GitHub for bugs

---

**Remember**: Use this tool responsibly and in accordance with LinkedIn's Terms of Service. Always review job postings before applying and maintain the quality of your job applications. 