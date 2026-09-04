import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('C:\\Users\\lqr_l\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright');

const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
});

const jobs = [
    {
        input: 'D:\\Job\\job-final\\简历\\刘启仁_AI应用与Agent工程_中文简历_MT版.html',
        output: 'D:\\Job\\job-final\\简历\\刘启仁_AI应用与Agent工程_中文简历_MT版.pdf',
    },
    {
        input: 'D:\\Job\\job-final\\简历\\Qiren_Liu_AI_Agent_Backend_Software_Engineer_Resume.html',
        output: 'D:\\Job\\job-final\\简历\\Qiren_Liu_AI_Agent_Backend_Software_Engineer_Resume.pdf',
    },
];

try {
    for (const job of jobs) {
        const page = await browser.newPage();
        await page.goto(pathToFileURL(job.input).href, { waitUntil: 'networkidle' });
        await page.emulateMedia({ media: 'print' });
        await page.pdf({
            path: job.output,
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
        });
        await page.close();
    }
} finally {
    await browser.close();
}
