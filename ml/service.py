import json
from pathlib import Path
from unicodedata import combining, normalize

from fastapi import FastAPI, HTTPException
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def fold(text: str) -> str:
    clean = normalize("NFD", text.casefold()).replace("đ", "d")
    return "".join(char for char in clean if not combining(char))


catalog_file = Path(__file__).resolve().parents[1] / "shared" / "courts.json"
catalog = json.loads(catalog_file.read_text(encoding="utf-8"))
positions = {court["slug"]: index for index, court in enumerate(catalog)}
documents = [
    fold(" ".join([
        court["sport"], court["sport"], court["area"], court["summary"],
        " ".join(court["features"]),
    ]))
    for court in catalog
]
vectors = TfidfVectorizer(ngram_range=(1, 2)).fit_transform(documents)

app = FastAPI(title="Sân Hẹn · Gợi ý sân")


@app.get("/recommend/{slug}")
def recommend(slug: str):
    if slug not in positions:
        raise HTTPException(status_code=404, detail="Không tìm thấy sân.")
    index = positions[slug]
    scores = cosine_similarity(vectors[index], vectors).ravel()
    candidates = sorted(
        (i for i in range(len(catalog)) if i != index),
        key=lambda i: (-scores[i], catalog[i]["price"]),
    )
    return {"slugs": [catalog[i]["slug"] for i in candidates[:2]]}
