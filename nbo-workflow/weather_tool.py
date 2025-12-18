from schema import Literal, Optional, Schema

from griptape.artifacts import TextArtifact
from griptape.artifacts.list_artifact import ListArtifact
from griptape.tools import BaseTool
from griptape.utils.decorators import activity
import json
from pathlib import Path

class WeatherTool(BaseTool):
    @activity(
        config={
            "description": "Returns the weather for a given location. E.g '2°C and Windy'.",
            "schema": Schema(
                {
                    Literal("location", description="Location name"): str,
                }
            )
        }
    )
    def get_weather(self, location: str) -> TextArtifact:
        """Returns the weather for a given location as a TextArtifact.

        Args:
            location (str): Location name.
        """
        print(f"\n[Tool Call] get_weather(location={location})")

        # Mock implementation - in a real scenario, this would query a database or API
        weather_map = {
            "Times Square": "2°C and Windy",
            "The Louvre": "14°C and Heavy Rain",
            "Royal Botanic Garden": "26°C and Sunny"
        }

        weather = weather_map.get(location, "Unknown")
        response = json.dumps({"location": location, "weather": weather})
        return ListArtifact([TextArtifact(response)])

def init_tool() -> WeatherTool:
    return WeatherTool()