import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// All fixes: trademark renames, relative image URLs, mojibake, expanded descriptions
const fixes = {

  // ── TRADEMARK RENAMES + FIXES ────────────────────────────────────────────────

  "O0jhZuijMBbsuEDhSI75": {
    name: "Girl Jitsu",
    image: "https://www.teedropper.com/barbie-jitsu-flat.png",
    description: "wrong way darlin. The tee for the girl on the mat who already knows you underestimated her. Girl Jitsu — because she's tapping people out and looking good doing it. Bold front print on a premium black tee. Available in unisex sizes XS through 3XL. Get it before they figure out you're a problem.",
  },

  "q1qfyoMT3gRW4yDcbjW9": {
    name: "Girl Grappling Club Flag",
    description: "Rep the Girl Grappling Club. Vibrant 3x5 ft flag printed on durable polyester with grommets included. Hang it in your gym, your garage, or your competition space. Double-sided print that shows the same on both sides. For the girls who grapple and the clubs that build them.",
  },

  "3RpsGCfrATBlLpHNlZQ9": {
    name: "Women's Rash Guard - All Over Girl",
    description: "Head to toe girl energy. All-over print women's rash guard built for the mats. Four-way stretch, moisture-wicking fabric with UPF 50+ sun protection. Perfect for BJJ, MMA, wrestling, or any combat sport. Train cute. Win ugly. Available in women's sizes XS through 3XL.",
  },

  "Ck6Nn2SD7vOPR3ml53oh": {
    name: "Women's Rash Guard - Girl Jitsu",
    description: "Train cute. Tap out nobody. Girl Jitsu women's rash guard with all-over print. Four-way stretch performance fabric, moisture-wicking and UPF 50+ protection. Built for BJJ, wrestling, and MMA. The mats don't care how you got here. Train hard. Look good doing it.",
  },

  "w1i371F9gghAKhGB78kR": {
    name: "Girl Murder Yoga",
    description: "i dont think she knows whats going on but she looks good. The tee for the girl who came for yoga energy and stayed for the choking. Girl Murder Yoga — because the mats found her and now she has a triangle from mount. Bold print on a premium black tee. She's winning.",
  },

  // ── RELATIVE IMAGE URL FIXES ─────────────────────────────────────────────────

  "BdrNJwLhlX1Hg9LTM0kO": {
    image: "https://www.teedropper.com/igbbmn-blue-belt-mockup.png",
    description: "its gonna be bad. I Got Beat By My Neighbor — the blue belt experience in five words. You earned this belt and somehow it made everything worse. The grapplers who get this the hardest are the ones who wear it proudest. Front print, premium black shirt. Wear it to practice and let everyone assume you meant something else.",
  },

  "DU2npGBfiob9gyT6fIup": {
    image: "https://www.teedropper.com/spazzy-blue-belt-mockup.png",
    description: "calm down. youre a blue belt. The most dangerous animal in BJJ — too much technique to quit, too little control to be safe. Spazzy Blue Belt tee for the white belts who survived and immediately became a different kind of problem. Front print, premium black shirt. Wear it everywhere. Apologize to no one.",
  },

  "Eb7VEldSmdB7kv7w33To": {
    image: "https://www.teedropper.com/just-one-more-round-mockup.png",
    description: "you said that an hour ago. The white belt motto: always one more round, always ten more minutes, always convinced this is the round where it finally clicks. Just One More Round white belt edition. Premium black tee with front print. You will say it again tomorrow and it will still not be the last round.",
  },

  "ViY8TgVECfST6vA5k6X3": {
    image: "https://www.teedropper.com/grappling-club-mockup.png",
    description: "Rep the mat. Black tee, back print. The Grappling Club tee is for everyone who has bled on the mat and came back anyway. Bold back print, clean look. Wear it to practice, to the gym, or anywhere you want the room to know where you spend your time.",
  },

  "pXW1IjpJE3HU8Xrs1dmO": {
    image: "https://www.teedropper.com/igbbmn-white-belt.png",
    description: "its gonna be bad. I Got Beat By My Neighbor — the white belt experience summed up in five words. You showed up. You tried. It did not go well. This tee gets it. Front print, premium black shirt. Wear it proud. You showed up and that is already more than most people.",
  },

  "xXdlDWgwMMBbAumYu1Rn": {
    image: "https://www.teedropper.com/just-one-more-round-womens-mockup.png",
    description: "The grappler's anthem. Skeleton in a gi, always ready for one more. Classic BJJ tee for the person who has been saying just one more round for three years and counting. Bold skeleton graphic, premium black tee in women's fit. Because one more round never actually ends and you both know it.",
  },

  // ── EXPANDED DESCRIPTIONS FOR SHORT-DESC PRODUCTS ────────────────────────────

  "0qQI5xNuYLKar8EWbTx3": {
    description: "Christ is King. Camo edition. For those who carry the faith into every battle. Heavy-duty camo hoodie with bold Christ is King print. Built for the mat room, the gym, and everywhere in between. Not a fashion statement — a declaration. Wear it loud.",
  },

  "0t4fMkHKkaC8Dmx26GTK": {
    description: "Represent the Kingdom. Christ is King women's tee. Fitted cut, soft fabric, bold statement. Whether you're heading to the gym, the mats, or just living your faith out loud, this is the tee you wear without apology. Available in black. No asterisks. No qualifiers.",
  },

  "1FzdrwUfF8BPmUayRxzT": {
    description: "Pass. Sweep. Submit. Repeat. The grapplers mantra on a premium tee. If you have spent any time on the mat you know the drill — same four moves, infinite combinations, and the grind never stops. Print it on your chest. Let them know you have done this before and you will do it again.",
  },

  "31ElK1sMum8KBleTFmT7": {
    description: "Rep your combat sports club. Premium double-sided flag for grapplers, fighters, and competitors. Hang it in your gym, your garage, or your competition corner. Durable polyester, grommets included, 3x5 ft. Built to be seen from across the room and make it clear what goes on inside.",
  },

  "4BYAwxYTQjTwYdKWFOyk": {
    description: "big brain. bigger lifts. For the gym guy who takes the science seriously but also just wants to pick heavy things up. Unga Bunga — because sometimes your entire training philosophy fits on a grunt. Premium black tee, bold front print. Show up. Add weight. Repeat.",
  },

  "75byo8CJymvEJAE1eksM": {
    description: "choke people for fitness. BJJ is just murder yoga if you think about it — and we did. This is the tee you wear to explain your hobby without explaining your hobby. Black tee, front print. Great conversation starter. Better conversation ender. For grapplers who are done justifying their sport.",
  },

  "7KSr5MraUmn6POckcESC": {
    description: "Wear the Kingdom. Christ is King crewneck sweatshirt. Heavyweight crew neck with bold back print. Not a fashion statement — a faith statement. Wear it to the gym, to training, to church, or anywhere you want to make it clear where your allegiance is. Available in sizes XS through 3XL.",
  },

  "84iTmY7LLBdDYLuYxFQZ": {
    description: "just creatine bro. The answer to every question they should not have asked about your gains. Premium black tee with front print. For the gym guy who is tired of explaining himself. No pre-workout conspiracy theories. No elaborate supplement stacks. You just train, you eat right, and you take creatine.",
  },

  "BPQoWyZQ9xYG6123ZZa5": {
    description: "rawr. All-over cheetah print women's rash guard that hits different on the mats. Four-way stretch, moisture-wicking fabric built for BJJ, MMA, and wrestling. UPF 50+ protection. Roll in style. Win anyway. The person tapping you out is wearing a cheetah print rashguard and she is not sorry.",
  },

  "DgZw4inWRp8kgF2foeP3": {
    description: "Bold statement. Black tee. Christ is King — three words, no asterisks, no apologies. Clean front print on a premium black tee. Built for those who wear their faith the same way they wear everything else: without compromise. Soft, durable, and completely clear on where you stand.",
  },

  "DyChkIMDEaAF3iCoHA3a": {
    description: "for the dude that only sees red. The competitor who does not think in rounds, only in finishes. I See Red — the tee for grapplers and fighters who get locked in and do not come back until it is over. Black tee, front print. Train like it means something. Because for you it does.",
  },

  "Kg1gSflKZ9RRv0AGOYfj": {
    description: "Train hard. Rep the club. Grappling Club tank top. Cut for movement and built for training. Whether you are drilling, rolling, or cutting weight in a back room, this is the tank that goes everywhere you do. Bold Grappling Club print on a performance tank. Show up representing.",
  },

  "MJRIbGmLQxbVGhNsPlkf": {
    description: "therapist said try yoga. close enough. BJJ is therapy with better stories and worse injuries. Mentally Ill, Physically Strong — the only accurate description of a person who voluntarily gets choked for fun. Premium black tee with front print. Your therapist does not need to know. This is your secret.",
  },

  "MkyjEFG1Lm2c1myzLgYY": {
    description: "Built for the next generation of grapplers. Camo youth rash guard with four-way stretch and moisture-wicking fabric. Sized for youth athletes from 8 to 20. Durable enough for daily training, sharp enough for competition day. Give them gear they will actually want to wear to every class.",
  },

  "QnrX1BZ0DixXox6swp4w": {
    description: "Submit. Pass. Sweep. Repeat. The camo hoodie for grapplers who never stop. Heavy-duty camo hoodie with bold Submit and Repeat graphic. Wear it to training, wear it after training, wear it when you are watching film at midnight. The grind has a uniform. This is it.",
  },

  "T0p5bav8qm3OvXq4LTy5": {
    description: "Train hard. Grappling Club rashguard. Four-way stretch performance fabric built for the mat room. Bold Grappling Club print, moisture-wicking, UPF 50+ sun protection. Whether you are drilling or competing, show up representing. Available in multiple sizes for men and women.",
  },

  "VtoabpWRKWxvawCRmxg9": {
    description: "Put Christ first. Wear it. A simple statement for people who do not need a complicated faith. Bold front print on a premium black tee. Not a church shirt and not a gym shirt — it is both and neither. Just a clean reminder of what actually matters. Soft, durable, and clear.",
  },

  "XShBm4KhENOCRoRqbU2l": {
    description: "One more round, always. Women's performance rash guard for grapplers who do not know when to stop. Four-way stretch, moisture-wicking, UPF 50+ protection. Built for BJJ, wrestling, and MMA. The just one more round mentality has a uniform and this is it. Available in women's sizes.",
  },

  "XsKRAb2Tjdxr55nadt4c": {
    description: "Built for young competitors. Camo sleeves, Submit and Repeat logo on front, sized for youth athletes 8 to 20. Four-way stretch performance fabric that keeps up with kids who train hard. Whether they are drilling or competing, give them gear that takes it as seriously as they do.",
  },

  "iJh3oDiqgK7Fdzb1Y18s": {
    description: "Rep the girls on the mat. Girls Grappling Club flag for your gym or home. Double-sided print on durable polyester with grommets included. 3x5 ft. Hang it at your club, in your garage, or at competition. The girls are on the mat and now everyone in the building knows it.",
  },

  "ljsobxCVNzQb8jXLkaoU": {
    description: "Little grapplers, big energy. Camo rash guard for kids who are already serious about the mats. Four-way stretch, moisture-wicking performance fabric sized for youth athletes. Durable enough for daily training sessions. Cool enough that they will want to wear it to every single class without arguing.",
  },

  "mTbzPVVIodavmrNwyP3t": {
    description: "Rep the mat room. Grappling Club flag for your gym or home. Double-sided print on durable polyester with grommets included. 3x5 ft. Whether it is your garage gym, your academy wall, or your competition corner, put the world on notice. The Grappling Club is here and it is not quiet.",
  },

  "o0v2mVJZKKCw5UtfBS3i": {
    description: "the bar doesnt care about your feelings. The most honest thing ever said about strength training. Lift It or Die — because at some point you made peace with the fact that you were going to do this forever. Premium black tee, bold front print. Show up. Add weight. Do not complain.",
  },

  "ob0cdXbBDvUQjIxdcPbB": {
    description: "Blend in on the mats. Camo rash guard built for war. Four-way stretch performance fabric with moisture-wicking properties and UPF 50+ protection. Built for BJJ, wrestling, and MMA training. Aggressive enough for competition day. Durable enough for every training session in between. Show up ready to work.",
  },

  "qcTMtN1vpHyxfeieU4jI": {
    description: "Represent the Kingdom on the mats. Christ is King women's rash guard. All-over print performance fabric built for BJJ, wrestling, and MMA. Four-way stretch, moisture-wicking, UPF 50+ protection. Train hard, represent louder. The Kingdom goes wherever you do. Available in women's sizes XS through 3XL.",
  },

  "r9AU2Yt12ASPLvPlSQXv": {
    description: "Submit. Pass. Sweep. Repeat. The camo edition for grapplers who blend in and tap out. Camo tee with bold Submit and Repeat print on the front. Four words that cover everything you do on the mat. Wear it to training. Wear it after. Wear it when you are already thinking about tomorrow's session.",
  },

  "vIByZehuaSadPkADX34I": {
    description: "As iron sharpens iron, so one person sharpens another. Proverbs 27:17. Premium double-sided flag for the training room where real growth happens. Durable polyester, grommets included, 3x5 ft. Hang it where you train, where you compete, or where you remind yourself every morning why you show up.",
  },

  "zzYtTuR1KRbopEgwpzIK": {
    description: "Wear the Kingdom. Christ is King men's hoodie. Heavyweight hoodie with bold back print and clean front. This is not a subtle hoodie and it is not meant to be. Wear it to training, to church, or anywhere you want to be clear about what comes first in your life.",
  },
};

// Also fix the one product that already has 100+ chars but may need mojibake swept
const mojibakeFixes = {
  "oB16X6Z8b78Z3XXC0Cei": {
    description: "Little grapplers, big energy. Camo sleeves, Submit and Repeat logo on front. Built for the next generation of competitors who take the mat seriously. Four-way stretch performance fabric, moisture-wicking, durable. Sized for youth athletes 8-20 who train like they mean it.",
  },
};

const allFixes = { ...fixes, ...mojibakeFixes };

let updated = 0;
let errors = 0;

for (const [id, patch] of Object.entries(allFixes)) {
  try {
    await db.collection("teedropper_products").doc(id).update(patch);
    const changes = Object.keys(patch).join(", ");
    console.log(`✓ [${id}] ${patch.name || "(no rename)"} — updated: ${changes}`);
    updated++;
  } catch (err) {
    console.error(`✗ [${id}] FAILED: ${err.message}`);
    errors++;
  }
}

console.log(`\nDone. ${updated} updated, ${errors} errors.`);
process.exit(0);
