
import { PrivacyClient } from '../src/privacy.js';
import { BrowserAgent } from '../src/browser.js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function main() {
    console.log('Testing ClawdPay...');

    try {
        const privacy = new PrivacyClient();
    } catch (error: any) {
        if (error.message.includes('PRIVACY_API_KEY is required')) {
            console.log('PASS: API Key check passed.');
        } else {
            throw error;
        }
    }

    try {
        const browser = new BrowserAgent();
        const testFileDetails = path.resolve(process.cwd(), './scripts/test-form.html');
        const url = `file://${testFileDetails}`;

        console.log(`Browsing ${url}`);
        await browser.navigate(url);

        console.log('Filling form...');
        const result = await browser.smartFillPayment({
            pan: '4111111111111111',
            cvv: '123',
            expMonth: '12',
            expYear: '2030'
        });

        console.log(`Result: ${result}`);
        await browser.close();
    } catch (error: any) {
        console.error('Browser test failed:', error);
    }
}

main().catch(console.error);
