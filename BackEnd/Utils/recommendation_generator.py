# BackEnd/Utils/recommendation_generator.py
from typing import List, Dict
from datetime import date
from BackEnd.Models.recommendation import RecommendationSource, RecommendationPriority

def generate_recommendations_from_behavior(data: Dict) -> List[Dict]:
    """
    Generate behavioral recommendations based on input data.

    Example:
    - If 'tantrums' are detected in the input data, suggest strategies
      like timeout and reward systems to handle tantrums.

    Parameters:
    - data (Dict): Dictionary containing behavior data.

    Returns:
    - List[Dict]: List of generated recommendation dictionaries.
    """
    recs = []

    # Example heuristic: if 'tantrums' key exists in data
    if "tantrums" in data:
        recs.append({
            "title": "Handle Tantrums",
            "description": "Use timeout and positive reinforcement strategies.",
            "priority": RecommendationPriority.HIGH,  # Priority enum
            "source": RecommendationSource.AI_MODEL,  # Source enum
            "effective_date": date.today(),  # Today's date
            "type": "behavior",  # Recommendation type
            "metadata": '{"steps": ["Timeout", "Reward system"]}'  # Optional metadata
        })

    return recs


def generate_recommendations_from_emotion(data: Dict) -> List[Dict]:
    """
    Generate emotional support recommendations based on input data.

    Example:
    - If anxiety score > 0.7, suggest routines and reassurance activities.

    Parameters:
    - data (Dict): Dictionary containing emotional indicators (e.g. anxiety levels).

    Returns:
    - List[Dict]: List of generated recommendation dictionaries.
    """
    recs = []

    # Example heuristic: anxiety score > 0.7 triggers recommendation
    if data.get("anxiety", 0) > 0.7:
        recs.append({
            "title": "Reduce Anxiety",
            "description": "Create a predictable daily routine and provide reassurance.",
            "priority": RecommendationPriority.HIGH,
            "source": RecommendationSource.AI_MODEL,
            "effective_date": date.today(),
            "type": "emotional",
            "metadata": '{"activities": ["Routine chart", "Reassurance phrases"]}'
        })

    return recs
