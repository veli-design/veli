import console from 'node:console';

// Only completed axe findings are advisory. Rejected scans and later assertions
// propagate normally so browser, execution and functional failures still block CI.
export async function warnAccessibilityViolations(scan, warn = console.warn) {
  const { violations } = await scan;
  for (const violation of violations) {
    const details = JSON.stringify({
      rule: violation.id,
      impact: violation.impact,
      help: violation.help,
      url: violation.helpUrl,
      nodes: violation.nodes.map(({ target, html, failureSummary }) => ({
        target,
        html,
        failureSummary,
      })),
    });
    // Escape workflow-command data so node content cannot inject annotations.
    warn(
      `::warning title=Accessibility (axe)::${details.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A')}`,
    );
  }
}
