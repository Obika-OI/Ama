import fs from 'fs';
const content = fs.readFileSync('server.ts', 'utf-8');

const stripeCode = `
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
  }
  return stripeClient;
}

app.post("/api/checkout", async (req: Request, res: Response) => {
  try {
    const { priceId } = req.body;
    const stripe = getStripe();
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    
    // In a real app, priceId should be mapped to actual Stripe Price IDs or products.
    // For now we map logic conceptually.
    
    // If not a real price ID in your stripe, we can just create a price on the fly for demonstration:
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: priceId === 'price_prepaid' ? 'payment' : 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: priceId === 'price_prepaid' ? 'Ama Premium - 3 Month Pass' 
                   : priceId === 'price_annual' ? 'Ama Premium - Annual' 
                   : 'Ama Premium - Monthly',
            },
            unit_amount: priceId === 'price_prepaid' ? 1900 
                        : priceId === 'price_annual' ? 5900 
                        : 900,
            recurring: priceId !== 'price_prepaid' ? {
              interval: priceId === 'price_annual' ? 'year' : 'month'
            } : undefined
          },
          quantity: 1,
        }
      ],
      success_url: \`\${appUrl}?success=true\`,
      cancel_url: \`\${appUrl}?canceled=true\`,
    });
    
    res.json({ url: session.url });
  } catch (err: any) {
    console.warn("Stripe Checkout Error:", err.message);
    res.status(500).json({ error: err.message || "Checkout failed" });
  }
});
`;

// Insert the stripe code right before // Health check endpoint
const insertIndex = content.indexOf('// Health check endpoint');
if (insertIndex > -1) {
  const newContent = content.slice(0, insertIndex) + stripeCode + '\n' + content.slice(insertIndex);
  fs.writeFileSync('server.ts', newContent);
  console.log("Stripe endpoints injected");
} else {
  console.log("Could not find injection point");
}
