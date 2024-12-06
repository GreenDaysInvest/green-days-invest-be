export default () => {
  // Set default environment to development
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  
  console.log('Current NODE_ENV:', process.env.NODE_ENV);
  console.log('Loading configuration with webhook secret:', process.env.STRIPE_WEBHOOK_SECRET);
  
  const config = {
    nodeEnv: process.env.NODE_ENV,
    database: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5434,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      name: process.env.DATABASE_NAME,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      identityKey: process.env.STRIPE_IDENTITY_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    frontend: {
      url: process.env.FRONTEND_URL,
    },
  };

  console.log('Stripe config:', {
    secretKey: config.stripe.secretKey ? 'set' : 'not set',
    publishableKey: config.stripe.publishableKey ? 'set' : 'not set',
    identityKey: config.stripe.identityKey ? 'set' : 'not set',
    webhookSecret: config.stripe.webhookSecret ? 'set' : 'not set',
  });

  return config;
};
