from fastapi import APIRouter, Depends
from typing import List

# You can create a dependency in app/api/deps.py to verify Firebase tokens
# from app.api.deps import get_current_user 

router = APIRouter()


@router.get("/", response_model=List[dict])
async def read_items():
    """ 
    An example endpoint that returns a list of items.
    In a real app, you would fetch this data from your Firebase database.
    """
    return [{"id": "item1", "name": "Example Item 1"}, {"id": "item2", "name": "Example Item 2"}]


@router.get("/protected", response_model=dict)
async def read_protected_items(
    # user: dict = Depends(get_current_user)  # Uncomment this to protect the endpoint
):
    """
    An example of a protected endpoint.
    You would create a `get_current_user` dependency to verify the Firebase ID token.
    """
    return {"message": f"Welcome! This is a protected resource."}
