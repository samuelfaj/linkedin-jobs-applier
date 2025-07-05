[![Watch the video](https://github.com/samuelfaj/linkedin-jobs-applier/blob/main/gif.gif?raw=true)](https://www.youtube.com/watch?v=HDiKCm4FkcI)

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
- **🤖 AI-Powered Question Answering**: Uses ChatGPT to automatically answer job application questions
- **📋 Personal Profile Integration**: Leverages your personal information and resume for intelligent responses
- **🔍 Context-Aware Responses**: Considers both your profile and job description when answering questions

## Requirements

- [Bun](https://bun.sh/) runtime
- Node.js (if not using Bun)
- Chrome/Chromium browser (for Puppeteer)
- OpenAI API key (for ChatGPT integration)

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

1. **OpenAI API Key**: Set up your OpenAI API key for ChatGPT integration:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

2. **Personal Profile**: Edit the `about-me.txt` file to include your personal information:
   - Update your professional background and experience
   - Add your skills and expertise
   - Include your salary expectations
   - Add your complete resume
   - Specify work preferences (remote, contract type, etc.)

3. **Job Search URL**: Update the `JOB_LINK` in `src/index.ts` with your desired job search criteria:
```typescript
export const DEFINES = {
    JOB_LINK: `https://www.linkedin.com/jobs/search/?currentJobId=4234489284&distance=25&f_AL=true&f_WT=2&geoId=103644278&keywords=senior%20software%20engineer&origin=JOBS_HOME_SEARCH_CARDS`
}
```

4. **Search Parameters**: Modify the URL parameters to match your preferences:
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
├── helpers/
│   └── ChatGptHelper.ts     # ChatGPT integration for Q&A
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
   - **🤖 AI-Powered Form Filling**: When application forms appear:
     - Analyzes each question in the form
     - Combines your personal profile from `about-me.txt`
     - Considers the job description context
     - Uses ChatGPT to generate relevant answers
     - Automatically fills various form fields (text, numbers, dates, selects)
5. **Pagination**: Automatically moves to next page of results
6. **Continuous Operation**: Runs indefinitely until stopped

## Customization

### Modifying Job Search Criteria
Edit the `DEFINES.JOB_LINK` in `src/index.ts` to change:
- Job keywords
- Location
- Experience level
- Work type (remote, hybrid, on-site)
- Date posted

### Customizing AI Responses
- **Personal Profile**: Update `about-me.txt` with your specific information
- **ChatGPT Model**: Change the model in `ChatGptHelper.ts` (default: `gpt-4o-mini`)
- **Response Prompts**: Modify the prompt structure in `ApplyService.ts` for different response styles

### Adding Custom Application Logic
Extend the `ApplyService` class to handle:
- Custom cover letters
- Specialized question answering logic
- Resume file uploads (set `RESUME_PATH` environment variable)
- Custom form field handling

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

**ChatGPT Integration Issues**:
- Ensure `OPENAI_API_KEY` environment variable is set
- Check OpenAI API quota and billing status
- Update `about-me.txt` with your personal information
- Verify internet connection for API calls

**Configuration Issues**:
- Ensure `about-me.txt` file exists and contains your information
- Check that OpenAI dependency is installed (`npm install openai`)

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
4. Check that your OpenAI API key is properly configured
5. Ensure `about-me.txt` is filled with your personal information
6. Create an issue on GitHub for bugs

## Important Files

- **`about-me.txt`**: Contains your personal profile, resume, and preferences. **Must be edited** with your information for the ChatGPT integration to work properly.
- **`src/helpers/ChatGptHelper.ts`**: Handles communication with OpenAI's ChatGPT API for intelligent form filling.

---

**Remember**: Use this tool responsibly and in accordance with LinkedIn's Terms of Service. Always review job postings before applying and maintain the quality of your job applications. The ChatGPT integration is designed to help automate responses, but you should still verify that applications align with your career goals. 
