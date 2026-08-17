import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("c:/Users/XSilv/Downloads/christ-world-order-firebase-adminsdk-fbsvc-7c19f7917a.json", "utf8")
);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Fix: remove em dashes, capitalize first letter of every description
const fixes = {
  "O0jhZuijMBbsuEDhSI75": {
    description: "Wrong way darlin. The tee for the girl on the mat who already knows you underestimated her. Girl Jitsu, because she's tapping people out and looking good doing it. Bold front print on a premium black tee. Available in unisex sizes XS through 3XL. Get it before they figure out you're a problem.",
  },
  "w1i371F9gghAKhGB78kR": {
    description: "I dont think she knows whats going on but she looks good. The tee for the girl who came for yoga energy and stayed for the choking. Girl Murder Yoga, because the mats found her and now she has a triangle from mount. Bold print on a premium black tee. She's winning.",
  },
  "BdrNJwLhlX1Hg9LTM0kO": {
    description: "Its gonna be bad. I Got Beat By My Neighbor, the blue belt experience in five words. You earned this belt and somehow it made everything worse. The grapplers who get this the hardest are the ones who wear it proudest. Front print, premium black shirt. Wear it to practice and let everyone assume you meant something else.",
  },
  "DU2npGBfiob9gyT6fIup": {
    description: "Calm down. Youre a blue belt. The most dangerous animal in BJJ, too much technique to quit, too little control to be safe. Spazzy Blue Belt tee for the white belts who survived and immediately became a different kind of problem. Front print, premium black shirt. Wear it everywhere. Apologize to no one.",
  },
  "pXW1IjpJE3HU8Xrs1dmO": {
    description: "Its gonna be bad. I Got Beat By My Neighbor, the white belt experience summed up in five words. You showed up. You tried. It did not go well. This tee gets it. Front print, premium black shirt. Wear it proud. You showed up and that is already more than most people.",
  },
  "0qQI5xNuYLKar8EWbTx3": {
    description: "Christ is King. Camo edition. For those who carry the faith into every battle. Heavy-duty camo hoodie with bold Christ is King print. Built for the mat room, the gym, and everywhere in between. Not a fashion statement. A declaration. Wear it loud.",
  },
  "1FzdrwUfF8BPmUayRxzT": {
    description: "Pass. Sweep. Submit. Repeat. The grapplers mantra on a premium tee. If you have spent any time on the mat you know the drill: same four moves, infinite combinations, and the grind never stops. Print it on your chest. Let them know you have done this before and you will do it again.",
  },
  "4BYAwxYTQjTwYdKWFOyk": {
    description: "Big brain. Bigger lifts. For the gym guy who takes the science seriously but also just wants to pick heavy things up. Unga Bunga, because sometimes your entire training philosophy fits on a grunt. Premium black tee, bold front print. Show up. Add weight. Repeat.",
  },
  "75byo8CJymvEJAE1eksM": {
    description: "Choke people for fitness. BJJ is just murder yoga if you think about it. And we did. This is the tee you wear to explain your hobby without explaining your hobby. Black tee, front print. Great conversation starter. Better conversation ender. For grapplers who are done justifying their sport.",
  },
  "7KSr5MraUmn6POckcESC": {
    description: "Wear the Kingdom. Christ is King crewneck sweatshirt. Heavyweight crew neck with bold back print. Not a fashion statement. A faith statement. Wear it to the gym, to training, to church, or anywhere you want to make it clear where your allegiance is. Available in sizes XS through 3XL.",
  },
  "DgZw4inWRp8kgF2foeP3": {
    description: "Bold statement. Black tee. Christ is King, three words, no asterisks, no apologies. Clean front print on a premium black tee. Built for those who wear their faith the same way they wear everything else: without compromise. Soft, durable, and completely clear on where you stand.",
  },
  "DyChkIMDEaAF3iCoHA3a": {
    description: "For the dude that only sees red. The competitor who does not think in rounds, only in finishes. I See Red, the tee for grapplers and fighters who get locked in and do not come back until it is over. Black tee, front print. Train like it means something. Because for you it does.",
  },
  "MJRIbGmLQxbVGhNsPlkf": {
    description: "Therapist said try yoga. Close enough. BJJ is therapy with better stories and worse injuries. Mentally Ill, Physically Strong, the only accurate description of a person who voluntarily gets choked for fun. Premium black tee with front print. Your therapist does not need to know. This is your secret.",
  },
  "VtoabpWRKWxvawCRmxg9": {
    description: "Put Christ first. Wear it. A simple statement for people who do not need a complicated faith. Bold front print on a premium black tee. Not a church shirt and not a gym shirt. It is both and neither. Just a clean reminder of what actually matters. Soft, durable, and clear.",
  },
  "o0v2mVJZKKCw5UtfBS3i": {
    description: "The bar doesnt care about your feelings. The most honest thing ever said about strength training. Lift It or Die, because at some point you made peace with the fact that you were going to do this forever. Premium black tee, bold front print. Show up. Add weight. Do not complain.",
  },
  // Also fix remaining lowercase starters that have no em dash but start lowercase
  "84iTmY7LLBdDYLuYxFQZ": {
    description: "Just creatine bro. The answer to every question they should not have asked about your gains. Premium black tee with front print. For the gym guy who is tired of explaining himself. No pre-workout conspiracy theories. No elaborate supplement stacks. You just train, you eat right, and you take creatine.",
  },
  "BPQoWyZQ9xYG6123ZZa5": {
    description: "Rawr. All-over cheetah print women's rash guard that hits different on the mats. Four-way stretch, moisture-wicking fabric built for BJJ, MMA, and wrestling. UPF 50+ protection. Roll in style. Win anyway. The person tapping you out is wearing a cheetah print rashguard and she is not sorry.",
  },
  "117": null, // placeholder removed below
};

// Remove the placeholder
delete fixes["117"];

let updated = 0;
for (const [id, patch] of Object.entries(fixes)) {
  if (!patch) continue;
  await db.collection("teedropper_products").doc(id).update(patch);
  console.log(`✓ [${id}]`);
  updated++;
}

console.log(`\nDone. ${updated} updated.`);
process.exit(0);
