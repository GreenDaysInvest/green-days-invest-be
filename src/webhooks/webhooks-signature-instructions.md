HomeDeveloper toolsEvent DestinationsWebhook endpoint
Resolve webhook signature verification errors
Learn how to fix a common error when listening to webhook events.
When processing webhook events, we recommend securing your endpoint by verifying that the event is coming from Stripe. To do so, use the Stripe-Signature header and call the constructEvent() function with three parameters:

requestBody: the request body string sent by Stripe
signature: the Stripe-Signature header in the request sent by Stripe
endpointSecret: the secret associated with your endpoint
Select a language


Stripe::Webhook.construct_event(request_body, signature, endpoint_secret)
This function might trigger a signature verification error.



Webhook signature verification failed. Err: No signatures found matching the expected signature for payload.
If you get this error, at least one of the three parameters you passed to the above function is incorrect. The following steps explain how to verify that each parameter is correctly set.

Check the endpoint secret
The most common error is using the wrong endpoint secret. If you’re using a webhook endpoint created in the Dashboard, open the endpoint in the Dashboard and click the Reveal secret link near the top of the page to view the secret.

Dashboard screenshot showing where to find the webhook secret key
If you’re using the Stripe CLI, the secret is printed in the Terminal when you run the stripe listen command.

cli screenshot showing where to find the webhook secret key
In both cases, the secret starts with a whsec_ prefix, but the secret itself is different. Don’t verify signatures on events forwarded by the CLI using the secret from a Dashboard-managed endpoint, or the other way around.

Finally, print the endpointSecret used in your code, and make sure that it matches the one you found above.

Check the request body
The request body must be the body string that Stripe sends in UTF-8 encoding without any changes. When you print it as a string, it looks similar to this:



{
  "id": "evt_xxx",
  "object": "event",
  "data": {
      ...
  }
}
Retrieve the raw request body
Some frameworks might edit the request body by doing things like adding or removing whitespace, reordering the key-value pairs, converting the string to JSON, or changing the encoding. All of these cases lead to a failed signature verification.

The following is a non-exhaustive list of frameworks that might parse or mutate the data using common configurations, and some tips on how to get the raw request body.

Framework	Retrieval method
stripe-node library with Express	Follow our integration quickstart guide.
stripe-node library with Body Parser	Try solutions listed in this GitHub issue.
stripe-node library using Next.js endpoints	Try disabling bodyParser and using buffer(request), like in this example.
AWS API Gateway with Lambda function
To retrieve the raw request body for the AWS API Gateway with Lambda function, in the API Gateway, set up a Body Mapping Template like this:

Content-Type: application/json
Template contents:


{
  "method": "$context.httpMethod",
  "body": $input.json('$'),
  "rawBody": "$util.escapeJavaScript($input.body).replaceAll("\\'", "'")",
  "headers": {
    #foreach($param in $input.params().header.keySet())
    "$param": "$util.escapeJavaScript($input.params().header.get($param))"
    #if($foreach.hasNext),#end
    #end
  }
}
Then, in the Lambda function, access the raw body with the event’s rawBody property and the headers with the event’s headers property.

Check the signature
Print the signature parameter, and confirm that it looks similar to this:



t=xxx,v1=yyy,v0=zzz
If not, check if you have an issue in your code when trying to extract the signature from the header.

# Stripe Webhook Signature Verification Guide

## Common Issues and Solutions

1. **Raw Body Preservation**
   - The raw request body must be preserved exactly as received from Stripe
   - Any modification to the body (parsing, encoding, etc.) will break the signature
   - Even newline changes can invalidate the signature

2. **Middleware Setup**
   - Must use `express.raw()` before any body parsers
   - Set `verify` function to preserve raw body
   - Disable body parsing for webhook endpoint

3. **Content Type**
   - Stripe sends webhooks with `application/json`
   - Must handle both raw and JSON content types

## Implementation Steps

1. Update NestJS app configuration:
```typescript
app.use('/webhooks/stripe', 
  express.raw({ 
    type: 'application/json',
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    }
  })
);
```

2. Configure JSON parsing for other routes:
```typescript
app.use((req, res, next) => {
  if (req.originalUrl === '/webhooks/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
```

3. Webhook Controller Implementation:
```typescript
@Post('/stripe')
async handleStripeWebhook(
  @Req() request: Request,
  @Headers('stripe-signature') signature: string,
) {
  const rawBody = request.rawBody;
  const event = this.stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
```

## Testing

1. Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

2. Verify webhook secret is correctly set:
```bash
echo $STRIPE_WEBHOOK_SECRET
```

## Troubleshooting

1. If signature verification fails:
   - Check webhook secret is correct
   - Verify raw body is preserved
   - Check for any body parsing middleware
   - Enable debug logging

2. Common Error Messages:
   - "No signatures found": Raw body was modified
   - "Timestamp outside tolerance": Clock skew or delayed request
   - "No webhook secret": Environment variable not set