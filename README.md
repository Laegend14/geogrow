# GeoGrow: On-Chain Dynamic Agricultural Sandbox

GeoGrow is an AI-powered smart farming simulator powered by **GenLayer Intelligent Oracles** and consensus-driven AI validation networks. Players cultivate crops, manage soil conditions, protect yields against simulated weather elements, and execute secure token purchases and sales tied 1:1 with the native **$GEN token** directly on-chain.

---

## 🚀 Key Architectural Updates

### 1. Simulated Coordinates & Climate Engine
To preserve high-frequency gameplay loop consistency, **coordinates and weather dynamics are simulated directly within the client sandbox**. 
- Multi-region locations (e.g., *Verdant Outpost*, *Highland Oasis*, *Cosy Meadow*) cycle naturally.
- Dynamic weather conditions (*Sunny*, *Rainy*, *Cloudy*, *Stormy*) transition periodically with direct micro-climatic impacts on soil moisture and passive crop growth, bypassing regional IP-geo blocks or heavy wttr.in latency constraints.

### 2. On-Chain $GEN Real-World Credit Marketplace
Farming and tokenomic cycles are integrated **1:1 with the $GEN Utility Token** handled securely through the GenLayer smart contracts:
* **Sovereign Territory Expansion**: Players buy territorial land certificates directly using $GEN. Upgrades are recorded on-chain, preparing grounds for massive scale expansion.
* **On-Chain Equipment Sourcing**: Specialized high-efficiency utility tools can be purchased to fast-track crop protection:
  - **Land Cleaver** (50 GEN): Clears wild trees, rocks, and debris.
  - **Sovereign Hoe** (100 GEN): Ridges and deep-tills raw land.
  - **Bio-Herbicider** (30 GEN): Grants **2x weed clearance efficiency**.
  - **Pest-Nullifier** (40 GEN): Grants **2x pesticide spraying efficiency**.
* **Organic Soil Nutrition Boosters**: Soil composting is expanded to support organic, carbon-rich compounds:
  - **Super Nitro Booster** (8 GEN): Adds rich nitrogen deposits for **+80% soil nutrition**.
  - **Coastal Kelp Extract** (5 GEN): Introduces organic minerals for **+50% soil nutrition**.
  - **Concentrated Humic Acid** (3 GEN): Premium carbon compound for **+30% soil nutrition**.

### 3. AI Oracle Real-World Asset (RWA) Pricing Consensus
Instead of hardcoded static payouts, **crop selling prices are backed by live dynamic real-world agricultural (RWA) commodity indexes** resolved entirely on-chain:
- **Intelligent LLM Crawlers**: GenLayer consensus leaders parse real-world indices and grocery-commodity registries under smart contract rules (`sync_crop_prices()`).
- **AI Validator Agreement**: Multi-node validators review and reach consensus on agricultural commodity prices (Tomato, Wheat, Corn, Carrot, Lettuce, Broccoli, Cabbage, Chili) scaled 1:1 for the game's economic balance, verifying structural sanity and boundary constraints.
- **Settle Yield On-Chain**: Selling mature crops reads the validated real-time oracle price from block storage and credits the player's balance on-chain, cementing authentic tokenomic gameplay.

---

## 🛠️ Smart Contract Method Schema (`/contracts/GeoGrow.py`)

| Method Type | Function Name | Input Arguments | Description |
| :--- | :--- | :--- | :--- |
| **Write** | `sync_crop_prices` | *None* | Triggers GenLayer consensus AI nodes to pull RWA commodity data, reach agreement, and write live crop prices to on-chain global storage. |
| **Write** | `buy_tool` | `tool_id: str, cost_scaled: int` | Records certified ownership of advanced farming equipment on the block state using $GEN. |
| **Write** | `buy_land_expansion` | `cost_scaled: int` | Increments user land sizing on-chain, checking $GEN authorization. |
| **Write** | `harvest_crop` | `crop_type: str, payout_scaled: int` | Resets active soil plot and registers agricultural value settlement. |
| **View** | `get_crop_prices` | *None* | Queries the stored, verified AI-validated RWA grocery-commodity index mapping. |
| **View** | `get_plot` | `address: str` | Retrieves general plot configurations, owned inventory, and land levels. |

---

## 💻 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (for modal transitions).
- **Consensus & Intelligent Contracts**: GenLayer VM, Python-compiled contract, AI consensus validation.
- **Client Services**: Unified Local Storage simulation client and `genlayerService` transaction clients.
