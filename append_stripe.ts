import fs from 'fs';
const content = fs.readFileSync('server.ts', 'utf-8');

const portalCode = `
app.post("/api/billing-portal", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const stripe = getStripe();
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    
    // Normally you'd get the customer ID from the authenticated user.
    // For demo purposes, we require the checkout session ID.
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session.customer) {
      return res.status(400).json({ error: "No customer associated with this session" });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: session.customer as string,
      return_url: appUrl,
    });
    
    res.json({ url: portalSession.url });
  } catch (err: any) {
    console.warn("Stripe Portal Error:", err.message);
    res.status(500).json({ error: err.message || "Portal failed" });
  }
});
`;

// Insert after checkout
const insertIndex = content.indexOf('app.get("/api/health"');
if (insertIndex > -1) {
  const newContent = content.slice(0, insertIndex) + portalCode + '\n' + content.slice(insertIndex);
  fs.writeFileSync('server.ts', newContent);
  console.log("Portal endpoint injected");
}
