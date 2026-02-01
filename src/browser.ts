
import { chromium, Browser, Page, Frame } from 'playwright';

export interface PaymentDetails {
    pan: string;
    cvv: string;
    expMonth: string;
    expYear: string;
}

export class BrowserAgent {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async launch(): Promise<void> {
        if (!this.browser) {
            this.browser = await chromium.launch({
                headless: process.env.HEADLESS !== 'false',
                args: ['--no-sandbox']
            });
        }
        if (!this.page) {
            this.page = await this.browser.newPage();
        }
    }

    async navigate(url: string): Promise<string> {
        await this.launch();
        if (!this.page) throw new Error('Browser not initialized');
        await this.page.goto(url, { waitUntil: 'networkidle' });
        return this.page.title();
    }

    async smartFillPayment(details: PaymentDetails): Promise<string> {
        if (!this.page) throw new Error('Browser not launched');

        const frames = [this.page.mainFrame(), ...this.page.frames()];
        const log: string[] = [];

        for (const frame of frames) {
            const found = await this.fillInFrame(frame, details);
            if (found.length > 0) {
                log.push(...found);
            }
        }

        return log.length > 0 ? log.join(', ') : 'No payment fields identified';
    }

    private async fillInFrame(frame: Frame, details: PaymentDetails): Promise<string[]> {
        const filled: string[] = [];

        const strategies = {
            pan: [
                { label: /card number|card_number|number|cc-number|pan/i },
                { placeholder: /0000 0000|card number/i },
                { selector: 'input[autocomplete="cc-number"]' },
                { selector: 'input[name*="card" i][name*="number" i]' }
            ],
            cvv: [
                { label: /cvc|cvv|security code|security_code|code/i },
                { placeholder: /123|cvc|cvv/i },
                { selector: 'input[autocomplete="cc-csc"]' },
                { selector: 'input[name*="cvc" i], input[name*="cvv" i]' }
            ],
            expiry: [
                { label: /expiration|expiry|exp date|mm\/yy/i },
                { placeholder: /mm\/yy/i },
                { selector: 'input[autocomplete="cc-exp"]' },
                { selector: 'input[name*="exp" i]' }
            ],
            expMonth: [
                { label: /month|mm/i },
                { selector: 'input[autocomplete="cc-exp-month"]' }
            ],
            expYear: [
                { label: /year|yy/i },
                { selector: 'input[autocomplete="cc-exp-year"]' }
            ]
        };

        const fillField = async (fieldStrategies: any[], value: string, name: string) => {
            for (const strat of fieldStrategies) {
                try {
                    let locator;
                    if (strat.label) locator = frame.getByLabel(strat.label);
                    else if (strat.placeholder) locator = frame.getByPlaceholder(strat.placeholder);
                    else if (strat.selector) locator = frame.locator(strat.selector);

                    if (locator && await locator.count() > 0 && await locator.first().isVisible()) {
                        await locator.first().fill(value);
                        filled.push(`Filled ${name}`);
                        return true;
                    }
                } catch (e) { }
            }
            return false;
        };

        await fillField(strategies.pan, details.pan, 'PAN');
        await fillField(strategies.cvv, details.cvv, 'CVV');

        const expFilled = await fillField(strategies.expiry, `${details.expMonth}/${details.expYear.slice(-2)}`, 'Expiry');
        if (!expFilled) {
            await fillField(strategies.expMonth, details.expMonth, 'Exp Month');
            await fillField(strategies.expYear, details.expYear, 'Exp Year');
        }

        return filled;
    }

    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }
}
