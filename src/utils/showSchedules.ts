/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextEpisode, TvShow, WatchedEpisode } from '../types';

export interface CanonicalEpisode {
  season: number;
  episode: number;
  title: string;
  airDate: string; // YYYY-MM-DD
  overview?: string;
}

export interface ShowScheduleData {
  title: string;
  streamingService?: string;
  concluded?: boolean;
  totalSeasons?: number;
  episodes: CanonicalEpisode[];
}

/**
 * Curated Canonical Episode Air Date Schedules for TV Shows
 */
export const SHOW_SCHEDULES: Record<string, ShowScheduleData> = {
  "lioness": {
    title: "Lioness",
    streamingService: "Paramount+",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "The Spider and the Fly", airDate: "2026-08-02", overview: "Joe and the Lioness team embark on a dangerous new operation as Season 3 begins." },
      { season: 3, episode: 2, title: "Beware the Second Strike", airDate: "2026-08-09", overview: "The team infiltrates an underground cartel network while Joe manages escalating domestic pressure." },
      { season: 3, episode: 3, title: "In the Shadows", airDate: "2026-08-16", overview: "A critical intelligence breach puts the operative in extreme peril behind enemy lines." },
      { season: 3, episode: 4, title: "The Reckoning", airDate: "2026-08-23", overview: "Joe and the Lioness team navigate hostile territory under deep cover as the mission intensifies." },
      { season: 3, episode: 5, title: "The Trap", airDate: "2026-08-30", overview: "An unexpected betrayal forces the team into an emergency tactical extraction protocol." },
      { season: 3, episode: 6, title: "Extraction", airDate: "2026-09-06", overview: "With assets compromised, Joe coordinates an unauthorized cross-border rescue operation." },
      { season: 3, episode: 7, title: "Zero Hour", airDate: "2026-09-13", overview: "The Lioness team prepares their final offensive as geopolitical stakes reach a boiling point." },
      { season: 3, episode: 8, title: "The Lion's Den", airDate: "2026-09-20", overview: "Season 3 finale: The high-stakes showdown comes to a devastating conclusion." }
    ]
  },
  "special ops: lioness": {
    title: "Special Ops: Lioness",
    streamingService: "Paramount+",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "The Spider and the Fly", airDate: "2026-08-02", overview: "Joe and the Lioness team embark on a dangerous new operation as Season 3 begins." },
      { season: 3, episode: 2, title: "Beware the Second Strike", airDate: "2026-08-09", overview: "The team infiltrates an underground cartel network while Joe manages escalating domestic pressure." },
      { season: 3, episode: 3, title: "In the Shadows", airDate: "2026-08-16", overview: "A critical intelligence breach puts the operative in extreme peril behind enemy lines." },
      { season: 3, episode: 4, title: "The Reckoning", airDate: "2026-08-23", overview: "Joe and the Lioness team navigate hostile territory under deep cover as the mission intensifies." },
      { season: 3, episode: 5, title: "The Trap", airDate: "2026-08-30", overview: "An unexpected betrayal forces the team into an emergency tactical extraction protocol." },
      { season: 3, episode: 6, title: "Extraction", airDate: "2026-09-06", overview: "With assets compromised, Joe coordinates an unauthorized cross-border rescue operation." },
      { season: 3, episode: 7, title: "Zero Hour", airDate: "2026-09-13", overview: "The Lioness team prepares their final offensive as geopolitical stakes reach a boiling point." },
      { season: 3, episode: 8, title: "The Lion's Den", airDate: "2026-09-20", overview: "Season 3 finale: The high-stakes showdown comes to a devastating conclusion." }
    ]
  },
  "neagley": {
    title: "Neagley",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "First Rule", airDate: "2026-08-28", overview: "When a former military colleague from the 110th Special Investigations Unit dies under suspicious circumstances, Frances Neagley launches a relentless private investigation." },
      { season: 1, episode: 2, title: "Bad Blood", airDate: "2026-09-04", overview: "Neagley uncovers a corporate conspiracy connecting defense contractors to corrupt government officials." },
      { season: 1, episode: 3, title: "Shadow Protocol", airDate: "2026-09-11", overview: "Targeted by professional hitmen, Neagley goes off the grid to turn the hunters into the hunted." },
      { season: 1, episode: 4, title: "The Setup", airDate: "2026-09-18", overview: "A break-in at a high-security tech facility reveals a global cyber-espionage conspiracy." },
      { season: 1, episode: 5, title: "Payback", airDate: "2026-09-25", overview: "With help from unexpected allies, Neagley corners the mastermind behind the killings." },
      { season: 1, episode: 6, title: "Retribution", airDate: "2026-10-02", overview: "Season 1 finale: Frances Neagley settles the score in a high-octane confrontation." }
    ]
  },
  "silo": {
    title: "Silo",
    streamingService: "Apple TV",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 7, title: "Radio", airDate: "2026-08-14", overview: "Juliette attempts a dangerous transmission across the abandoned frequencies." },
      { season: 3, episode: 8, title: "Gray Goo", airDate: "2026-08-21", overview: "Juliette races against time to decrypt the founders' mainframe before the silo's life support is terminated." },
      { season: 3, episode: 9, title: "The Surface", airDate: "2026-08-28", overview: "The truth about what lies beyond the airlock becomes impossible to conceal." },
      { season: 3, episode: 10, title: "Legacy", airDate: "2026-09-04", overview: "Season 3 finale: The ultimate struggle for the future of the remaining silos." }
    ]
  },
  "lanterns": {
    title: "Lanterns",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Pilot", airDate: "2026-08-16", overview: "Hal Jordan and John Stewart are drawn into a terrestrial murder investigation that spans across the cosmos." },
      { season: 1, episode: 2, title: "Trust Fall", airDate: "2026-08-23", overview: "Hal and John follow an anomalous energy trace to an abandoned research outpost in Nebraska." },
      { season: 1, episode: 3, title: "The Ring Bearer", airDate: "2026-08-30", overview: "Tensions flare between the veteran Lantern and the rookie as new extraterrestrial evidence emerges." },
      { season: 1, episode: 4, title: "Dark Matter", airDate: "2026-09-06", overview: "A mysterious ancient weapon threatens to destabilize Sector 2814." }
    ]
  },
  "the shards": {
    title: "The Shards",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 5, title: "The Invitation", airDate: "2026-08-19", overview: "A lavish party in the Hollywood Hills turns sinister as suspicions intensify." },
      { season: 1, episode: 6, title: "Homecoming: Part 1", airDate: "2026-08-26", overview: "Bret and his classmates navigate escalating paranoia as the Trawler's presence draws closer to Buckley." },
      { season: 1, episode: 7, title: "Homecoming: Part 2", airDate: "2026-09-02", overview: "The homecoming dance becomes the backdrop for a terrifying confrontation." },
      { season: 1, episode: 8, title: "Season Finale", airDate: "2026-09-09", overview: "Bret uncovers the horrifying truth about Robert Mallory." }
    ]
  },
  "reacher": {
    title: "Reacher",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 4, episode: 4, title: "Ambush", airDate: "2026-08-19", overview: "Reacher encounters an elite mercenary squad tracking his movements." },
      { season: 4, episode: 5, title: "Bridge", airDate: "2026-08-26", overview: "Reacher and his allies race to intercept an armed convoy before it reaches Philadelphia." },
      { season: 4, episode: 6, title: "Crossfire", airDate: "2026-09-02", overview: "A tactical assault on a warehouse leads to unexpected collateral damage." },
      { season: 4, episode: 7, title: "No Safe Harbor", airDate: "2026-09-09", overview: "Reacher cuts off the villain's escape routes along the eastern seaboard." },
      { season: 4, episode: 8, title: "Justice Served", airDate: "2026-09-16", overview: "Season 4 finale: Jack Reacher delivers his unmistakable brand of justice." }
    ]
  },
  "the walking dead: dead city": {
    title: "The Walking Dead: Dead City",
    streamingService: "AMC+",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 4, title: "Found / Lost", airDate: "2026-08-16", overview: "Maggie and Negan struggle through the flooded subway tunnels of Manhattan." },
      { season: 3, episode: 5, title: "The Tower", airDate: "2026-08-23", overview: "Maggie and Negan face a perilous ultimatum atop Manhattan's fortified high-rises." },
      { season: 3, episode: 6, title: "Manhattan Lockdown", airDate: "2026-08-30", overview: "The Dama initiates a full quarantine protocol across the borough." }
    ]
  },
  "futurama": {
    title: "Futurama",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 14,
    episodes: [
      { season: 14, episode: 4, title: "Lords of the Ring", airDate: "2026-08-17", overview: "Fry accidentally wears a hyper-advanced quantum engagement ring with disastrous cosmic effects." },
      { season: 14, episode: 5, title: "Attack of the 50 Foot Amy", airDate: "2026-08-24", overview: "Amy undergoes an experimental growth particle test that causes colossal chaos across New New York." },
      { season: 14, episode: 6, title: "Planet Express Yourself", airDate: "2026-08-31", overview: "Hermes enters the crew into an intergalactic corporate efficiency competition." },
      { season: 14, episode: 7, title: "Bender's Game 2.0", airDate: "2026-09-07", overview: "The crew gets trapped inside an ancient holographic fantasy role-playing simulator." }
    ]
  },
  "it's always sunny in philadelphia": {
    title: "It's Always Sunny in Philadelphia",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 18,
    episodes: [
      { season: 18, episode: 1, title: "Frank Marries a Corpse", airDate: "2026-08-17", overview: "Frank concocts an outrageous tax shelter scheme involving a fraudulent estate." },
      { season: 18, episode: 2, title: "Dennis Gets a Real Job", airDate: "2026-08-24", overview: "Dennis infiltrates corporate America as a lifestyle coach with catastrophic results." },
      { season: 18, episode: 3, title: "Dee Wins a Pageant", airDate: "2026-08-31", overview: "Dee enters a local seniors beauty pageant under suspicious pretenses." },
      { season: 18, episode: 4, title: "Charlie's Legal Defense", airDate: "2026-09-07", overview: "Charlie represents the bar in municipal court using Bird Law." }
    ]
  },
  "stuart fails to save the universe": {
    title: "Stuart Fails to Save the Universe",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 4, title: "Spoiler: Bert Is Magic", airDate: "2026-08-13", overview: "Stuart's roommate reveals a startling hidden talent that accidentally alters the timeline." },
      { season: 1, episode: 5, title: "Spoiler: Gary Works for UPS", airDate: "2026-08-20", overview: "Stuart discovers an interdimensional parcel delivery network operating out of a local shipping hub." },
      { season: 1, episode: 6, title: "Spoiler: The Multiverse Collapses", airDate: "2026-08-27", overview: "Stuart tries to fix a minor temporal rift and accidentally breaks reality." }
    ]
  },
  "x-men '97": {
    title: "X-Men '97",
    streamingService: "Disney+",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 9, title: "The Dead Man's Hand", airDate: "2026-08-12", overview: "Gambit and Rogue face an echo from their past as Apocalypse moves his forces into position." },
      { season: 2, episode: 10, title: "Age of Apocalypse Finale", airDate: "2026-08-26", overview: "The X-Men unite across fractured timelines for the ultimate battle against Apocalypse." }
    ]
  },
  "rick and morty": {
    title: "Rick and Morty",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 9,
    episodes: [
      { season: 9, episode: 4, title: "A Ricker Runs Through It", airDate: "2026-08-16", overview: "Rick takes the family on a mind-bending fishing trip across parallel quantum streams." },
      { season: 9, episode: 5, title: "Morty of the Dead", airDate: "2026-08-30", overview: "Rick and Morty navigate a dimension where obsolete pop culture tropes come back as zombies." },
      { season: 9, episode: 6, title: "The Rickshank Redemption Part 2", airDate: "2026-09-06", overview: "Rick is framed for an intergalactic crime he surprisingly didn't commit." }
    ]
  },
  "harley quinn": {
    title: "Harley Quinn",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 5,
    episodes: [
      { season: 5, episode: 1, title: "Gotham City Sirens", airDate: "2026-09-04", overview: "Harley, Ivy, and Catwoman team up for an audacious heist across Gotham's most exclusive districts." },
      { season: 5, episode: 2, title: "Poison Ivy League", airDate: "2026-09-11", overview: "Ivy attends a prestigious botanical summit that turns into a supervillain battle royale." }
    ]
  },
  "primal": {
    title: "Primal",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "The Ash Land", airDate: "2026-09-13", overview: "Spear and Fang encounter a desolate volcanic realm inhabited by colossal primordial beasts." },
      { season: 3, episode: 2, title: "Echoes of the Past", airDate: "2026-09-20", overview: "A mysterious ancient monument reveals cryptic visions of what came before." }
    ]
  },
  "south park": {
    title: "South Park",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 29,
    episodes: [
      { season: 29, episode: 1, title: "AI Takeover", airDate: "2026-09-16", overview: "The boys discover the entire school administration has been replaced by experimental AI chatbots." }
    ]
  },
  "slow horses": {
    title: "Slow Horses",
    streamingService: "Apple TV",
    concluded: false,
    totalSeasons: 6,
    episodes: [
      { season: 6, episode: 1, title: "Dead Drop", airDate: "2026-09-16", overview: "Jackson Lamb and Slough House uncover a rogue MI5 sleeper cell operating on British soil." }
    ]
  },
  "scrubs": {
    title: "Scrubs",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "My New Routine", airDate: "2026-09-30", overview: "J.D. and Turk return to Sacred Heart to mentor the next generation of chaotic medical interns." }
    ]
  },
  "abbott elementary": {
    title: "Abbott Elementary",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 6,
    episodes: [
      { season: 6, episode: 1, title: "Back to School Night", airDate: "2026-10-07", overview: "Janine and Gregory start a brand new school year with unexpected district funding cuts." }
    ]
  },
  "from": {
    title: "From",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 4, episode: 1, title: "Into the Woods", airDate: "2026-10-18", overview: "Boyd discovers a subterranean doorway beneath the town that changes everything." }
    ]
  },
  "fallout": {
    title: "Fallout",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "New Vegas Bound", airDate: "2026-11-12", overview: "Lucy, the Ghoul, and Maximus arrive at the glowing neon ruins of New Vegas." }
    ]
  },
  "stranger things": {
    title: "Stranger Things",
    streamingService: "Netflix",
    concluded: false,
    totalSeasons: 5,
    episodes: [
      { season: 5, episode: 1, title: "The Crawl", airDate: "2026-11-20", overview: "Eleven and the Hawkins gang prepare for the ultimate confrontation against Vecna." }
    ]
  },
  "severance": {
    title: "Severance",
    streamingService: "Apple TV",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "Hello Ms. Cobel", airDate: "2026-12-05", overview: "Mark and the severed floor face strict security protocols in the aftermath of the overtime leak." },
      { season: 2, episode: 2, title: "The Aftermath", airDate: "2026-12-12", overview: "Lumon tightens its grip on Macrodata Refinement while Dylan navigates new department restrictions." },
      { season: 2, episode: 3, title: "Who Is Alive?", airDate: "2026-12-19", overview: "Mark seeks clandestine answers regarding Gemma's fate inside the testing floor." },
      { season: 2, episode: 4, title: "Woe", airDate: "2026-12-26", overview: "Helly confronts the board as new severed department personnel are introduced." },
      { season: 2, episode: 5, title: "The Overtime Protocol", airDate: "2027-01-02", overview: "Irving searches for old acquaintances on the outside." },
      { season: 2, episode: 6, title: "Cold Harbor", airDate: "2027-01-09", overview: "A security breach threatens Lumon's key initiative." },
      { season: 2, episode: 7, title: "The Board", airDate: "2027-01-16", overview: "The severed staff orchestrates an audacious synchronized gambit." },
      { season: 2, episode: 8, title: "The Lexington Letter", airDate: "2027-01-23", overview: "Hidden messages in Lumon documentation reveal the company's ultimate goal." },
      { season: 2, episode: 9, title: "The Grand Hall", airDate: "2027-01-30", overview: "Mark risks everything to access the sub-basement levels." },
      { season: 2, episode: 10, title: "The Great Egress", airDate: "2027-02-06", overview: "Season 2 finale: The explosive showdown across Lumon Industries." }
    ]
  },
  "the last of us": {
    title: "The Last of Us",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "Season 3 Premiere", airDate: "2027-04-18", overview: "Joel and Ellie face new challenges across the fractured frontier." }
    ]
  },
  "the bear": {
    title: "The Bear",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 4, episode: 1, title: "Season 4 Premiere", airDate: "2027-06-18", overview: "Carmy, Sydney, and Richie push for new culinary heights amidst industry turbulence." }
    ]
  },
  "house of the dragon": {
    title: "House of the Dragon",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 4, episode: 1, title: "The Hour of the Wolf", airDate: "2027-05-10", overview: "The Targaryen civil war reaches its climactic final chapter." }
    ]
  },
  "daredevil: born again": {
    title: "Daredevil: Born Again",
    streamingService: "Disney+",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Born Again Series Premiere", airDate: "2026-09-18", overview: "Matt Murdock and Wilson Fisk cross paths once again in Hell's Kitchen." }
    ]
  },
  "yellowstone": {
    title: "Yellowstone",
    streamingService: "Peacock",
    concluded: false,
    totalSeasons: 5,
    episodes: [
      { season: 5, episode: 15, title: "Season 5 Part 2 Finale", airDate: "2026-11-15", overview: "The Dutton family makes their final stand to protect the ranch." }
    ]
  },
  "the pitt": {
    title: "The Pitt",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "7:00 AM", airDate: "2026-09-03", overview: "Dr. Michael Harris begins a relentless 15-hour shift at a front-line Pittsburgh emergency department." },
      { season: 1, episode: 2, title: "8:00 AM", airDate: "2026-09-10", overview: "A mass-casualty industrial accident pushes the emergency staff to their limits." },
      { season: 1, episode: 3, title: "9:00 AM", airDate: "2026-09-17", overview: "Tensions flare among the senior attending physicians over hospital resource allocation." },
      { season: 1, episode: 4, title: "10:00 AM", airDate: "2026-09-24", overview: "Dr. Harris mentors a struggling resident through a high-stakes trauma procedure." }
    ]
  },
  "only murders in the building": {
    title: "Only Murders in the Building",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 5,
    episodes: [
      { season: 5, episode: 1, title: "The Farewell Tour", airDate: "2026-08-26", overview: "Charles, Oliver, and Mabel investigate a shocking new crime that rocks the Arconia community." },
      { season: 5, episode: 2, title: "Murder on the Set", airDate: "2026-09-02", overview: "The trio follows a trail of clues leading behind the scenes of an eccentric Broadway production." },
      { season: 5, episode: 3, title: "Double Feature", airDate: "2026-09-09", overview: "Mabel discovers an encrypted voicemail connecting the victim to an old Arconia resident." },
      { season: 5, episode: 4, title: "The Arconia Files", airDate: "2026-09-16", overview: "Oliver hosts a chaotic party to corner their prime suspect." }
    ]
  },
  "the white lotus": {
    title: "The White Lotus",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "Sawatdee", airDate: "2026-09-27", overview: "A new cohort of wealthy guests arrives at the lavish White Lotus luxury resort in Thailand." },
      { season: 3, episode: 2, title: "The Lotus Blooms", airDate: "2026-10-04", overview: "Spiritual wellness excursions lead to unexpected interpersonal friction and dark rivalries." },
      { season: 3, episode: 3, title: "Sanctuary", airDate: "2026-10-11", overview: "A secluded meditation retreat uncovers explosive family secrets." }
    ]
  },
  "industry": {
    title: "Industry",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 4, episode: 1, title: "Market Open", airDate: "2026-09-06", overview: "Harper and Yasmin navigate aggressive market volatility and high-stakes venture capital plays." },
      { season: 4, episode: 2, title: "Leveraged Buyout", airDate: "2026-09-13", overview: "Pierpoint executives clash over a clandestine international acquisition." }
    ]
  },
  "the summer i turned pretty": {
    title: "The Summer I Turned Pretty",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "Last Summer", airDate: "2026-08-28", overview: "Belly returns to Cousins Beach for a pivotal summer that will redefine her future." },
      { season: 3, episode: 2, title: "Cousins Beach Forever", airDate: "2026-09-04", overview: "Conrad and Jeremiah confront their feelings as old memories resurface." }
    ]
  },
  "american dad!": {
    title: "American Dad!",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 21,
    episodes: [
      { season: 21, episode: 1, title: "Stan's New Angle", airDate: "2026-09-14", overview: "Stan adopts an extreme new CIA surveillance protocol that backfires inside the Smith household." },
      { season: 21, episode: 2, title: "Francine Gets Crafty", airDate: "2026-09-21", overview: "Francine starts an artisanal crafting enterprise with Roger as her volatile business manager." }
    ]
  },
  "american dad": {
    title: "American Dad",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 21,
    episodes: [
      { season: 21, episode: 1, title: "Stan's New Angle", airDate: "2026-09-14", overview: "Stan adopts an extreme new CIA surveillance protocol that backfires inside the Smith household." },
      { season: 21, episode: 2, title: "Francine Gets Crafty", airDate: "2026-09-21", overview: "Francine starts an artisanal crafting enterprise with Roger as her volatile business manager." }
    ]
  },
  "family guy": {
    title: "Family Guy",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 24,
    episodes: [
      { season: 24, episode: 1, title: "Peter's Perfect Day", airDate: "2026-09-27", overview: "Peter tries to recreate the ultimate 1980s weekend with the guys at the Drunken Clam." },
      { season: 24, episode: 2, title: "Stewie Goes to College", airDate: "2026-10-04", overview: "Stewie creates an undercover college identity to prove his intellectual superiority." }
    ]
  },
  "the simpsons": {
    title: "The Simpsons",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 37,
    episodes: [
      { season: 37, episode: 1, title: "Springfield Future", airDate: "2026-09-27", overview: "Homer discovers a vintage arcade cabinet that miraculously predicts Springfield's local events." },
      { season: 37, episode: 2, title: "Bart's New Gig", airDate: "2026-10-04", overview: "Bart inadvertently becomes an influencer for a quirky underground skate brand." }
    ]
  },
  "pluribus": {
    title: "Pluribus",
    streamingService: "Apple TV",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "We Is Us", airDate: "2026-08-14", overview: "An unconventional legal strategist in Albuquerque uncovers a vast corporate conspiracy." },
      { season: 1, episode: 2, title: "The Signal", airDate: "2026-08-21", overview: "Carol follows an anonymous encrypted tip into the high desert." },
      { season: 1, episode: 3, title: "Consensus", airDate: "2026-08-28", overview: "Tensions boil over as federal investigators close in on the firm." },
      { season: 1, episode: 4, title: "Overload", airDate: "2026-09-04", overview: "An unexpected breakthrough changes the calculus for all parties involved." }
    ]
  },
  "mayfair witches": {
    title: "Mayfair Witches",
    streamingService: "AMC+",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "The Lasher Legacy", airDate: "2026-09-06", overview: "Rowan struggles to harness her ancestral powers as a sinister presence awakens in New Orleans." },
      { season: 2, episode: 2, title: "Blood Ties", airDate: "2026-09-13", overview: "The Mayfair family gathers for a solemn ritual to protect their ancestral sanctuary." }
    ]
  },
  "calabasas confidential": {
    title: "Calabasas Confidential",
    streamingService: "Netflix",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Calabasas Coded", airDate: "2026-08-10", overview: "A mysterious newcomer arrives in Calabasas and disrupts the secluded community." },
      { season: 1, episode: 2, title: "Gated Secrets", airDate: "2026-08-17", overview: "Security camera footage reveals unauthorized nocturnal visitors." },
      { season: 1, episode: 3, title: "The Hidden Hills", airDate: "2026-08-24", overview: "A lavish charity gala becomes the stage for a dramatic public confrontation." },
      { season: 1, episode: 4, title: "VIP Access", airDate: "2026-08-31", overview: "Financial audits uncover decades of undisclosed offshore accounts." }
    ]
  },
  "temptation island": {
    title: "Temptation Island",
    streamingService: "Other",
    concluded: false,
    totalSeasons: 6,
    episodes: [
      { season: 6, episode: 1, title: "Temptation Begins", airDate: "2026-08-12", overview: "Four couples arrive in paradise to put their relationships to the ultimate test." },
      { season: 6, episode: 2, title: "First Bonfire", airDate: "2026-08-19", overview: "Emotional bonfire videos send shockwaves through both villas." },
      { season: 6, episode: 3, title: "The Truth Comes Out", airDate: "2026-08-26", overview: "Singles and couples navigate intense emotional connections during island dates." }
    ]
  },
  "dr. pimple popper": {
    title: "Dr. Pimple Popper",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 11,
    episodes: [
      { season: 11, episode: 1, title: "The Lipoma Whisperer", airDate: "2026-08-13", overview: "Dr. Sandra Lee tackles rare dermatological cases with care and precision." },
      { season: 11, episode: 2, title: "Under the Skin", airDate: "2026-08-20", overview: "A patient with a debilitating cyst seeks life-changing surgical relief." },
      { season: 11, episode: 3, title: "Crystal Clear", airDate: "2026-08-27", overview: "Dr. Lee performs delicate extractions to restore her patients' confidence." }
    ]
  },
  "the real housewives of beverly hills": {
    title: "The Real Housewives of Beverly Hills",
    streamingService: "Peacock",
    concluded: false,
    totalSeasons: 14,
    episodes: [
      { season: 14, episode: 1, title: "Life, Liberty and the Pursuit of Wealthiness", airDate: "2026-08-13", overview: "The ladies reunite in Beverly Hills for a glamorous season kickoff dinner." },
      { season: 14, episode: 2, title: "Diamonds and Drama", airDate: "2026-08-20", overview: "Rumors swirl after a tense charity luncheon on Rodeo Drive." },
      { season: 14, episode: 3, title: "Rodeo Drive Showdown", airDate: "2026-08-27", overview: "Alliances shift dramatically during an extravagant weekend getaway in Aspen." }
    ]
  },
  "fear factor": {
    title: "Fear Factor",
    streamingService: "Peacock",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "Ice Is Thicker Than Water", airDate: "2026-08-15", overview: "Competitors face freezing underwater obstacles and high-altitude stunts." },
      { season: 2, episode: 2, title: "High Wire Terror", airDate: "2026-08-22", overview: "Teams must balance across a swaying cable between two soaring skyscrapers." }
    ]
  },
  "vanderpump rules": {
    title: "Vanderpump Rules",
    streamingService: "Other",
    concluded: false,
    totalSeasons: 12,
    episodes: [
      { season: 12, episode: 1, title: "Welcome to SUR", airDate: "2026-08-18", overview: "The staff at SUR kicks off another whirlwind summer in West Hollywood." },
      { season: 12, episode: 2, title: "Cocktails & Chaos", airDate: "2026-08-25", overview: "A restaurant tasting event leads to heated arguments among former friends." }
    ]
  },
  "love island usa": {
    title: "Love Island USA",
    streamingService: "Paramount+",
    concluded: false,
    totalSeasons: 8,
    episodes: [
      { season: 8, episode: 35, title: "Episode 35 - Final Dates", airDate: "2026-08-24", overview: "The final couples embark on romantic dream dates before the finale." },
      { season: 8, episode: 36, title: "Episode 36 - Reunion", airDate: "2026-08-31", overview: "The islanders reunite to crown the winning couple of Season 8." }
    ]
  },
  "the ghost in the shell": {
    title: "THE GHOST IN THE SHELL",
    streamingService: "Other",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 6, title: "Dumb Barter", airDate: "2026-08-11", overview: "Section 9 investigates cybernetic espionage in a high-security automated metropolis." },
      { season: 1, episode: 7, title: "Idolator", airDate: "2026-08-25", overview: "Major Kusanagi tracks a rogue cyberbrain hacker into the digital underground." }
    ]
  },
  "ghost in the shell": {
    title: "Ghost in the Shell",
    streamingService: "Other",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 6, title: "Dumb Barter", airDate: "2026-08-11", overview: "Section 9 investigates cybernetic espionage in a high-security automated metropolis." },
      { season: 1, episode: 7, title: "Idolator", airDate: "2026-08-25", overview: "Major Kusanagi tracks a rogue cyberbrain hacker into the digital underground." }
    ]
  },
  "my adventures with superman": {
    title: "My Adventures with Superman",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "Metropolis Reborn", airDate: "2026-09-05", overview: "Clark, Lois, and Jimmy investigate advanced alien technology surfacing across Metropolis." },
      { season: 3, episode: 2, title: "Brainiac's Return", airDate: "2026-09-12", overview: "Superman must defend the Daily Planet from a cybernetic assault." }
    ]
  },
  "one piece": {
    title: "One Piece",
    streamingService: "Other",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "Loguetown & The Grand Line", airDate: "2026-09-19", overview: "Luffy and the Straw Hat Pirates prepare to enter the perilous waters of the Grand Line." },
      { season: 2, episode: 2, title: "Whiskey Peak", airDate: "2026-09-26", overview: "The crew arrives at a seemingly welcoming town that hides dangerous bounty hunters." },
      { season: 2, episode: 3, title: "Little Garden", airDate: "2026-10-03", overview: "Giants and prehistoric beasts test the Straw Hats on an ancient island." },
      { season: 2, episode: 4, title: "Drum Island", airDate: "2026-10-10", overview: "In search of a doctor for Nami, the crew climbs the frozen peaks of Drum Island." }
    ]
  },
  "jujutsu kaisen": {
    title: "Jujutsu Kaisen",
    streamingService: "Netflix",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "The Culling Game Begins", airDate: "2026-10-08", overview: "Yuji Itadori and Megumi Fushiguro enter the high-stakes Culling Game battlegrounds." },
      { season: 3, episode: 2, title: "Tokyo Colony No. 1", airDate: "2026-10-15", overview: "Fierce sorcerer battles erupt across the enclosed barriers of Tokyo." }
    ]
  },
  "blue eye samurai": {
    title: "Blue Eye Samurai",
    streamingService: "Netflix",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "London Bound", airDate: "2026-10-16", overview: "Mizu journeys across the ocean to 17th-century London to hunt the remaining conspirators." },
      { season: 2, episode: 2, title: "The Thames Fog", airDate: "2026-10-23", overview: "Mizu navigates the treacherous underworld of London in pursuit of answers." }
    ]
  },
  "your friendly neighborhood spider-man": {
    title: "Your Friendly Neighborhood Spider-Man",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Great Power", airDate: "2026-09-10", overview: "Peter Parker discovers his superhuman abilities while navigating his freshman year at Midtown High." },
      { season: 1, episode: 2, title: "School Days", airDate: "2026-09-17", overview: "Peter balances academic pressures with stopping a high-tech robbery in Queens." },
      { season: 1, episode: 3, title: "Osborn's Prodigy", airDate: "2026-09-24", overview: "Norman Osborn takes a keen interest in Peter's scientific aptitude." }
    ]
  },
  "dutton ranch": {
    title: "Dutton Ranch",
    streamingService: "Paramount+",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "New Blood", airDate: "2026-09-20", overview: "A new generation of ranchers fights to preserve the legendary Montana territory." },
      { season: 1, episode: 2, title: "The Big Sky", airDate: "2026-09-27", overview: "Boundary disputes with neighboring developers ignite escalating tensions." }
    ]
  },
  "the madison": {
    title: "The Madison",
    streamingService: "Paramount+",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "River's Edge", airDate: "2026-09-13", overview: "A New York matriarch moves her grieving family to the remote Madison River valley of Montana." },
      { season: 1, episode: 2, title: "Under the Pines", airDate: "2026-09-20", overview: "The family struggles to adapt to rural life while confronting unresolved grief." }
    ]
  },
  "the lord of the rings: the rings of power": {
    title: "The Lord of the Rings: The Rings of Power",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "The Shadows of Mordor", airDate: "2026-10-01", overview: "Sauron tightens his dominion as the Free Peoples of Middle-earth rally their forces." },
      { season: 3, episode: 2, title: "The Siege", airDate: "2026-10-08", overview: "Elven strongholds prepare for a monumental siege against darkness." }
    ]
  },
  "the walking dead: daryl dixon": {
    title: "The Walking Dead: Daryl Dixon",
    streamingService: "AMC+",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "Spain Bound", airDate: "2026-09-27", overview: "Daryl and Carol journey across the Iberian Peninsula encountering new communities and threats." },
      { season: 3, episode: 2, title: "The Camino Walkers", airDate: "2026-10-04", overview: "A convoy of survivors faces an unprecedented variant horde along the Spanish coast." }
    ]
  },
  "3 body problem": {
    title: "3 Body Problem",
    streamingService: "Netflix",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "The Wallfacer", airDate: "2026-11-06", overview: "Humanity appoints Wallfacers to devise secret planetary defenses against the approaching San-Ti fleet." },
      { season: 2, episode: 2, title: "Dark Forest", airDate: "2026-11-13", overview: "Luo Ji begins deciphering the deeper cosmic reality underlying the universe." }
    ]
  },
  "avatar: the last airbender": {
    title: "Avatar: The Last Airbender",
    streamingService: "Netflix",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "City of Walls and Secrets", airDate: "2026-11-13", overview: "Aang, Katara, and Sokka travel to Ba Sing Se to find an Earthbending master." },
      { season: 2, episode: 2, title: "The Earth Kingdom", airDate: "2026-11-20", overview: "Toph Beifong demonstrates her unmatched earthbending prowess." }
    ]
  },
  "shōgun": {
    title: "Shōgun",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "Toranaga's Realm", airDate: "2027-02-12", overview: "Lord Toranaga consolidates his Shogunate amid new political intrigues and western embassies." },
      { season: 2, episode: 2, title: "The Rising Sun", airDate: "2027-02-19", overview: "Blackthorne assists in modernizing naval defenses against rival regents." }
    ]
  },
  "shogun": {
    title: "Shogun",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "Toranaga's Realm", airDate: "2027-02-12", overview: "Lord Toranaga consolidates his Shogunate amid new political intrigues and western embassies." },
      { season: 2, episode: 2, title: "The Rising Sun", airDate: "2027-02-19", overview: "Blackthorne assists in modernizing naval defenses against rival regents." }
    ]
  },
  "peaky blinders": {
    title: "Peaky Blinders",
    streamingService: "Netflix",
    concluded: false,
    totalSeasons: 6,
    episodes: [
      { season: 6, episode: 6, title: "Lock and Key", airDate: "2026-08-25", overview: "Tommy Shelby resolves family loyalties and prepares his legacy as the saga reaches its boiling point." }
    ]
  },
  "foundation": {
    title: "Foundation",
    streamingService: "Apple TV",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "The Mule Strikes", airDate: "2026-10-23", overview: "The warlord known as the Mule unleashes devastating mental powers across the galaxy." },
      { season: 3, episode: 2, title: "Second Foundation", airDate: "2026-10-30", overview: "Gaal and Hari Seldon race to awaken the Second Foundation before the psychohistory timeline collapses." }
    ]
  },
  "survivor": {
    title: "Survivor",
    streamingService: "Paramount+",
    concluded: false,
    totalSeasons: 49,
    episodes: [
      { season: 49, episode: 1, title: "Marooned in Fiji", airDate: "2026-09-23", overview: "Eighteen new castaways are abandoned on the rugged islands of Fiji to outwit, outplay, and outlast." },
      { season: 49, episode: 2, title: "Trust or Bust", airDate: "2026-09-30", overview: "An early idol hunt causes intense paranoia across the tribes." }
    ]
  },
  "love, death & robots": {
    title: "Love, Death & Robots",
    streamingService: "Netflix",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 4, episode: 1, title: "Neon Dreams", airDate: "2026-10-02", overview: "A thrilling anthology of mind-bending animated sci-fi, fantasy, and speculative stories." }
    ]
  },
  "wonder man": {
    title: "Wonder Man",
    streamingService: "Disney+",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Hollywood Hero", airDate: "2026-12-18", overview: "Simon Williams navigates Hollywood auditions while discovering his superhuman ionic abilities." }
    ]
  },
  "spider-noir": {
    title: "Spider-Noir",
    streamingService: "Other",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "1930s Web", airDate: "2026-11-27", overview: "In 1930s New York, an aging, down-on-his-luck private investigator is forced to grapple with his past life as the city's only superhero." }
    ]
  },
  "alien: earth": {
    title: "Alien: Earth",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "First Contact", airDate: "2026-09-18", overview: "A mysterious deep-space vessel crash-lands on Earth, forcing a tactical recovery squad into a horrific survival struggle." }
    ]
  },
  "paradise": {
    title: "Paradise",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "The Community", airDate: "2026-09-25", overview: "A high-profile Secret Service bodyguard finds himself at the center of a presidential mystery inside a tranquil community." }
    ]
  },
  "the testaments": {
    title: "The Testaments",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Ardua Hall", airDate: "2026-10-15", overview: "Years after Offred's resistance, three women discover their intertwined destinies within Gilead." }
    ]
  },
  "the beauty": {
    title: "The Beauty",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Perfection", airDate: "2026-10-29", overview: "A sexually transmitted infection that makes people physically gorgeous spreads rapidly with deadly consequences." }
    ]
  },
  "knight of the seven kingdoms": {
    title: "Knight of the Seven Kingdoms",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "The Hedge Knight", airDate: "2026-09-20", overview: "Ser Duncan the Tall and his diminutive squire Egg travel Westeros a century before Game of Thrones." },
      { season: 1, episode: 2, title: "Ashford Meadow", airDate: "2026-09-27", overview: "A prestigious tourney at Ashford turns treacherous when royal temperaments clash." }
    ]
  },
  "a knight of the seven kingdoms": {
    title: "A Knight of the Seven Kingdoms",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "The Hedge Knight", airDate: "2026-09-20", overview: "Ser Duncan the Tall and his diminutive squire Egg travel Westeros a century before Game of Thrones." },
      { season: 1, episode: 2, title: "Ashford Meadow", airDate: "2026-09-27", overview: "A prestigious tourney at Ashford turns treacherous when royal temperaments clash." }
    ]
  },
  "batman: caped crusader": {
    title: "Batman: Caped Crusader",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 2, episode: 1, title: "The Shadow Over Gotham", airDate: "2026-10-09", overview: "Batman investigates the rise of a new theatrical criminal syndicate in 1940s Gotham City." }
    ]
  },
  "it: welcome to derry": {
    title: "It: Welcome to Derry",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "The Black Spot", airDate: "2026-10-11", overview: "In 1962 Derry, Maine, four kids uncover the terrifying history beneath their small town." },
      { season: 1, episode: 2, title: "Under the Streets", airDate: "2026-10-18", overview: "Strange sightings around the old ironworks terrify the townsfolk." }
    ]
  },
  "blade runner 2099": {
    title: "Blade Runner 2099",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "More Human Than Human", airDate: "2026-11-20", overview: "Fifty years after 2049, a renegade Blade Runner and a hunted replicant navigate the glowing sprawl of future Los Angeles." }
    ]
  },
  "task": {
    title: "Task",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "The Task Force", airDate: "2026-10-18", overview: "An FBI agent heads a task force in the working-class suburbs of Philadelphia to end a string of drug-house robberies." }
    ]
  },
  "the lowdown": {
    title: "The Lowdown",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Deep Background", airDate: "2026-09-15", overview: "Investigative reporters uncover a shocking government coverup." }
    ]
  },
  "saturday night live": {
    title: "Saturday Night Live",
    streamingService: "Peacock",
    concluded: false,
    totalSeasons: 52,
    episodes: [
      { season: 52, episode: 1, title: "Season 52 Premiere", airDate: "2026-10-03", overview: "Live from New York, SNL kicks off its historic 52nd season with music, sketches, and Weekend Update." }
    ]
  },
  "american horror story": {
    title: "American Horror Story",
    streamingService: "Paramount+",
    concluded: false,
    totalSeasons: 13,
    episodes: [
      { season: 13, episode: 1, title: "The Awakening", airDate: "2026-09-24", overview: "A chilling new chapter in the horror anthology series unfolds." },
      { season: 13, episode: 2, title: "Dark Passage", airDate: "2026-10-01", overview: "Unspeakable horrors plague a remote community." }
    ]
  },
  "american horor story": {
    title: "American Horor Story",
    streamingService: "Paramount+",
    concluded: false,
    totalSeasons: 13,
    episodes: [
      { season: 13, episode: 1, title: "The Awakening", airDate: "2026-09-24", overview: "A chilling new chapter in the horror anthology series unfolds." },
      { season: 13, episode: 2, title: "Dark Passage", airDate: "2026-10-01", overview: "Unspeakable horrors plague a remote community." }
    ]
  },
  "star wars: maul - shadow lord": {
    title: "Star Wars: Maul - Shadow Lord",
    streamingService: "Disney+",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Crimson Dawn", airDate: "2026-10-30", overview: "Darth Maul consolidates his syndicate empire in the shadows of the galactic underworld." }
    ]
  },
  "bob's burgers": {
    title: "Bob's Burgers",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 16,
    episodes: [
      { season: 16, episode: 1, title: "Burger of the Day", airDate: "2026-09-27", overview: "Bob invents an avant-garde gourmet burger while Tina leads a school campaign." }
    ]
  },
  "grey's anatomy": {
    title: "Grey's Anatomy",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 22,
    episodes: [
      { season: 22, episode: 1, title: "Grey Sloan Strong", airDate: "2026-09-24", overview: "The surgeons at Grey Sloan Memorial take on a challenging emergency." }
    ]
  },
  "the five star weekend": {
    title: "The Five Star Weekend",
    streamingService: "Peacock",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "Nantucket Gathering", airDate: "2026-09-18", overview: "A food blogger organizes a weekend bringing together friends from every stage of her life." }
    ]
  },
  "ted lasso": {
    title: "Ted Lasso",
    streamingService: "Apple TV",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 4, episode: 1, title: "Believe Again", airDate: "2026-11-25", overview: "Ted returns to Richmond as the club embarks on a brand new European championship campaign." }
    ]
  }
};

/**
 * Normalizes title for schedule matching
 */
export function normalizeTitle(title: string = ''): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"’]/g, '')
    .replace(/\b(the|a|an)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Resolves the next upcoming/active episode for a show based on user watched progress
 * and current air dates.
 */
export function resolveNextUpcomingEpisode(
  show: {
    title: string;
    latestWatched?: WatchedEpisode;
    concluded?: boolean;
    nextEpisode?: NextEpisode | null;
    totalSeasons?: number;
  },
  referenceDateStr: string = '2026-08-20'
): NextEpisode | null {
  if (show.concluded) return null;

  const rawTitle = (show.title || '').toLowerCase().trim();
  const norm = normalizeTitle(show.title);

  // Find matching schedule
  let schedule: ShowScheduleData | undefined = SHOW_SCHEDULES[rawTitle];
  if (!schedule) {
    schedule = Object.entries(SHOW_SCHEDULES).find(([k]) => {
      const scheduleNorm = normalizeTitle(k);
      return scheduleNorm === norm || norm.includes(scheduleNorm) || scheduleNorm.includes(norm);
    })?.[1];
  }

  const watched = show.latestWatched || { season: 1, episode: 0, title: 'Not Started' };

  if (schedule && schedule.episodes && schedule.episodes.length > 0) {
    // Sort episodes chronologically
    const sorted = [...schedule.episodes].sort((a, b) => {
      if (a.season !== b.season) return a.season - b.season;
      return a.episode - b.episode;
    });

    // 1. First preference: First episode that user HAS NOT WATCHED yet
    const unwatched = sorted.filter(ep => {
      if (ep.season > watched.season) return true;
      if (ep.season === watched.season && ep.episode > watched.episode) return true;
      return false;
    });

    if (unwatched.length > 0) {
      // Find the first unwatched episode that is upcoming or most recently aired
      const candidate = unwatched[0];
      return {
        season: candidate.season,
        episode: candidate.episode,
        title: candidate.title,
        airDate: candidate.airDate,
        overview: candidate.overview
      };
    }

    // If user has watched all scheduled episodes, but show is ongoing, check future season premiere
    const lastEp = sorted[sorted.length - 1];
    if (show.totalSeasons && show.totalSeasons > lastEp.season) {
      return {
        season: show.totalSeasons,
        episode: 1,
        title: `Season ${show.totalSeasons} Premiere`,
        airDate: `${new Date(referenceDateStr).getFullYear() + 1}-04-01`,
        overview: `The next exciting season of ${show.title}.`
      };
    }
  }

  // If show already has a valid future nextEpisode, keep it
  if (show.nextEpisode && show.nextEpisode.airDate) {
    const isWatched = (watched.season > show.nextEpisode.season) ||
      (watched.season === show.nextEpisode.season && watched.episode >= show.nextEpisode.episode);
    if (!isWatched) {
      return show.nextEpisode;
    }
  }

  return null;
}
