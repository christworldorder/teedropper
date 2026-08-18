const API_KEY = "ZKeoALb44i0MKEGZnqiFCiziPKmq5UoWfp08XONw";

const HOODIE_VARIANTS = [
  5438463665, 5438463666, 5438463667, 5438463668, 5438463669, 5438463670, 5438463671, 5438463672,
  5438471953, 5438471954, 5438471955, 5438471956, 5438471957, 5438471958
];

const RASHGUARD_VARIANTS = [
  5438689790, 5438689791, 5438689792, 5438689793,
  5438542638, 5438542639, 5438542640, 5438542641, 5438542642, 5438542643, 5438542644,
  5438411528, 5438411529, 5438411530, 5438411531, 5438411532, 5438411533, 5438411534,
  5438362610, 5438362611, 5438362613, 5438362614, 5438362615, 5438362616, 5438362617,
  5437267798, 5437267799, 5437267800, 5437267801, 5437267802, 5437267803, 5437267804,
  5437159723, 5437159724, 5437159725, 5437159726, 5437159727, 5437159728, 5437159729,
  5437154448, 5437154449, 5437154450, 5437154451, 5437154452, 5437154453, 5437154454
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function updateVariant(id, price) {
  const res = await fetch(`https://api.printful.com/store/variants/${id}`, {
    method: "PUT",
    headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sync_variant: { retail_price: price.toFixed(2) } })
  });
  const data = await res.json();
  if (data.code === 200) {
    console.log(`✓ ${id} → $${price}`);
  } else if (data.code === 429) {
    console.log(`⏳ ${id} rate limited, retrying in 60s...`);
    await sleep(60000);
    return updateVariant(id, price);
  } else {
    console.log(`✗ ${id}: ${JSON.stringify(data.error)}`);
  }
}

async function run() {
  console.log("Updating hoodies to $49.99...");
  for (const id of HOODIE_VARIANTS) {
    await updateVariant(id, 49.99);
    await sleep(1500);
  }

  console.log("\nUpdating rash guards to $64.99...");
  for (const id of RASHGUARD_VARIANTS) {
    await updateVariant(id, 64.99);
    await sleep(1500);
  }

  console.log("\nAll done!");
}

run().catch(console.error);
