from typing import List
from pydantic import BaseModel, Field



# Define a nested model for the content
class Content(BaseModel):
    content: str = Field(
        ...,
        description="The line a persona speaks in the conversation."
    )
    speaker: str = Field(
        ...,
        description="A single letter label, either 'R' for Rachel or 'S' for Simon, to distinguish each persona."
    )


class google_parser(BaseModel):
    result: List[Content] = Field(
        description="A list of conversation turns between Rachel and Simon")
