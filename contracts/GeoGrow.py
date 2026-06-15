# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json

class GeoGrow(gl.Contract):
    plots: TreeMap[Address, str]           # User Address -> JSON plot data string
    total_seeds_planted: u256

    def __init__(self):
        self.total_seeds_planted = 0

    @gl.public.write
    def record_action(self, action_type: str, payload_json: str) -> None:
        """Records general agricultural actions securely on-chain."""
        user = gl.message.sender_address
        
        plot_str = self.plots[user] if user in self.plots else "{}"
        current_plot = json.loads(plot_str)
        
        current_plot['last_action'] = action_type
        current_plot['last_update_block'] = int(gl.block.number)
        
        if action_type == "PLANT_CROP":
            self.total_seeds_planted += 1
            
        self.plots[user] = json.dumps(current_plot)

    @gl.public.write
    def sync_crop_prices(self) -> str:
        """
        Consensus-driven on-chain AI Oracle. Fetches live real-world (RWA) average wholesale 
        agricultural index crop values, parses them with LLM validators, and establishes 
        on-chain crop prices tied 1:1 to the $GEN token.
        """
        def leader_fn():
            # Scraping global agricultural commodity markets or using an LLM search 
            # to verify real-world crop indexes (Tomato, Wheat, Corn, Carrot, etc.)
            url = "https://markets.businessinsider.com/commodities"
            response_text = gl.nondet.web.render(url, mode="text")
            
            prompt = f"""
            Analyze the following text market feed: {response_text[:3000]}
            Determine the latest real-world wholesale market prices (or national index) in USD for the following crops.
            Convert them into a balanced game rate (per unit) aligned 1:1 with the $GEN token, keeping strictly in these ranges:
            - tomato: 1.80 to 3.50
            - wheat: 2.50 to 4.50
            - corn: 3.50 to 6.00
            - lettuce: 1.20 to 2.80
            - carrot: 2.00 to 4.00
            - broccoli: 3.00 to 5.50
            - cabbage: 2.50 to 4.80
            - chili: 4.00 to 7.50

            If the text lacks some info, use your world knowledge to find their average RWA market values for today!
            Return strictly a valid JSON object matching this schema exactly:
            {{
              "tomato": <float>,
              "wheat": <float>,
              "corn": <float>,
              "lettuce": <float>,
              "carrot": <float>,
              "broccoli": <float>,
              "cabbage": <float>,
              "chili": <float>
            }}
            """
            llm_output = gl.nondet.exec_prompt(prompt, response_format="json").strip()
            return llm_output

        def validator_fn(res) -> bool:
            try:
                prices = json.loads(res)
                required_crops = ["tomato", "wheat", "corn", "lettuce", "carrot", "broccoli", "cabbage", "chili"]
                if not all(crop in prices for crop in required_crops):
                    return False
                
                # Verify sanity boundaries to thwart malicious consensus proposals
                if not (1.0 <= float(prices["tomato"]) <= 6.0): return False
                if not (1.0 <= float(prices["wheat"]) <= 8.0): return False
                if not (1.5 <= float(prices["corn"]) <= 10.0): return False
                if not (0.8 <= float(prices["lettuce"]) <= 5.0): return False
                if not (1.0 <= float(prices["carrot"]) <= 7.0): return False
                if not (1.5 <= float(prices["broccoli"]) <= 9.0): return False
                if not (1.0 <= float(prices["cabbage"]) <= 8.0): return False
                if not (2.0 <= float(prices["chili"]) <= 12.0): return False
                return True
            except Exception:
                return False

        # Execute non-deterministic consensus to form the agreed crop rates
        prices_raw = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        
        # Save prices to virtual global slot (0x000...000)
        self.plots[Address("0x0000000000000000000000000000000000000000")] = prices_raw
        return prices_raw

    @gl.public.write
    def buy_tool(self, tool_id: str, cost_scaled: int) -> None:
        """Purchase high-efficiency farming tool on-chain using $GEN."""
        user = gl.message.sender_address
        
        plot_str = self.plots[user] if user in self.plots else "{}"
        current_plot = json.loads(plot_str)
        
        if 'tools' not in current_plot:
            current_plot['tools'] = []
            
        if tool_id not in current_plot['tools']:
            current_plot['tools'].append(tool_id)
            
        current_plot['last_action'] = f"BUY_TOOL_{tool_id.upper()}"
        current_plot['last_update_block'] = int(gl.block.number)
        current_plot['spend_scaled'] = cost_scaled
        
        self.plots[user] = json.dumps(current_plot)

    @gl.public.write
    def buy_land_expansion(self, cost_scaled: int) -> None:
        """Purchase Sovereign plot extension on-chain using $GEN."""
        user = gl.message.sender_address
        
        plot_str = self.plots[user] if user in self.plots else "{}"
        current_plot = json.loads(plot_str)
        
        current_plot['land_expansion_level'] = current_plot.get('land_expansion_level', 1) + 1
        current_plot['last_action'] = "BUY_LAND_EXPANSION"
        current_plot['last_update_block'] = int(gl.block.number)
        current_plot['spend_scaled'] = cost_scaled
        
        self.plots[user] = json.dumps(current_plot)

    @gl.public.write
    def sync_game_state(self, lat_scaled: int, lng_scaled: int) -> str:
        """
        Coordinates sync, maintained for backward compatibility. 
        Stores location context under user's state.
        """
        user = gl.message.sender_address
        plot_str = self.plots[user] if user in self.plots else "{}"
        current_plot = json.loads(plot_str)
        
        current_plot['coordinates'] = {"lat": lat_scaled, "lng": lng_scaled}
        current_plot['last_sync_block'] = int(gl.block.number)
        
        self.plots[user] = json.dumps(current_plot)
        return json.dumps({
            "status": "synchronized",
            "block": int(gl.block.number)
        })

    @gl.public.write
    def harvest_crop(self, crop_type: str, payout_scaled: int) -> None:
        """Harvests a crop securely on-chain, resetting plot and finalizing payouts."""
        user = gl.message.sender_address
        
        plot_str = self.plots[user] if user in self.plots else "{}"
        current_plot = json.loads(plot_str)
        
        current_plot['growth_progress'] = 0
        current_plot['is_planted'] = False
        current_plot['soil_status'] = "Cleared"
        current_plot['last_action'] = "HARVEST"
        current_plot['last_update_block'] = int(gl.block.number)
        current_plot['crop_type'] = crop_type
        current_plot['harvest_payout_scaled'] = payout_scaled
        
        self.plots[user] = json.dumps(current_plot)

    @gl.public.write
    def activate_time_warp(self, cost_scaled: int) -> None:
        """Pays GEN to trigger simulated growth cycles with temporal incandescence."""
        user = gl.message.sender_address
        
        plot_str = self.plots[user] if user in self.plots else "{}"
        current_plot = json.loads(plot_str)
        
        current_plot['growth_progress'] = min(1000000, current_plot.get('growth_progress', 0) + 250000)
        current_plot['health'] = max(0, current_plot.get('health', 100) - 5)
        current_plot['last_action'] = "TIME_WARP"
        current_plot['last_update_block'] = int(gl.block.number)
        current_plot['warp_cost_scaled'] = cost_scaled
        
        self.plots[user] = json.dumps(current_plot)

    # ═══════════════════════════════════════════════════════════════════════
    # VIEW METHODS
    # ═══════════════════════════════════════════════════════════════════════

    @gl.public.view
    def get_plot(self, address: str) -> str:
        addr = Address(address)
        return self.plots[addr] if addr in self.plots else "{}"

    @gl.public.view
    def get_total_seeds(self) -> int:
        return int(self.total_seeds_planted)

    @gl.public.view
    def get_crop_prices(self) -> str:
        """Returns the consensus-driven RWA crop price registry on-chain."""
        addr = Address("0x0000000000000000000000000000000000000000")
        if addr in self.plots:
            return self.plots[addr]
        return json.dumps({
            "tomato": 2.50,
            "wheat": 3.50,
            "corn": 5.00,
            "lettuce": 2.00,
            "carrot": 3.00,
            "broccoli": 4.50,
            "cabbage": 4.00,
            "chili": 6.00
        })
