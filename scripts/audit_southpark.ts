import fs from "fs";
import path from "path";
import { auditShow, createEmptyAuditResult } from "../server/metadataAuditor";
import { SHOW_SCHEDULES } from "../server/showSchedules";

async function main() {
  const dbPath = path.join(process.cwd(), "data.json");
  if (!fs.existsSync(dbPath)) {
    console.error("No data.json found!");
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  let totalFixed = 0;

  for (const [boardId, board] of Object.entries(db as Record<string, any>)) {
    if (!board || !Array.isArray(board.shows)) continue;
    const spIndex = board.shows.findIndex((s: any) => s.title && s.title.toLowerCase().trim() === "south park");
    if (spIndex !== -1) {
      const show = board.shows[spIndex];
      const auditResult = createEmptyAuditResult();
      const modified = auditShow(show, auditResult);

      // Verify and guarantee latestWatched title
      if (show.latestWatched && show.latestWatched.season === 29 && show.latestWatched.episode === 1) {
        show.latestWatched.title = "South American Biker Gangs";
      }

      console.log(`\n--- Board: ${boardId} ---`);
      console.log(`South Park modified: ${modified}`);
      console.log(`Season 24 count in episodesPerSeason: ${show.episodesPerSeason?.[23]}`);
      console.log(`S24E1: "${show.episodes?.['S24E1']}"`);
      console.log(`S24E2: "${show.episodes?.['S24E2']}"`);
      console.log(`S26E5: "${show.episodes?.['S26E5']}"`);
      console.log(`S29E1: "${show.episodes?.['S29E1']}"`);
      console.log(`latestWatched:`, show.latestWatched);
      console.log(`nextEpisode:`, show.nextEpisode);
      totalFixed++;
    }
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
  console.log(`\nSuccessfully audited and saved South Park on ${totalFixed} boards in data.json`);

  // Also sync to data/julioMasterShows.json
  const masterPath = path.join(process.cwd(), "data", "julioMasterShows.json");
  if (fs.existsSync(masterPath)) {
    const masterShows = JSON.parse(fs.readFileSync(masterPath, "utf8"));
    const sp = masterShows.find((s: any) => s.title && s.title.toLowerCase().trim() === "south park");
    if (sp) {
      const auditResult = createEmptyAuditResult();
      auditShow(sp, auditResult);
      if (sp.latestWatched && sp.latestWatched.season === 29 && sp.latestWatched.episode === 1) {
        sp.latestWatched.title = "South American Biker Gangs";
      }
      fs.writeFileSync(masterPath, JSON.stringify(masterShows, null, 2), "utf8");
      console.log("Successfully updated South Park in data/julioMasterShows.json");
    }
  }

  console.log("South Park audit completed successfully.");
}

main().catch(err => {
  console.error("Error auditing South Park:", err);
  process.exit(1);
});
