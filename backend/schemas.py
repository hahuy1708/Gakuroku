from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, RootModel


class SenseSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    parts_of_speech: List[str] = Field(default_factory=list)
    glosses: List[str] = Field(default_factory=list)


class WordSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    kanji: Optional[str] = None
    kana: str
    is_common: bool = False
    senses: List[SenseSchema] = Field(default_factory=list)


class SearchResponse(RootModel[List[WordSchema]]):
    """Response wrapper (root is a list of WordSchema)."""

    pass
