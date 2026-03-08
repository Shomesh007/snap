/// <reference types="vite/client" />

interface ImportMetaEnv {
    /**
     * Full AWS API Gateway base URL — set in Amplify environment variables.
     * Example: https://abc123.execute-api.us-east-1.amazonaws.com
     *
     * Leave blank (unset) for local dev — Vite proxy handles /api/* automatically.
     */
    readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
