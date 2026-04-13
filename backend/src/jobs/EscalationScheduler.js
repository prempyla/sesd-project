const cron = require('node-cron');
const EscalationEngine = require('./EscalationEngine');

/**
 * EscalationScheduler — Schedules the Escalation Engine to run every 5 minutes.
 * Uses node-cron for reliable background job execution.
 */
class EscalationScheduler {
  start() {
    console.log('[SCHEDULER] EscalationScheduler started — running every 5 minutes.');

    // Run immediately on startup to catch any existing breaches
    EscalationEngine.runEscalationCheck();

    // Schedule: every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await EscalationEngine.runEscalationCheck();
    });
  }
}

module.exports = new EscalationScheduler();
