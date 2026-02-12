# backend/schemas.py
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, RootModel


class SenseSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    parts_of_speech: List[str] = Field(default_factory=list)
    glosses: List[str] = Field(default_factory=list)


class WordSchema(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="Unique identifier for the word entry")
    kanji: Optional[str] = None
    kana: str
    is_common: bool = False
    senses: List[SenseSchema] = Field(default_factory=list)


class SearchResponse(RootModel[List[WordSchema]]):
    """Response wrapper (root is a list of WordSchema)."""

    pass

# List - Flashcard


class ListCreateSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class ListResponseSchema(BaseModel):
    id: int
    name: str
    count: int = 0  # number of flashcards in the list


class FlashcardCreateSchema(BaseModel):
    list_id: int = Field(gt=0)
    entry_id: str = Field(min_length=1, max_length=20)
    note: Optional[str] = Field(default=None, max_length=2000)


class FlashcardUpdateSchema(BaseModel):
    is_memorized: bool
    note: Optional[str] = Field(default=None, max_length=2000)


class FlashcardResponseSchema(BaseModel):
    id: int
    list_id: int
    entry_id: str
    note: Optional[str] = None
    is_memorized: bool
    word_data: WordSchema