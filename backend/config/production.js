// Production Configuration - Hardcoded Values
// WARNING: This file contains sensitive credentials. Keep it secure!

module.exports = {
    // Server Configuration
    PORT: 7003,
    NODE_ENV: 'production',

    // Frontend Origins
    ADMIN_ORIGIN: 'http://66.94.120.78:7002',
    USER_ORIGIN: 'http://66.94.120.78:7001',

    // Backend URL
    BACKEND_URL: 'http://66.94.120.78:7003',

    // Database
    MONGO_URI: 'mongodb+srv://resq:resq1234@cluster0.vrl9lv4.mongodb.net/resqq?appName=Cluster0',

    // Security
    JWT_SECRET: 'secret_key_change_me',

    // AWS S3 Configuration
    AWS_ACCESS_KEY_ID: 'AKIA4DMVQXOOPR3APN6A',
    AWS_SECRET_ACCESS_KEY: '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',
    AWS_REGION: 'eu-north-1',
    AWS_BUCKET_NAME: 'neverfall-image-bucket',

    // Email Service
    RESEND_API_KEY: 're_Pn5wcBo5_7f5mWsi66f964WSMF5A2cWMF',
    RESEND_FROM_EMAIL: 'onboarding@resend.dev',

    // ML Service
    ML_SERVICE_URL: 'http://ml-service:7004'
};
