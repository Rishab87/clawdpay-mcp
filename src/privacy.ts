
import axios, { AxiosInstance } from 'axios';

export interface PrivacyCard {
    token: string;
    card_token?: string;
    pan: string;
    cvv: string;
    exp_month: string;
    exp_year: string;
    last_four: string;
    memo: string;
    spend_limit: number;
    spend_limit_duration: 'TRANSACTION' | 'MONTHLY' | 'ANNUALLY' | 'FOREVER';
    state: 'OPEN' | 'PAUSED' | 'CLOSED';
    type: 'SINGLE_USE' | 'MERCHANT_LOCKED' | 'UNLOCKED';
    funding: {
        amount: number;
        account_name?: string;
        last_four?: string;
    };
}

export class PrivacyClient {
    private client: AxiosInstance;
    private isSandbox: boolean;

    constructor() {
        this.isSandbox = process.env.PRIVACY_SANDBOX === 'true';
        const baseUrl = this.isSandbox
            ? 'https://sandbox.privacy.com/v1'
            : 'https://api.privacy.com/v1';

        const apiKey = process.env.PRIVACY_API_KEY;

        if (!apiKey) {
            throw new Error('PRIVACY_API_KEY is required');
        }

        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `api-key ${apiKey}`
            }
        });
    }

    async createCard(
        memo: string,
        spendLimitCents: number,
        type: 'SINGLE_USE' | 'MERCHANT_LOCKED' | 'UNLOCKED' = 'SINGLE_USE'
    ): Promise<PrivacyCard> {
        try {
            const response = await this.client.post('/cards', {
                type,
                memo,
                spend_limit: spendLimitCents,
                spend_limit_duration: 'TRANSACTION'
            });
            return response.data;
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    async listCards(page = 1, pageSize = 50): Promise<PrivacyCard[]> {
        try {
            const response = await this.client.get('/cards', {
                params: { page, page_size: pageSize }
            });
            return response.data.data;
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    async getFundingSources(): Promise<any[]> {
        try {
            const response = await this.client.get('/funding');
            return response.data;
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    async getCard(cardToken: string): Promise<PrivacyCard> {
        try {
            const response = await this.client.get('/cards', {
                params: { card_token: cardToken }
            });
            const card = response.data.data.find((c: any) => c.token === cardToken);
            if (!card) throw new Error(`Card ${cardToken} not found`);
            return card;
        } catch (error: any) {
            this.handleError(error);
            throw error;
        }
    }

    private handleError(error: any) {
        if (error.response) {
            console.error(`Privacy API Error: ${error.response.status} ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(`Privacy API Error: ${error.message}`);
        }
    }
}
