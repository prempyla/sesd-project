/**
 * SlaProvider — Strategy Pattern implementation.
 * Encapsulates SLA deadline calculation and auto-priority assignment logic.
 * This is a pure utility class with no dependencies (easy to unit test).
 */
class SlaProvider {
  /**
   * Priority-to-hours mapping (SLA windows).
   * P1 = critical (2h), P2 = high (6h), P3 = medium (24h), P4 = low (72h)
   */
  static SLA_HOURS = {
    P1: 2,
    P2: 6,
    P3: 24,
    P4: 72,
  };

  /**
   * Category + Impact → Priority matrix.
   * Implements smart auto-priority assignment.
   */
  static PRIORITY_MATRIX = {
    Payment: { HIGH: 'P1', MEDIUM: 'P1', LOW: 'P2' },
    Technical: { HIGH: 'P1', MEDIUM: 'P2', LOW: 'P3' },
    Account: { HIGH: 'P2', MEDIUM: 'P3', LOW: 'P4' },
    General: { HIGH: 'P3', MEDIUM: 'P4', LOW: 'P4' },
  };

  /**
   * Calculates SLA deadline from the current time.
   * @param {string} priority - P1 | P2 | P3 | P4
   * @returns {Date}
   */
  getDeadline(priority) {
    const hours = SlaProvider.SLA_HOURS[priority];
    if (!hours) throw new Error(`Unknown priority: ${priority}`);
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + hours);
    return deadline;
  }

  /**
   * Calculates auto-priority based on category and impact.
   * @param {string} category
   * @param {string} impact
   * @returns {string} priority
   */
  calculatePriority(category, impact) {
    const matrix = SlaProvider.PRIORITY_MATRIX[category];
    if (!matrix) return 'P3'; // Default for unknown categories
    return matrix[impact] || 'P3';
  }

  /**
   * Checks if a ticket has breached its SLA.
   * @param {Date} slaDeadline
   * @returns {boolean}
   */
  isBreached(slaDeadline) {
    return new Date() > new Date(slaDeadline);
  }

  getSlaHours(priority) {
    return SlaProvider.SLA_HOURS[priority];
  }
}

module.exports = new SlaProvider();
