import { createPool } from "mysql2/promise";

const dbUrl = process.env.DATABASE_URL || "";

async function seed() {
  console.log("Seeding database...");
  const pool = createPool({ uri: dbUrl, connectionLimit: 2 });

  // Products - Egyptian e-commerce winning products
  const productData = [
    ["Wireless Earbuds Pro", "Electronics", 120, 320, "aliexpress.com/earbuds", "high", "medium"],
    ["Organic Argan Oil Set", "Beauty", 80, 280, "aliexpress.com/argan", "high", "low"],
    ["Smart Home LED Strip", "Electronics", 45, 150, "aliexpress.com/ledstrip", "medium", "medium"],
    ["Egyptian Cotton Towels", "Home", 90, 220, "aliexpress.com/towels", "medium", "low"],
    ["Fitness Resistance Bands", "Sports", 25, 95, "aliexpress.com/bands", "high", "low"],
    ["Phone Stand & Holder", "Electronics", 15, 65, "aliexpress.com/stand", "high", "high"],
    ["USB-C Hub 7-in-1", "Electronics", 55, 180, "aliexpress.com/usbchub", "medium", "medium"],
    ["Reusable Silicone Food Bags", "Home", 30, 95, "aliexpress.com/bags", "medium", "low"],
    ["Car Phone Mount", "Automotive", 18, 75, "aliexpress.com/carmount", "high", "high"],
    ["Sleep Eye Mask 3D", "Health", 12, 55, "aliexpress.com/mask", "medium", "low"],
    ["Bluetooth Speaker Mini", "Electronics", 70, 250, "aliexpress.com/speaker", "high", "medium"],
    ["Kitchen Oil Spray Bottle", "Home", 20, 85, "aliexpress.com/spray", "high", "low"],
    ["Laptop Cooling Pad", "Electronics", 60, 180, "aliexpress.com/cooling", "medium", "medium"],
    ["Collapsible Water Bottle", "Sports", 35, 120, "aliexpress.com/bottle", "medium", "low"],
    ["LED Desk Lamp Touch", "Home", 100, 320, "aliexpress.com/lamp", "medium", "medium"],
  ];

  for (const [name, cat, cost, sell, url, demand, comp] of productData) {
    const margin = ((Number(sell) - Number(cost)) / Number(sell) * 100).toFixed(2);
    await pool.execute(
      `INSERT IGNORE INTO products (name, category, costPrice, sellingPrice, margin, supplierUrl, demandLevel, competitionLevel, aiScore) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, cat, cost, sell, margin, url, demand, comp, Math.floor(70 + Math.random() * 25)]
    );
  }
  console.log("  Products seeded");

  // Customers - Egyptian governorates
  const customerData = [
    ["Ahmed Hassan", "+201012345678", "Cairo", "Nasr City", "15 El-Nasr St, Nasr City"],
    ["Sara Mohamed", "+201123456789", "Giza", "Mohandessin", "42 Sudan St, Mohandessin"],
    ["Mahmoud Ali", "+201234567890", "Alexandria", "Sidi Gaber", "8 El-Horreya Rd, Sidi Gaber"],
    ["Nour Ibrahim", "+201345678901", "Cairo", "Maadi", "22 Rd 9, Maadi"],
    ["Omar Khaled", "+201456789012", "Qalyubia", "Benha", "3 El-Gomhoreya St"],
    ["Laila Ahmad", "+201567890123", "Giza", "6th of October", "Bldg 12, District 3"],
    ["Youssef Samir", "+201678901234", "Cairo", "Heliopolis", "55 El-Merghany St"],
    ["Fatima Hassan", "+201789012345", "Sharqia", "Zagazig", "7 El-Saada St"],
    ["Khaled Omar", "+201890123456", "Cairo", "New Cairo", "Villa 8, 5th Compound"],
    ["Mona Ibrahim", "+201901234567", "Giza", "Dokki", "12 El-Batal Ahmed St"],
    ["Hassan Youssef", "+202012345678", "Alexandria", "Miami", "25 Corniche Rd"],
    ["Nadia Samir", "+202123456789", "Qalyubia", "Shubra El-Kheima", "9 El-Gomhoreya St"],
    ["Tarek Mahmoud", "+202234567890", "Cairo", "Zamalek", "4 Brazil St"],
    ["Reem Khaled", "+202345678901", "Giza", "Faisal", "77 El-Haram St"],
    ["Amr Diab", "+202456789012", "Dakahlia", "Mansoura", "33 El-Gomhoreya St"],
    ["Salma Ahmed", "+202567890123", "Cairo", "Tagamoa", "Bldg 15, 3rd District"],
    ["Karim Mostafa", "+202678901234", "Giza", "Sheikh Zayed", "Villa 22, 4th District"],
    ["Dina Hassan", "+202789012345", "Alexandria", "Smouha", "18 Victor Emanuel St"],
    ["Hesham Ali", "+202890123456", "Beheira", "Damanhour", "6 El-Gomhoreya St"],
    ["Mariam Khaled", "+202901234567", "Cairo", "Shorouk", "12 El-Wahat St"],
  ];

  for (const [name, phone, gov, city, addr] of customerData) {
    await pool.execute(
      `INSERT IGNORE INTO customers (name, phone, governorate, city, address, totalOrders, totalSpent) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, gov, city, addr, Math.floor(1 + Math.random() * 8), (Math.floor(500 + Math.random() * 5000)).toFixed(2)]
    );
  }
  console.log("  Customers seeded");

  // Orders
  const statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled", "no_answer"];
  for (let i = 1; i <= 50; i++) {
    const custId = Math.floor(1 + Math.random() * 20);
    const items = Math.floor(1 + Math.random() * 4);
    const subtotal = (Math.floor(200 + Math.random() * 3000)).toFixed(2);
    const shipping = Math.floor(20 + Math.random() * 60).toFixed(2);
    const vat = (parseFloat(subtotal) * 0.14).toFixed(2);
    const total = (parseFloat(subtotal) + parseFloat(shipping) + parseFloat(vat)).toFixed(2);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const payment = Math.random() > 0.1 ? "cod" : "wallet";
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(Date.now() - daysAgo * 86400000);

    await pool.execute(
      `INSERT INTO orders (orderCode, customerId, itemCount, subtotal, shippingFee, vatAmount, totalAmount, paymentMethod, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`ORD-${2400 + i}`, custId, items, subtotal, shipping, vat, total, payment, status, date]
    );
  }
  console.log("  Orders seeded");

  // Shipments
  const providers = ["bosta", "aramex", "vhub", "smsa"];
  const shipStatuses = ["pending", "in_transit", "out_for_delivery", "delivered", "returned"];
  for (let i = 1; i <= 40; i++) {
    const prov = providers[Math.floor(Math.random() * 4)];
    const status = shipStatuses[Math.floor(Math.random() * 5)];
    const estDays = 1 + Math.floor(Math.random() * 3);
    const gov = ["Cairo", "Giza", "Alexandria", "Qalyubia", "Sharqia"][Math.floor(Math.random() * 5)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(Date.now() - daysAgo * 86400000);

    await pool.execute(
      `INSERT INTO shipments (orderId, trackingCode, provider, status, estimatedDays, governorate, codAmount, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [i, `${prov.toUpperCase()}${1000000 + i}`, prov, status, estDays, gov, (Math.floor(200 + Math.random() * 3000)).toFixed(2), date]
    );
  }
  console.log("  Shipments seeded");

  // Campaigns
  const campaigns = [
    ["Summer Collection 2024", "meta", "conversions", "active", 50000, 32400, 1250000, 45000, 1800, 4.2],
    ["Flash Sale - Electronics", "meta", "conversions", "active", 30000, 21800, 890000, 28000, 950, 3.8],
    ["Ramadan Special", "google", "traffic", "ended", 45000, 45000, 2100000, 78000, 3200, 3.5],
    ["Back to School", "meta", "conversions", "draft", 25000, 0, 0, 0, 0, 0],
    ["Weekend Deals", "tiktok", "awareness", "active", 15000, 12100, 680000, 19000, 620, 2.9],
  ];
  for (const [name, platform, obj, status, budget, spent, imp, clicks, conv, roas] of campaigns) {
    await pool.execute(
      `INSERT INTO campaigns (name, platform, objective, status, budget, spent, impressions, clicks, conversions, roas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, platform, obj, status, budget, spent, imp, clicks, conv, roas]
    );
  }
  console.log("  Campaigns seeded");

  // Financial transactions
  const txTypes = [
    ["revenue", "Product Sales", 1], ["revenue", "Product Sales", 1],
    ["ad_spend", "Meta Ads", -1], ["ad_spend", "Meta Ads", -1],
    ["product_cost", "Supplier Payment", -1], ["product_cost", "Supplier Payment", -1],
    ["shipping_cost", "Shipping Fees", -1], ["shipping_cost", "Shipping Fees", -1],
    ["vat_collected", "VAT 14%", 1], ["vat_collected", "VAT 14%", 1],
  ];
  for (let i = 0; i < 60; i++) {
    const [type, cat, sign] = txTypes[Math.floor(Math.random() * txTypes.length)];
    const amount = (Math.floor(100 + Math.random() * 8000) * sign).toFixed(2);
    const gov = ["Cairo", "Giza", "Alexandria", "Qalyubia", "Sharqia"][Math.floor(Math.random() * 5)];
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(Date.now() - daysAgo * 86400000);

    await pool.execute(
      `INSERT INTO financial_transactions (type, category, amount, governorate, date) VALUES (?, ?, ?, ?, ?)`,
      [type, cat, amount, gov, date]
    );
  }
  console.log("  Financial transactions seeded");

  // Team members
  const teamData = [
    ["Omar Hassan", "omar@nexusai.com", "Operations Manager", "operations", "active", 92, 98],
    ["Nour Ahmed", "nour@nexusai.com", "Marketing Lead", "marketing", "active", 88, 95],
    ["Khaled Samir", "khaled@nexusai.com", "Senior Developer", "tech", "active", 95, 92],
    ["Sara Mahmoud", "sara@nexusai.com", "Sales Supervisor", "sales", "on_leave", 82, 88],
    ["Ahmed Youssef", "ahmed@nexusai.com", "Finance Analyst", "finance", "active", 90, 96],
    ["Mariam Khaled", "mariam@nexusai.com", "HR Specialist", "hr", "active", 87, 94],
    ["Hassan Ibrahim", "hassan@nexusai.com", "Logistics Coordinator", "operations", "active", 85, 90],
    ["Laila Omar", "laila@nexusai.com", "Creative Designer", "marketing", "active", 91, 97],
  ];
  for (const [name, email, role, dept, status, perf, att] of teamData) {
    await pool.execute(
      `INSERT INTO team_members (name, email, role, department, status, performance, attendance, joinDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, role, dept, status, perf, att, new Date(2022 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1)]
    );
  }
  console.log("  Team members seeded");

  // Agent activities
  const activities = [
    ["ceo", "ROAS Alert", "ROAS on Wireless Charger reached 4.1x. Recommend scaling budget by 30%.", "positive", 12000],
    ["shipping", "Delivery Alert", "Bosta delivery rate in Aswan dropped to 72%. Recommend switching to Aramex.", "negative", -4500],
    ["product_hunter", "New Product Found", "Smart Water Bottle trending on TikTok with 6.5x margin potential.", "positive", 15800],
    ["finance", "Cash Flow Warning", "Ad spend up 23% WoW but revenue up only 8%. Review campaign targeting.", "negative", -8400],
    ["confirmation", "Fake Order Detection", "12 orders flagged as fake with 96.2% confidence. Auto-cancelled 8.", "positive", 3200],
    ["creative_director", "New Variants", "5 new ad variations generated for Oil Spray campaign. CTR: 3.2%", "positive", 5600],
    ["moderator", "Review Alert", "3 customer complaints about delivery delays in Alexandria.", "negative", 0],
    ["landing_page", "Conversion Drop", "Summer Collection page conversion dropped 1.2%. A/B test recommended.", "negative", -2100],
    ["finance", "VAT Filing", "Monthly VAT filing prepared. EGP 47,200 due by 15th.", "neutral", 0],
    ["team", "Shift Coverage", "Night shift coverage at 78%. Need 2 more staff.", "neutral", 0],
  ];
  for (const [agent, action, desc, impact, val] of activities) {
    await pool.execute(
      `INSERT INTO agent_activities (agent, action, description, impact, impactValue, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [agent, action, desc, impact, val.toString(), "pending"]
    );
  }
  console.log("  Agent activities seeded");

  // Recommendations
  const recs = [
    ["ceo", "strategy", "Scale Wireless Charger campaign", "ROAS at 4.1x, 3x above target. Increase daily budget from EGP 800 to EGP 1,200.", 94, "+EGP 12,000/mo"],
    ["shipping", "provider_switch", "Switch Aswan to Aramex", "Bosta delivery rate in Aswan at 72%. Aramex averages 91% in same region.", 91, "+8% delivery"],
    ["product_hunter", "new_product", "Add Smart Water Bottle", "TikTok trending, low competition, 6.5x margin. Estimated 200 units/month.", 89, "+EGP 15,800/mo"],
    ["finance", "cost_reduction", "Reduce ad spend on low-ROAS", "3 campaigns below 2.0x ROAS. Reallocate EGP 8,400 to top performers.", 88, "+EGP 8,400/mo"],
    ["creative_director", "creative_update", "Generate UGC for Oil Spray", "UGC-style creatives show 40% higher CTR. Generate 3 new variants.", 85, "+EGP 5,600/mo"],
    ["landing_page", "ab_test", "Test new Summer Collection layout", "Current conversion 3.2%. New layout could increase to 4.5% based on data.", 84, "+EGP 4,200/mo"],
    ["confirmation", "automation", "Enable auto-confirmation", "AI confidence at 96% on pattern detection. Enable auto-confirm to save 2.5h daily.", 92, "Save EGP 3,200/mo"],
    ["moderator", "review", "Review Alexandria complaints", "3 complaints about 5+ day delivery. Investigate Bosta route.", 78, "+5% NPS"],
  ];
  for (const [agent, type, title, desc, conf, impact] of recs) {
    await pool.execute(
      `INSERT INTO recommendations (agent, type, title, description, confidence, impact) VALUES (?, ?, ?, ?, ?, ?)`,
      [agent, type, title, desc, conf, impact]
    );
  }
  console.log("  Recommendations seeded");

  await pool.end();
  console.log("\nDatabase seeded successfully!");
}

seed().catch(e => { console.error(e); process.exit(1); });
