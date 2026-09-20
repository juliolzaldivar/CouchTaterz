/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
      { season: 1, episode: 1, title: "L Train", airDate: "2026-09-16", overview: "When Neagley's childhood friend, Tommy, dies after walking into an oncoming train, the police are ready to label this as an apparent accident. But after receiving a mysterious message from the deceased, Neagley knows something is amiss." },
      { season: 1, episode: 2, title: "Team Building Exercises", airDate: "2026-09-16", overview: "With Neagley's investigation into the suspicious death of her childhood friend, Tommy Crane, hitting countless roadblocks, a long-buried secret from Neagley's past threatens to upend everything she once knew of her childhood." },
      { season: 1, episode: 3, title: "Hammer Time", airDate: "2026-09-16", overview: "After an ambush turns up her best break in the case thus far, Neagley is blindsided by local law enforcement's attempts to sideline her." },
      { season: 1, episode: 4, title: "Breaking & Entering", airDate: "2026-09-16", overview: "Neagley's investigation into Tommy's death has drawn the focus of powerful enemies - putting herself and her team in danger." },
      { season: 1, episode: 5, title: "Trip", airDate: "2026-09-16", overview: "Hidden truths from Neagley's past come rushing to the forefront, forcing her to rely on her newfound team more than ever." },
      { season: 1, episode: 6, title: "Rocked", airDate: "2026-09-16", overview: "With new evidence coming to light, Neagley realizes she is not only responsible for solving Tommy's murder, but countless others as well." },
      { season: 1, episode: 7, title: "Lebron's No Jordan", airDate: "2026-09-16", overview: "As clues dry up, Hudson is forced to make a devil's bargain to keep the case from going cold." },
      { season: 1, episode: 8, title: "Touched", airDate: "2026-09-16", overview: "With the legacy of her deceased childhood friend on the line, and the lives of her team under threat, Neagley mounts one last stand to bring Tommy's killers to justice." }
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
      { season: 1, episode: 3, title: "OutKast", airDate: "2026-08-30", overview: "Tensions flare between the veteran Lantern and the rookie as new extraterrestrial evidence emerges." },
      { season: 1, episode: 4, title: "The Weenie", airDate: "2026-09-06", overview: "Hal Jordan and John Stewart confront their biggest revelations yet as the terrestrial conspiracy deepens." },
      { season: 1, episode: 5, title: "TBA", airDate: "2026-09-13", overview: "Hal and John face escalating cosmic threats." },
      { season: 1, episode: 6, title: "TBA", airDate: "2026-09-20", overview: "The mystery behind the murder reaches a boiling point." },
      { season: 1, episode: 7, title: "TBA", airDate: "2026-09-27", overview: "Uncovering the mastermind behind the extraterrestrial threat." },
      { season: 1, episode: 8, title: "Season Finale", airDate: "2026-10-04", overview: "Season 1 finale: Hal and John battle to protect Earth and the Green Lantern Corps." }
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
      { season: 14, episode: 7, title: "Bender's Game 2.0", airDate: "2026-09-07", overview: "The crew gets trapped inside an ancient holographic fantasy role-playing simulator." },
      { season: 14, episode: 8, title: "Quantum Leap Year", airDate: "2026-09-21", overview: "Professor Farnsworth accidentally causes temporal turbulence when testing an overclocked dark-matter engine." },
      { season: 14, episode: 9, title: "Calculon's Curse", airDate: "2026-09-28", overview: "Calculon returns to All My Circuits with an unpredictable new AI co-star." },
      { season: 14, episode: 10, title: "The End of Time Again", airDate: "2026-10-05", overview: "Season 14 finale: The Planet Express crew embarks on a mind-bending voyage to the edges of reality." }
    ]
  },
  "it's always sunny in philadelphia": {
    title: "It's Always Sunny in Philadelphia",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 18,
    episodes: [
      { season: 18, episode: 1, title: "Frank Marries a Corpse", airDate: "2026-08-17", overview: "The gang helps Frank with pre-wedding jitters, while Dee attempts to dissuade Sam from the nuptials." },
      { season: 18, episode: 2, title: "Dennis and Dee Don't Get Rich", airDate: "2026-08-17", overview: "The Reynolds twins strive to secure Sam's inheritance, while Charlie and Frank arrange a memorial for Bonnie." },
      { season: 18, episode: 3, title: "The Gang Gets Tested", airDate: "2026-08-24", overview: "Dennis and Dee are diagnosed with ADHD, an official diagnosis that Mac desperately tries to obtain." },
      { season: 18, episode: 4, title: "2026: A Virtual Insanity", airDate: "2026-08-31", overview: "The gang dives into virtual reality and modern tech trends with chaotic consequences." },
      { season: 18, episode: 5, title: "The Gang Goes to the Ren Faire", airDate: "2026-09-07", overview: "Mac, Dennis, and Dee aim for the Quilt of Legends at the Renaissance Faire, Charlie discovers luting, and Frank tries to buy the faire." },
      { season: 18, episode: 6, title: "The War on Alcohol", airDate: "2026-09-14", overview: "The gang battles anti-drinking trends by recruiting white-collar and blue-collar groups for happy hour." },
      { season: 18, episode: 7, title: "Gilligan's Island: A Conspiracy Theorist's Paradise", airDate: "2026-09-21", overview: "The Gang unravels wild television conspiracy theories about Gilligan's Island." },
      { season: 18, episode: 8, title: "TBA", airDate: "2026-09-28", overview: "New weekly episode of Season 18." },
      { season: 18, episode: 9, title: "TBA", airDate: "2026-10-05", overview: "New weekly episode of Season 18." },
      { season: 18, episode: 10, title: "Season Finale", airDate: "2026-10-12", overview: "Season 18 finale of It's Always Sunny in Philadelphia." }
    ]
  },
  "always sunny in philadelphia": {
    title: "It's Always Sunny in Philadelphia",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 18,
    episodes: [
      { season: 18, episode: 1, title: "Frank Marries a Corpse", airDate: "2026-08-17", overview: "The gang helps Frank with pre-wedding jitters, while Dee attempts to dissuade Sam from the nuptials." },
      { season: 18, episode: 2, title: "Dennis and Dee Don't Get Rich", airDate: "2026-08-17", overview: "The Reynolds twins strive to secure Sam's inheritance, while Charlie and Frank arrange a memorial for Bonnie." },
      { season: 18, episode: 3, title: "The Gang Gets Tested", airDate: "2026-08-24", overview: "Dennis and Dee are diagnosed with ADHD, an official diagnosis that Mac desperately tries to obtain." },
      { season: 18, episode: 4, title: "2026: A Virtual Insanity", airDate: "2026-08-31", overview: "The gang dives into virtual reality and modern tech trends with chaotic consequences." },
      { season: 18, episode: 5, title: "The Gang Goes to the Ren Faire", airDate: "2026-09-07", overview: "Mac, Dennis, and Dee aim for the Quilt of Legends at the Renaissance Faire, Charlie discovers luting, and Frank tries to buy the faire." },
      { season: 18, episode: 6, title: "The War on Alcohol", airDate: "2026-09-14", overview: "The gang battles anti-drinking trends by recruiting white-collar and blue-collar groups for happy hour." },
      { season: 18, episode: 7, title: "Gilligan's Island: A Conspiracy Theorist's Paradise", airDate: "2026-09-21", overview: "The Gang unravels wild television conspiracy theories about Gilligan's Island." },
      { season: 18, episode: 8, title: "TBA", airDate: "2026-09-28", overview: "New weekly episode of Season 18." },
      { season: 18, episode: 9, title: "TBA", airDate: "2026-10-05", overview: "New weekly episode of Season 18." },
      { season: 18, episode: 10, title: "Season Finale", airDate: "2026-10-12", overview: "Season 18 finale of It's Always Sunny in Philadelphia." }
    ]
  },
  "always sunny": {
    title: "It's Always Sunny in Philadelphia",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 18,
    episodes: [
      { season: 18, episode: 1, title: "Frank Marries a Corpse", airDate: "2026-08-17", overview: "The gang helps Frank with pre-wedding jitters, while Dee attempts to dissuade Sam from the nuptials." },
      { season: 18, episode: 2, title: "Dennis and Dee Don't Get Rich", airDate: "2026-08-17", overview: "The Reynolds twins strive to secure Sam's inheritance, while Charlie and Frank arrange a memorial for Bonnie." },
      { season: 18, episode: 3, title: "The Gang Gets Tested", airDate: "2026-08-24", overview: "Dennis and Dee are diagnosed with ADHD, an official diagnosis that Mac desperately tries to obtain." },
      { season: 18, episode: 4, title: "2026: A Virtual Insanity", airDate: "2026-08-31", overview: "The gang dives into virtual reality and modern tech trends with chaotic consequences." },
      { season: 18, episode: 5, title: "The Gang Goes to the Ren Faire", airDate: "2026-09-07", overview: "Mac, Dennis, and Dee aim for the Quilt of Legends at the Renaissance Faire, Charlie discovers luting, and Frank tries to buy the faire." },
      { season: 18, episode: 6, title: "The War on Alcohol", airDate: "2026-09-14", overview: "The gang battles anti-drinking trends by recruiting white-collar and blue-collar groups for happy hour." },
      { season: 18, episode: 7, title: "Gilligan's Island: A Conspiracy Theorist's Paradise", airDate: "2026-09-21", overview: "The Gang unravels wild television conspiracy theories about Gilligan's Island." },
      { season: 18, episode: 8, title: "TBA", airDate: "2026-09-28", overview: "New weekly episode of Season 18." },
      { season: 18, episode: 9, title: "TBA", airDate: "2026-10-05", overview: "New weekly episode of Season 18." },
      { season: 18, episode: 10, title: "Season Finale", airDate: "2026-10-12", overview: "Season 18 finale of It's Always Sunny in Philadelphia." }
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
  "harley quinn": {
    title: "Harley Quinn",
    streamingService: "Max",
    concluded: false,
    totalSeasons: 5,
    episodes: [
      { season: 5, episode: 1, title: "Gotham City Sirens", airDate: "2026-09-04", overview: "Harley, Ivy, and Catwoman team up for an audacious heist across Gotham's most exclusive districts." },
      { season: 5, episode: 2, title: "Poison Ivy League", airDate: "2026-09-11", overview: "Ivy attends a prestigious botanical summit that turns into a supervillain battle royale." },
      { season: 5, episode: 3, title: "Legion of Doom Redux", airDate: "2026-09-18", overview: "Harley stages an unauthorized hostile takeover of the newly reformed Legion headquarters." },
      { season: 5, episode: 4, title: "Harlivy Forever", airDate: "2026-09-25", overview: "Ivy and Harley navigate unexpected relationship hurdles while on a frantic road trip." },
      { season: 5, episode: 5, title: "Bachelorette Part Two", airDate: "2026-10-02", overview: "A chaotic weekend getaway on Themyscira goes completely off the rails." },
      { season: 5, episode: 6, title: "Assault on Arkham", airDate: "2026-10-09", overview: "A jailbreak puts all of Gotham on high alert as rogue factions scramble for supremacy." },
      { season: 5, episode: 7, title: "Clown Princess of Crime", airDate: "2026-10-16", overview: "Harley confronts a copycat vigilante threatening to steal her signature aesthetic." },
      { season: 5, episode: 8, title: "The Bat and the Cat", airDate: "2026-10-23", overview: "Unlikely alliances form in the subterranean shadows of Old Gotham." },
      { season: 5, episode: 9, title: "Monsters of the Deep", airDate: "2026-10-30", overview: "King Shark calls in a massive personal favor that tests everyone's sanity." },
      { season: 5, episode: 10, title: "Season Finale", airDate: "2026-11-06", overview: "Season 5 finale: The explosive culmination of Harley and Ivy's wildest caper yet." }
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
      { season: 24, episode: 1, title: "The Pandemic Special", airDate: "2020-09-30", overview: "Randy comes to terms with his role in the COVID-19 outbreak as the kids head back to school." },
      { season: 24, episode: 2, title: "South ParQ Vaccination Special", airDate: "2021-03-10", overview: "The citizens of South Park clamor for the COVID-19 vaccine while a new militant group tries to stop them." },
      { season: 25, episode: 1, title: "Pajama Day", airDate: "2022-02-02", overview: "PC Principal revokes Pajama Day privileges for the fourth grade class." },
      { season: 25, episode: 2, title: "The Big Fix", airDate: "2022-02-09", overview: "Randy invites the Black family to Tegridy Farms for dinner." },
      { season: 25, episode: 3, title: "City People", airDate: "2022-02-16", overview: "Cartman is furious when his mom gets a job as a real estate agent." },
      { season: 25, episode: 4, title: "Back to the Cold War", airDate: "2022-03-02", overview: "Mr. Garrison relives his Cold War trauma through an intense dressage competition." },
      { season: 25, episode: 5, title: "Help, My Teenager Hates Me!", airDate: "2022-03-09", overview: "The boys take up airsofting and are forced to bond with actual teenagers." },
      { season: 25, episode: 6, title: "Credigree Weed St. Patrick's Day Special", airDate: "2022-03-16", overview: "Butters gets arrested for not wearing green on St. Patrick's Day." },
      { season: 26, episode: 1, title: "Cupid Ye", airDate: "2023-02-08", overview: "Cartman is jealous of Stan and Kyle's friendship." },
      { season: 26, episode: 2, title: "The Worldwide Privacy Tour", airDate: "2023-02-15", overview: "The prince of Canada and his wife try to find privacy and seclusion in South Park." },
      { season: 26, episode: 3, title: "Japanese Toilet", airDate: "2023-03-01", overview: "Randy purchases a high-tech Japanese toilet, igniting a town-wide toilet paper conspiracy." },
      { season: 26, episode: 4, title: "Deep Learning", airDate: "2023-03-08", overview: "Stan relies on ChatGPT to write essays and text messages to his girlfriend." },
      { season: 26, episode: 5, title: "DikinBaus Hot Dogs", airDate: "2023-03-22", overview: "Cartman dreams of opening his own hot dog restaurant inside an abandoned landmark." },
      { season: 26, episode: 6, title: "Spring Break", airDate: "2023-03-29", overview: "Garrison goes back to his old ways while vacationing in Myrtle Beach." },
      { season: 27, episode: 1, title: "Sermon on the 'Mount", airDate: "2025-07-23", overview: "The twenty-seventh season premiere of South Park." },
      { season: 27, episode: 2, title: "Got a Nut", airDate: "2025-08-06", overview: "The town reacts to an unprecedented local shortage." },
      { season: 27, episode: 3, title: "Sickofancy", airDate: "2025-08-20", overview: "The boys navigate social hierarchy and sycophantic behavior." },
      { season: 27, episode: 4, title: "Wok is Dead", airDate: "2025-09-03", overview: "Culinary traditions clash with modern town fads." },
      { season: 27, episode: 5, title: "Conflict of Interest", airDate: "2025-09-24", overview: "Town politics reach a boiling point." },
      { season: 28, episode: 1, title: "Twisted Christian", airDate: "2025-10-15", overview: "Season 28 premiere following the continuing town drama." },
      { season: 28, episode: 2, title: "The Woman in the Hat", airDate: "2025-10-29", overview: "A mysterious visitor causes a stir among the fourth graders." },
      { season: 28, episode: 3, title: "Sora Not Sorry", airDate: "2025-11-12", overview: "AI video generation creates utter chaos at South Park Elementary." },
      { season: 28, episode: 4, title: "Turkey Trot", airDate: "2025-11-26", overview: "Thanksgiving holiday brings fierce competition." },
      { season: 28, episode: 5, title: "The Crap Out", airDate: "2025-12-10", overview: "The Season 28 finale." },
      { season: 29, episode: 1, title: "South American Biker Gangs", airDate: "2026-09-16", overview: "The arrival of e-bikes in town ignites a fierce turf war between the boys and adult cyclists." },
      { season: 29, episode: 2, title: "Episode 2", airDate: "2026-09-30", overview: "The twenty-ninth season of South Park continues." },
      { season: 29, episode: 3, title: "Episode 3", airDate: "2026-10-14", overview: "The twenty-ninth season of South Park continues." },
      { season: 29, episode: 4, title: "Episode 4", airDate: "2026-10-28", overview: "The twenty-ninth season of South Park continues." },
      { season: 29, episode: 5, title: "Episode 5", airDate: "2026-11-11", overview: "The twenty-ninth season of South Park continues." },
      { season: 29, episode: 6, title: "Episode 6", airDate: "2026-11-25", overview: "The twenty-ninth season of South Park continues." }
    ]
  },
  "slow horses": {
    title: "Slow Horses",
    streamingService: "Apple TV",
    concluded: false,
    totalSeasons: 6,
    episodes: [
      { season: 6, episode: 1, title: "Circle of Life", airDate: "2026-09-16", overview: "Jackson Lamb and Slough House uncover a rogue MI5 sleeper cell operating on British soil." },
      { season: 6, episode: 2, title: "Daddy Issues", airDate: "2026-09-23", overview: "The team digs deeper into the conspiracy as old family tensions resurface." },
      { season: 6, episode: 3, title: "Resurrection", airDate: "2026-09-30", overview: "An operative thought to be dead returns with explosive secrets." },
      { season: 6, episode: 4, title: "Lost and Found", airDate: "2026-10-07", overview: "Crucial intelligence is recovered from an abandoned listening post." },
      { season: 6, episode: 5, title: "Sayonara", airDate: "2026-10-14", overview: "The penultimate showdown pushes Slough House to the breaking point." },
      { season: 6, episode: 6, title: "Judgment Day", airDate: "2026-10-21", overview: "Season 6 finale: Jackson Lamb executes a masterstroke to save his agents." }
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
      { season: 4, episode: 1, title: "Into the Woods", airDate: "2026-04-19", overview: "Boyd discovers a subterranean doorway beneath the town that changes everything." },
      { season: 4, episode: 10, title: "The Tower Calls", airDate: "2026-06-21", overview: "Season 4 finale: The secrets of the lighthouse and the radio signal collide." }
    ]
  },
  "fallout": {
    title: "Fallout",
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 2, episode: 1, title: "The Strip", airDate: "2025-12-16", overview: "Lucy, the Ghoul, and Maximus arrive at the glowing neon ruins of New Vegas." },
      { season: 2, episode: 8, title: "The House Always Wins", airDate: "2026-02-04", overview: "Season 2 finale: The power struggle for the Mojave Wasteland reaches a boiling point." },
      { season: 3, episode: 1, title: "Season 3 Premiere", airDate: "2027-11-10", overview: "The wasteland journey ventures into uncharted territory." }
    ]
  },
  "stranger things": {
    title: "Stranger Things",
    streamingService: "Netflix",
    concluded: true,
    totalSeasons: 5,
    episodes: [
      { season: 5, episode: 1, title: "Chapter One: The Crawl", airDate: "2025-11-26", overview: "Eleven and the Hawkins gang prepare for the ultimate confrontation against the Upside Down." },
      { season: 5, episode: 8, title: "Chapter Eight: The Rightside Up", airDate: "2025-12-31", overview: "Series finale: The definitive final battle for Hawkins." }
    ]
  },
  "severance": {
    title: "Severance",
    streamingService: "Apple TV",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 2, episode: 1, title: "Hello Ms. Cobel", airDate: "2025-01-17", overview: "Mark and the severed floor face strict security protocols in the aftermath of the overtime leak." },
      { season: 2, episode: 10, title: "Cold Harbor", airDate: "2025-03-21", overview: "Season 2 finale: The explosive showdown across Lumon Industries." },
      { season: 3, episode: 1, title: "Season 3 Premiere", airDate: "2027-01-15", overview: "Mark and the severed department uncover deeper Lumon corporate secrets." }
    ]
  },
  "the last of us": {
    title: "The Last of Us",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 2, episode: 1, title: "Jackson", airDate: "2025-04-13", overview: "Joel and Ellie find tentative peace in Jackson before past actions catch up with them." },
      { season: 2, episode: 7, title: "Seattle Day 3", airDate: "2025-05-25", overview: "Season 2 finale: The emotional clash reaches its tragic turning point." },
      { season: 3, episode: 1, title: "Season 3 Premiere", airDate: "2027-04-18", overview: "The next chapter in Ellie's journey begins across the fractured frontier." }
    ]
  },
  "the bear": {
    title: "The Bear",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 5,
    episodes: [
      { season: 4, episode: 1, title: "Season 4 Premiere", airDate: "2025-06-25", overview: "Carmy, Sydney, and Richie push for new culinary heights amidst industry turbulence." },
      { season: 5, episode: 1, title: "Season 5 Premiere", airDate: "2027-06-24", overview: "The crew navigates the next chapter of culinary ambition in Chicago." }
    ]
  },
  "house of the dragon": {
    title: "House of the Dragon",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 3, episode: 1, title: "The Battle of the Gullet", airDate: "2026-06-21", overview: "The dragons clash in the devastating naval blockade as war consumes the realm." },
      { season: 3, episode: 8, title: "The Fall of King's Landing", airDate: "2026-08-09", overview: "Season 3 finale: The black faction launches their audacious strike." },
      { season: 4, episode: 1, title: "The Hour of the Wolf", airDate: "2028-06-18", overview: "The climactic final season of the Targaryen civil war begins." }
    ]
  },
  "daredevil: born again": {
    title: "Daredevil: Born Again",
    streamingService: "Disney+",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 1, episode: 1, title: "Heaven’s Half Hour", airDate: "2025-03-04", overview: "Matt Murdock and Wilson Fisk cross paths once again in Hell's Kitchen." },
      { season: 1, episode: 2, title: "Optics", airDate: "2025-03-04", overview: "Wilson Fisk consolidates power while Matt assesses the shifting political landscape." },
      { season: 1, episode: 3, title: "The Hollow of His Hand", airDate: "2025-03-11", overview: "Murdock defends a vulnerable client as criminal syndicates clash." },
      { season: 1, episode: 4, title: "Sic Semper Systema", airDate: "2025-03-18", overview: "The justice system is tested as corruption deepens across the city." },
      { season: 1, episode: 5, title: "With Interest", airDate: "2025-03-25", overview: "Old debts come due in Hell's Kitchen." },
      { season: 1, episode: 6, title: "Excessive Force", airDate: "2025-04-01", overview: "Tensions between police and vigilantes boil over." },
      { season: 1, episode: 7, title: "Art for Art’s Sake", airDate: "2025-04-08", overview: "Muse's artistic reign of terror demands Matt Murdock's intervention." },
      { season: 1, episode: 8, title: "Isle of Joy", airDate: "2025-04-15", overview: "The penultimate showdown prepares the city for chaos." },
      { season: 1, episode: 9, title: "Straight to Hell", airDate: "2025-04-22", overview: "Season 1 finale: Wilson Fisk and Daredevil clash in an unforgettable confrontation." },
      { season: 2, episode: 1, title: "The Northern Star", airDate: "2026-03-24", overview: "Mayor Fisk's anti-vigilante crusade reaches a dangerous fever pitch." },
      { season: 2, episode: 2, title: "Shoot the Moon", airDate: "2026-03-31", overview: "Matt operates in the shadows as city enforcement tightens." },
      { season: 2, episode: 3, title: "The Scales & the Sword", airDate: "2026-04-07", overview: "Courtroom battles mirror violent conflicts on the streets." },
      { season: 2, episode: 4, title: "Gloves Off", airDate: "2026-04-14", overview: "Fisk escalates the crackdown to unmask vigilantes." },
      { season: 2, episode: 5, title: "The Grand Design", airDate: "2026-04-21", overview: "The mayor's true agenda for New York is laid bare." },
      { season: 2, episode: 6, title: "Requiem", airDate: "2026-04-28", overview: "Allies suffer heavy losses in the ongoing crusade." },
      { season: 2, episode: 7, title: "The Hateful Darkness", airDate: "2026-05-05", overview: "Desperate alliances form to counter Fisk's grip." },
      { season: 2, episode: 8, title: "The Southern Cross", airDate: "2026-05-12", overview: "Season 2 finale: The explosive culmination of Devil's Reign." }
    ]
  },
  "yellowstone": {
    title: "Yellowstone",
    streamingService: "Peacock",
    concluded: true,
    totalSeasons: 5,
    episodes: [
      { season: 5, episode: 14, title: "Life is a Promise", airDate: "2024-12-15", overview: "Series finale: The Dutton family makes their final stand to protect the ranch." }
    ]
  },
  "the pitt": {
    title: "The Pitt",
    streamingService: "Max",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 1, episode: 1, title: "7:00 A.M.", airDate: "2025-01-09", overview: "Dr. Michael 'Robby' Robinavitch begins a relentless 15-hour shift at a front-line Pittsburgh trauma center." },
      { season: 1, episode: 2, title: "8:00 A.M.", airDate: "2025-01-09", overview: "A mass-casualty industrial accident pushes the emergency staff to their limits." },
      { season: 1, episode: 3, title: "9:00 A.M.", airDate: "2025-01-16", overview: "Tensions flare among the senior attending physicians over hospital resource allocation." },
      { season: 1, episode: 4, title: "10:00 A.M.", airDate: "2025-01-23", overview: "Dr. Robinavitch mentors a struggling resident through a high-stakes trauma procedure." },
      { season: 1, episode: 5, title: "11:00 A.M.", airDate: "2025-01-30", overview: "A sudden influx of critical patients strains the ER supplies and staff." },
      { season: 1, episode: 6, title: "12:00 P.M.", airDate: "2025-02-06", overview: "Midday rush brings complex clinical mysteries and personal drama." },
      { season: 1, episode: 7, title: "1:00 P.M.", airDate: "2025-02-13", overview: "An emotional confrontation between family members tests the care team." },
      { season: 1, episode: 8, title: "2:00 P.M.", airDate: "2025-02-20", overview: "A critical pediatric trauma demands immediate multi-specialty intervention." },
      { season: 1, episode: 9, title: "3:00 P.M.", airDate: "2025-02-27", overview: "Staff fatigue begins setting in as unexpected emergencies mount." },
      { season: 1, episode: 10, title: "4:00 P.M.", airDate: "2025-03-06", overview: "A citywide power outage forces the ER into backup battery protocols." },
      { season: 1, episode: 11, title: "5:00 P.M.", airDate: "2025-03-13", overview: "Shift handover approaches amidst an influx of rush-hour accident victims." },
      { season: 1, episode: 12, title: "6:00 P.M.", airDate: "2025-03-20", overview: "Difficult administrative decisions impact surgical theater priorities." },
      { season: 1, episode: 13, title: "7:00 P.M.", airDate: "2025-03-27", overview: "An undercover detective arrives with a critically injured suspect." },
      { season: 1, episode: 14, title: "8:00 P.M.", airDate: "2025-04-03", overview: "The penultimate hour of the grueling shift brings unprecedented emotional strain." },
      { season: 1, episode: 15, title: "9:00 P.M.", airDate: "2025-04-10", overview: "Season 1 finale: The final hour of the 15-hour shift tests everyone to their absolute limits." },
      { season: 2, episode: 1, title: "7:00 A.M.", airDate: "2026-01-08", overview: "Dr. Robby Robinavitch and the team return for another intense 15-hour shift." },
      { season: 2, episode: 15, title: "9:00 P.M.", airDate: "2026-04-16", overview: "Season 2 finale: The conclusion of the second high-stakes trauma shift." },
      { season: 3, episode: 1, title: "7:00 A.M.", airDate: "2027-01-07", overview: "Season 3 premiere: The third 15-hour emergency trauma shift begins in Pittsburgh." }
    ]
  },
  "only murders in the building": {
    title: "Only Murders in the Building",
    streamingService: "Hulu",
    concluded: false,
    totalSeasons: 6,
    episodes: [
      { season: 5, episode: 1, title: "The Farewell Tour", airDate: "2025-09-09", overview: "Charles, Oliver, and Mabel investigate a shocking new crime that rocks the Arconia community." },
      { season: 5, episode: 10, title: "Curtain Call", airDate: "2025-10-28", overview: "Season 5 finale: The podcast trio solves their most personal case yet." },
      { season: 6, episode: 1, title: "Season 6 Premiere", airDate: "2026-09-29", overview: "A new mystery unfolds in the storied hallways of the Arconia." }
    ]
  },
  "the white lotus": {
    title: "The White Lotus",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 4,
    episodes: [
      { season: 3, episode: 1, title: "Sawatdee", airDate: "2025-02-16", overview: "A new cohort of wealthy guests arrives at the lavish White Lotus luxury resort in Thailand." },
      { season: 3, episode: 8, title: "Karma", airDate: "2025-04-06", overview: "Season 3 finale: The tensions culminate in shocking revelations." },
      { season: 4, episode: 1, title: "Season 4 Premiere", airDate: "2027-02-14", overview: "A new resort destination welcomes an eccentric group of vacationers." }
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
      { season: 1, episode: 1, title: "We Is Us", airDate: "2025-11-07", overview: "Carol Sturka discovers she is immune to a global transformation." },
      { season: 1, episode: 2, title: "Pirate Lady", airDate: "2025-11-07", overview: "Carol navigates a rapidly shifting reality as new alliances form." },
      { season: 1, episode: 3, title: "Grenade", airDate: "2025-11-14", overview: "Tensions mount when unexpected discoveries challenge initial assumptions." },
      { season: 1, episode: 4, title: "Please, Carol", airDate: "2025-11-21", overview: "Carol confronts unexpected resistance while seeking answers." },
      { season: 1, episode: 5, title: "Got Milk", airDate: "2025-11-28", overview: "A routine supply search turns into a high-stakes encounter." },
      { season: 1, episode: 6, title: "HDP", airDate: "2025-12-05", overview: "Strategic decisions must be made as the group faces a critical crossroads." },
      { season: 1, episode: 7, title: "The Gap", airDate: "2025-12-12", overview: "Carol ventures into uncharted territory to bridge a dangerous divide." },
      { season: 1, episode: 8, title: "Charm Offensive", airDate: "2025-12-19", overview: "Diplomatic efforts are tested under extreme pressure." },
      { season: 1, episode: 9, title: "La Chica o El Mundo", airDate: "2025-12-26", overview: "Season finale. A pivotal choice determines the fate of humanity." }
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
    concluded: true,
    totalSeasons: 2,
    episodes: [
      { season: 1, episode: 1, title: "Ice Is Thicker Than Water", airDate: "2017-05-30", overview: "Competitors face freezing underwater obstacles and high-altitude stunts." },
      { season: 1, episode: 2, title: "Party Games", airDate: "2017-06-06", overview: "Contestants take part in extreme party game challenges." },
      { season: 2, episode: 1, title: "Get the Hell Out", airDate: "2018-02-25", overview: "Contestants face their deepest fears in a battle to escape high-stress environments." },
      { season: 2, episode: 2, title: "Tech-Hell", airDate: "2018-03-04", overview: "Contestants face tech-related challenges and extreme digital stunts." }
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
    streamingService: "Max",
    concluded: false,
    totalSeasons: 3,
    episodes: [
      { season: 3, episode: 1, title: "Metropolis Reborn", airDate: "2026-09-05", overview: "Clark, Lois, and Jimmy investigate advanced alien technology surfacing across Metropolis." },
      { season: 3, episode: 2, title: "Brainiac's Return", airDate: "2026-09-12", overview: "Superman must defend the Daily Planet from a cybernetic assault." },
      { season: 3, episode: 3, title: "The House of El", airDate: "2026-09-19", overview: "Clark discovers ancient Kryptonian archives while Hank Henshaw makes a bold power play." },
      { season: 3, episode: 4, title: "Kandor's Light", airDate: "2026-09-26", overview: "An enigmatic alien visitor challenges the team's trust as Metropolis faces a blackout." },
      { season: 3, episode: 5, title: "Truth and Justice", airDate: "2026-10-03", overview: "Hank throws a fit. Clark engages in fisticuffs. John wraps up his visit. The future belongs to everyone." },
      { season: 3, episode: 6, title: "Steel and Shadows", airDate: "2026-10-10", overview: "A mechanized threat targets S.T.A.R. Labs forcing Jimmy and Lois into dangerous investigative journalism." },
      { season: 3, episode: 7, title: "Phantom Zone", airDate: "2026-10-17", overview: "Clark is pulled into a dimensional anomaly and must confront apparitions of Krypton's fall." },
      { season: 3, episode: 8, title: "The Last Son", airDate: "2026-10-24", overview: "An army of cybernetic duplicates threatens Earth." },
      { season: 3, episode: 9, title: "Alliance", airDate: "2026-10-31", overview: "Unlikely allies join forces as the true architect of the Metropolis invasion emerges." },
      { season: 3, episode: 10, title: "Man of Tomorrow", airDate: "2026-11-07", overview: "Season 3 finale: Superman, Lois, and Jimmy rally the entire city for a historic battle." }
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
    streamingService: "Disney+",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 1, episode: 1, title: "Amazing Fantasy", airDate: "2025-01-29", overview: "Peter Parker discovers his superhuman abilities while navigating his freshman year at Midtown High." },
      { season: 1, episode: 2, title: "The Parker Luck", airDate: "2025-01-29", overview: "Peter balances academic pressures with stopping a high-tech robbery in Queens." },
      { season: 1, episode: 3, title: "Secret Identity Crisis", airDate: "2025-01-29", overview: "Norman Osborn takes a keen interest in Peter's scientific aptitude." },
      { season: 1, episode: 4, title: "Hitting the Big Time", airDate: "2025-01-29", overview: "Peter tests the limits of his new spider-suit against a formidable gang." },
      { season: 1, episode: 5, title: "The Unicorn Unleashed", airDate: "2025-01-29", overview: "A rampaging robotic threat tests Spider-Man's agility and wits." },
      { season: 1, episode: 6, title: "Duel with the Devil", airDate: "2025-01-29", overview: "Spider-Man encounters a mysterious vigilante operating in the shadows of Hell's Kitchen." },
      { season: 1, episode: 7, title: "Scorpion Rising", airDate: "2025-01-29", overview: "A genetically modified adversary seeks vengeance against Oscorp." },
      { season: 1, episode: 8, title: "Tangled Web", airDate: "2025-01-29", overview: "Peter's personal and heroic lives collide in an escalating conflict." },
      { season: 1, episode: 9, title: "Hero or Menace", airDate: "2025-01-29", overview: "Media scrutiny and public opinion turn on New York's newest hero." },
      { season: 1, episode: 10, title: "If This Be My Destiny...", airDate: "2025-01-29", overview: "Spider-Man faces an impossible choice to protect the city and those he loves." },
      { season: 2, episode: 1, title: "Season 2 Premiere", airDate: "2026-10-15", overview: "Peter Parker returns for a new semester of superhero adventures in Season 2." }
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
    concluded: true,
    totalSeasons: 6,
    episodes: [
      { season: 6, episode: 6, title: "Lock and Key", airDate: "2022-04-03", overview: "Tommy Shelby resolves family loyalties and prepares his legacy as the television saga reaches its conclusion." }
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
    streamingService: "Prime Video",
    concluded: false,
    totalSeasons: 1,
    episodes: [
      { season: 1, episode: 1, title: "1930s Web", airDate: "2026-11-27", overview: "In 1930s New York, an aging, down-on-his-luck private investigator is forced to grapple with his past life as the city's only superhero." }
    ]
  },
  "spider noir": {
    title: "Spider-Noir",
    streamingService: "Prime Video",
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
    totalSeasons: 2,
    episodes: [
      { season: 1, episode: 1, title: "First Contact", airDate: "2025-08-12", overview: "A mysterious deep-space vessel crash-lands on Earth, forcing a tactical recovery squad into a horrific survival struggle." },
      { season: 1, episode: 8, title: "Earthfall", airDate: "2025-09-23", overview: "Season 1 finale: The Xenomorph threat breaches containment." },
      { season: 2, episode: 1, title: "Season 2 Premiere", airDate: "2027-08-17", overview: "The battle for planetary survival intensifies as the infestation spreads." }
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
    totalSeasons: 2,
    episodes: [
      { season: 1, episode: 1, title: "The Hedge Knight", airDate: "2026-01-18", overview: "Ser Duncan the Tall and his diminutive squire Egg travel Westeros a century before Game of Thrones." },
      { season: 1, episode: 6, title: "The Trial of Seven", airDate: "2026-02-22", overview: "Season 1 finale: Dunk defends his honor in a legendary trial of arms." },
      { season: 2, episode: 1, title: "The Sworn Sword", airDate: "2027-01-17", overview: "Season 2 premiere: Dunk and Egg enter the service of Ser Eustace Osgrey." }
    ]
  },
  "a knight of the seven kingdoms": {
    title: "A Knight of the Seven Kingdoms",
    streamingService: "HBO",
    concluded: false,
    totalSeasons: 2,
    episodes: [
      { season: 1, episode: 1, title: "The Hedge Knight", airDate: "2026-01-18", overview: "Ser Duncan the Tall and his diminutive squire Egg travel Westeros a century before Game of Thrones." },
      { season: 1, episode: 6, title: "The Trial of Seven", airDate: "2026-02-22", overview: "Season 1 finale: Dunk defends his honor in a legendary trial of arms." },
      { season: 2, episode: 1, title: "The Sworn Sword", airDate: "2027-01-17", overview: "Season 2 premiere: Dunk and Egg enter the service of Ser Eustace Osgrey." }
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
  },
  "humans": {
    title: "Humans",
    streamingService: "Hulu",
    concluded: true,
    totalSeasons: 3,
    episodes: [
      { season: 1, episode: 1, title: "Episode 1", airDate: "2015-06-14" },
      { season: 3, episode: 8, title: "Episode 8", airDate: "2018-07-05" }
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
 * Resolves the next upcoming or most recent broadcast episode for a show based on
 * actual real-world broadcast air dates.
 * Follows the real television schedule:
 * 1. Checks for the immediate next upcoming broadcast episode on TV on or after today (airDate >= today).
 * 2. If all scheduled episodes have already aired, returns the most recent broadcast episode (airDate <= today).
 * 3. Falls back to show.nextEpisode if already provided.
 */
export function resolveNextUpcomingEpisode(
  show: {
    title: string;
    latestWatched?: { season: number; episode: number; title?: string };
    concluded?: boolean;
    nextEpisode?: { season: number; episode: number; title?: string; airDate?: string; overview?: string } | null;
    totalSeasons?: number;
  },
  referenceDateStr?: string
): { season: number; episode: number; title: string; airDate: string; overview?: string } | null {
  if (show.concluded) return null;

  const rawTitle = (show.title || '').toLowerCase().trim();
  const norm = normalizeTitle(show.title);

  // Parse today's reference date string safely (YYYY-MM-DD)
  let todayStr: string;
  if (referenceDateStr) {
    todayStr = referenceDateStr.split('T')[0];
  } else {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    todayStr = `${y}-${m}-${d}`;
  }

  // Known shows with no announced upcoming season dates
  if (norm === "rickandmorty" || norm.includes("rickandmorty") || rawTitle.includes("rick and morty")) {
    return null;
  }

  // Find matching schedule
  let schedule: ShowScheduleData | undefined = SHOW_SCHEDULES[rawTitle];
  if (!schedule) {
    schedule = Object.entries(SHOW_SCHEDULES).find(([k]) => {
      const scheduleNorm = normalizeTitle(k);
      return scheduleNorm === norm || norm.includes(scheduleNorm) || scheduleNorm.includes(norm);
    })?.[1];
  }

  if (schedule && schedule.episodes && schedule.episodes.length > 0) {
    // Sort episodes chronologically by airDate, then season/episode
    const sorted = [...schedule.episodes].sort((a, b) => {
      if (a.airDate && b.airDate && a.airDate !== b.airDate) {
        return a.airDate.localeCompare(b.airDate);
      }
      if (a.season !== b.season) return a.season - b.season;
      return a.episode - b.episode;
    });

    // 1. Prioritize the immediate next upcoming broadcast episode (airDate >= today)
    const upcoming = sorted.filter(ep => ep.airDate && ep.airDate >= todayStr);
    if (upcoming.length > 0) {
      const candidate = upcoming[0];
      return {
        season: candidate.season,
        episode: candidate.episode,
        title: candidate.title,
        airDate: candidate.airDate,
        overview: candidate.overview
      };
    }

    // 2. If no future episodes are scheduled, check if the most recent broadcast episode aired within the last 30 days
    const past = sorted.filter(ep => ep.airDate && ep.airDate <= todayStr);
    if (past.length > 0) {
      const candidate = past[past.length - 1];
      if (candidate.airDate) {
        const d = new Date(candidate.airDate).getTime();
        const now = new Date(todayStr).getTime();
        const diffDays = Math.round((now - d) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) {
          return {
            season: candidate.season,
            episode: candidate.episode,
            title: candidate.title,
            airDate: candidate.airDate,
            overview: candidate.overview
          };
        }
      }
    }
    // If a canonical schedule exists for this show and has no upcoming or recent episodes, return null
    return null;
  }

  // If show already has a valid nextEpisode with airDate (in the future or within the last 30 days), keep it
  if (show.nextEpisode && show.nextEpisode.airDate) {
    const d = new Date(show.nextEpisode.airDate).getTime();
    const now = new Date(todayStr).getTime();
    const diffDays = Math.round((now - d) / (1000 * 60 * 60 * 24));
    if (show.nextEpisode.airDate >= todayStr || diffDays <= 30) {
      return {
        season: show.nextEpisode.season,
        episode: show.nextEpisode.episode,
        title: show.nextEpisode.title || `Season ${show.nextEpisode.season} Episode ${show.nextEpisode.episode}`,
        airDate: show.nextEpisode.airDate,
        overview: show.nextEpisode.overview
      };
    }
  }

  return null;
}
