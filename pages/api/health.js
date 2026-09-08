// Liveness probe for the container healthcheck and the watchdog.
// Deliberately has no Salesforce or database dependency - it answers whether
// the Next.js server is up, not whether every downstream service is.
export default function handler(req, res) {
  res.status(200).json({status: 'ok', uptime: process.uptime()});
}
