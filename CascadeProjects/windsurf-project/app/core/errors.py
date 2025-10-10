from fastapi import HTTPException, status

class NotFound(HTTPException):
    def __init__(self, entity: str = "Resource"):
        super().__init__(status.HTTP_404_NOT_FOUND, f"{entity} not found")

class Conflict(HTTPException):
    def __init__(self, detail: str = "Conflict"):
        super().__init__(status.HTTP_409_CONFLICT, detail)
