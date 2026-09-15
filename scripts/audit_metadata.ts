/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standalone Metadata & Review Auditor CLI
 * Checks:
 * 1) Accuracy of show card images (Posters & 16:9 Key Art Banners)
 * 2) Accuracy of air times and dates (Strict ISO YYYY-MM-DD + Air Time)
 * 3) Accuracy of streaming channel (Standardized platform mapping)
 * 4) Accuracy of episode titles (Provisional vs Final creative titles)
 * 
 * Run via: npm run audit-metadata or npm run sync-metadata
 */

import { runPeriodicMetadataAudit, getMetadataSyncTelemetry } from "../server/periodicMetadataSync";

async function main() {
  console.log("=================================================");
  console.log(" CouchTaterz 4-Pillar Metadata Integrity Auditor ");
  console.log("=================================================");
  console.log("Pillars audited:");
  console.log("  [1] Show card image accuracy (HD 16:9 Key Art, dead-link repair)");
  console.log("  [2] Air times and dates accuracy (ISO YYYY-MM-DD, air times, concluded)");
  console.log("  [3] Streaming channel accuracy (Apple TV+, Max/HBO, Prime Video, etc.)");
  console.log("  [4] Episode title accuracy (Provisional TBA/TBD -> Finalized titles)");
  console.log("=================================================\n");

  const result = await runPeriodicMetadataAudit({ force: true, triggerSource: 'manual' });

  console.log("\n=================================================");
  console.log(" AUDIT RUN REPORT                                ");
  console.log("=================================================");
  console.log(`Execution Time:          ${result.durationMs} ms`);
  console.log(`Total Shows Audited:     ${result.totalShowsAudited}`);
  console.log(`Card Images Upgraded:    ${result.summary.bannersCount}`);
  console.log(`Air Dates/Times Synced:  ${result.summary.airDatesCount}`);
  console.log(`Channels Standardized:   ${result.summary.channelsCount}`);
  console.log(`Episode Titles Finalized:${result.summary.titlesCount}`);
  console.log(`Total Shows Modified:    ${result.summary.showsModified}`);
  console.log("=================================================\n");

  if (result.changes.length > 0) {
    console.log("[Detailed Field Diffs]:");
    result.changes.slice(0, 25).forEach((c) => {
      console.log(`  • [${c.field.toUpperCase()}] ${c.showTitle}:`);
      console.log(`      From: ${c.oldValue || '(none)'}`);
      console.log(`      To:   ${c.newValue}`);
      if (c.detail) console.log(`      Info: ${c.detail}`);
    });
    if (result.changes.length > 25) {
      console.log(`  ... and ${result.changes.length - 25} more modifications.`);
    }
  } else {
    console.log("✓ All catalog metadata is 100% verified and pristine.");
  }
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
