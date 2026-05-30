import random
from typing import List
from ..models import Idea

def critic_agent(ideas: List[Idea]) -> List[Idea]:
    scored_ideas = []
    
    for idea in ideas:
        updated_idea = score_idea(idea)
        
        if updated_idea.novelty_score >= 40 and updated_idea.feasibility_score >= 40:
            scored_ideas.append(updated_idea)
    
    scored_ideas.sort(
        key=lambda x: x.novelty_score + x.feasibility_score,
        reverse=True
    )
    
    return scored_ideas

def score_idea(idea: Idea) -> Idea:
    base_novelty = idea.novelty_score
    base_feasibility = idea.feasibility_score
    
    novelty_adjustment = calculate_novelty_adjustment(idea)
    feasibility_adjustment = calculate_feasibility_adjustment(idea)
    
    final_novelty = min(100, max(0, base_novelty + novelty_adjustment))
    final_feasibility = min(100, max(0, base_feasibility + feasibility_adjustment))
    
    novelty_margin = calculate_margin(final_novelty, "novelty")
    feasibility_margin = calculate_margin(final_feasibility, "feasibility")
    
    idea.novelty_score = round(final_novelty)
    idea.novelty_score_range = f"{round(final_novelty)} ± {novelty_margin}"
    
    idea.feasibility_score = round(final_feasibility)
    idea.feasibility_score_range = f"{round(final_feasibility)} ± {feasibility_margin}"
    
    idea.confidence_level = determine_confidence_level(idea)
    
    return idea

def calculate_novelty_adjustment(idea: Idea) -> int:
    adjustment = 0
    
    if len(idea.citations) > 5:
        adjustment -= 10
    
    if "cross-disciplinary" in idea.title.lower() or "fusion" in idea.title.lower():
        adjustment += 15
    
    if len(idea.description) > 200:
        adjustment += 5
    
    adjustment += random.randint(-5, 5)
    
    return adjustment

def calculate_feasibility_adjustment(idea: Idea) -> int:
    adjustment = 0
    
    if len(idea.validation_plan) >= 3:
        adjustment += 10
    
    detailed_plan = sum(1 for step in idea.validation_plan if len(step) > 30)
    adjustment += detailed_plan * 5
    
    adjustment += random.randint(-5, 5)
    
    return adjustment

def calculate_margin(score: float, score_type: str) -> int:
    if score_type == "novelty":
        if score >= 80:
            return random.randint(3, 6)
        elif score >= 60:
            return random.randint(5, 10)
        else:
            return random.randint(8, 15)
    else:
        if score >= 80:
            return random.randint(3, 6)
        elif score >= 60:
            return random.randint(5, 10)
        else:
            return random.randint(8, 15)

def determine_confidence_level(idea: Idea) -> str:
    avg_score = (idea.novelty_score + idea.feasibility_score) / 2
    
    if "cross-disciplinary" in idea.title.lower():
        if idea.confidence_level == "low":
            return "low"
        else:
            return "medium"
    
    if avg_score >= 80:
        return "high"
    elif avg_score >= 60:
        return "medium"
    else:
        return "low"
