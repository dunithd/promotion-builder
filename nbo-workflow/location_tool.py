from schema import Literal, Optional, Schema

from griptape.artifacts import TextArtifact
from griptape.artifacts.list_artifact import ListArtifact
from griptape.tools import BaseTool
from griptape.utils.decorators import activity
import json
from pathlib import Path

class LocationTool(BaseTool):
    @activity(
        config={
            "description": "Returns the category of a given location.",
            "schema": Schema(
                {
                    Literal("location", description="Location name"): str,
                }
            )
        }
    )
    def get_location_category(self, location: str) -> TextArtifact:
        """Returns the category of a given location as a TextArtifact.

        Args:
            location (str): Location name.
        """
        print(f"\n[Tool Call] get_location_category(location={location})")

        # Mock implementation - in a real scenario, this would query a database or API
        location_categories = {
            "Times Square": "Park",
            "The Louvre": "Museum",
            "Royal Botanic Garden": "Park"
        }

        category = location_categories.get(location, "Unknown")
        response = json.dumps({"location": location, "category": category})
        return ListArtifact([TextArtifact(response)])

def init_tool() -> LocationTool:
    return LocationTool()