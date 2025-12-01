from pydantic import BaseModel


class Localization(BaseModel):
    it: str
    en: str
