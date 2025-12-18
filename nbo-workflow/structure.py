import sys
import argparse
# from dotenv import load_dotenv
from griptape.rules import Rule, Ruleset
from griptape.structures import Agent
from griptape.utils import GriptapeCloudStructure 

from location_tool import LocationTool
from weather_tool import WeatherTool

# load_dotenv()

def build_agent() -> Agent:
    """Build the Offer Matching Structure."""
    return Agent(
        id="offer-matching-agent",
        tools=[LocationTool(), WeatherTool()],
        rulesets=[
            Ruleset(
                name="Objective",
                rules=[
                    Rule(
                        value="Autonomously find the next best offer while strictly following the mandatory campaign rules.",
                    ),
                    Rule(
                        value="Once an offer is selected, craft a personalized offer message to the customer.",
                    )
                ],
            ),
            Ruleset(
                name="Background",
                rules=[
                    Rule(
                        value="You are a Coffee Shop Marketing Agent. When a transaction occurs, use your tools to check the surroundings and weather."
                    ),
                    Rule(
                        value="Use LocationTool to get the location category for the transaction location."
                    ),
                    Rule(
                        value="Use WeatherTool to get current weather conditions for the transaction location."
                    )
                ],
            ),
            Ruleset(
                name="Campaign Rules",
                rules=[
                    Rule(
                        value='If Temperature < 10°C AND previous purchase was NOT a hot drink, offer "Warmth Booster"',
                    ),
                    Rule(
                        value='If Temperature > 20°C AND Location = Park OR Beach, offer "Picnic Perfection"',
                    ),
                    Rule(
                        value='If Weather = Rain OR Snow AND Location = Museum OR Transit Hub, offer "Rainy Day Special"',
                    )
                ],
            ),
            Ruleset(
                name="Available Offers",
                rules=[
                    Rule(
                        value='Warmth Booster: 50% off any Large Hot Beverage',
                    ),
                    Rule(
                        value='Picnic Perfection: Add a Muffin/Pastry for $1.00',
                    ),
                    Rule(
                        value='Rainy Day Special: Free "Stay & Refill" + 15% off food',
                    )
                ],
            ),
        ],
    )

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-c",
        "--customer-id",
        default="CUST-102",
        help="Customer ID",
    )
    parser.add_argument(
        "-l",
        "--location",
        default="Times Square",
        help="Location",
    )
    parser.add_argument(
        "-i",
        "--item-purchased",
        default="Coffee",
        help="Item purchased",
    )
    args = parser.parse_args()
    
    prompt = f"""
    A new transaction has occurred. Here is the data:

    - customer_id: {args.customer_id}
    - location: {args.location}
    - item_purchased: {args.item_purchased}

    Find the next best offer. Provide a summary at the end."""
    
    with GriptapeCloudStructure():
        agent = build_agent()
        agent.run(prompt)