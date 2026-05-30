import random
from typing import List
from models import Idea, Paper

def coherence_validator_agent(ideas: List[Idea], papers: List[Paper]) -> List[Idea]:
    validated_ideas = []
    
    paper_ids = {p.id for p in papers}
    paper_urls = {p.url for p in papers}
    
    for idea in ideas:
        validated_idea = validate_idea_coherence(idea, paper_ids, paper_urls)
        validated_ideas.append(validated_idea)
    
    validated_ideas.sort(key=lambda x: x.coherence_score, reverse=True)
    
    return validated_ideas

def validate_idea_coherence(idea: Idea, valid_paper_ids: set, valid_paper_urls: set) -> Idea:
    issues = []
    
    citation_mismatch = check_citation_mismatch(idea, valid_paper_ids, valid_paper_urls)
    if citation_mismatch:
        issues.append(citation_mismatch)
    
    cluster_contradiction = check_cluster_contradiction(idea)
    if cluster_contradiction:
        issues.append(cluster_contradiction)
    
    logical_inconsistency = check_logical_inconsistency(idea)
    if logical_inconsistency:
        issues.append(logical_inconsistency)
    
    base_score = 100
    
    if citation_mismatch:
        base_score -= 20
    if cluster_contradiction:
        base_score -= 25
    if logical_inconsistency:
        base_score -= 15
    
    if not idea.citations:
        base_score -= 10
    
    if len(idea.validation_plan) < 3:
        base_score -= 5
    
    idea.coherence_score = max(0, base_score)
    
    return idea

def check_citation_mismatch(idea: Idea, valid_paper_ids: set, valid_paper_urls: set) -> str:
    if not idea.citations:
        return "No citations provided"
    
    invalid_citations = 0
    for citation in idea.citations:
        if citation not in valid_paper_urls:
            invalid_citations += 1
    
    if invalid_citations > len(idea.citations) / 2:
        return "citation_mismatch: Multiple citations not found in retrieved papers"
    
    return None

def check_cluster_contradiction(idea: Idea) -> str:
    title_lower = idea.title.lower()
    description_lower = idea.description.lower()
    
    saturated_keywords = ["saturated area", "overcrowded", "too many papers", "well-explored"]
    contradictory_statements = []
    
    for keyword in saturated_keywords:
        if keyword in title_lower or keyword in description_lower:
            contradictory_statements.append(keyword)
    
    if contradictory_statements:
        return f"cluster_contradiction: Idea mentions {contradictory_statements[0]} despite being in a white space"
    
    return None

def check_logical_inconsistency(idea: Idea) -> str:
    title_lower = idea.title.lower()
    description_lower = idea.description.lower()
    
    conflicting_pairs = [
        (["simple", "easy", "straightforward"], ["complex", "challenging", "difficult"]),
        (["fast", "quick", "rapid"], ["slow", "time-consuming", "gradual"]),
        (["high accuracy", "perfect", "100%"], ["uncertain", "approximate", "experimental"])
    ]
    
    for positive_keywords, negative_keywords in conflicting_pairs:
        has_positive = any(kw in title_lower or kw in description_lower for kw in positive_keywords)
        has_negative = any(kw in title_lower or kw in description_lower for kw in negative_keywords)
        
        if has_positive and has_negative:
            return "logical_inconsistency: Conflicting claims in title and description"
    
    if len(idea.validation_plan) > 0:
        if any("impossible" in step.lower() or "cannot" in step.lower() for step in idea.validation_plan):
            if "can be overcome" not in idea.description.lower():
                return "logical_inconsistency: Validation plan contains impossibility statements"
    
    return None
