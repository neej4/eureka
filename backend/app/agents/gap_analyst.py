import hashlib
import json
from typing import List
from models import Paper, Cluster

def gap_analyst_agent(papers: List[Paper]) -> List[Cluster]:
    if not papers:
        return []
    
    paper_texts = [f"{p.title} {p.abstract}" for p in papers]
    
    keywords_clusters = identify_keywords(paper_texts)
    
    paper_keywords = assign_keywords_to_papers(paper_texts, keywords_clusters)
    
    clusters = []
    
    for cluster_name, keyword_list in keywords_clusters.items():
        cluster_papers = []
        for i, paper_kw in enumerate(paper_keywords):
            if any(kw in keyword_list for kw in paper_kw):
                if i < len(papers):
                    cluster_papers.append(papers[i].id)
        
        cluster_papers = list(set(cluster_papers))
        
        paper_count = len(cluster_papers)
        is_white_space = paper_count < 5
        
        cluster = Cluster(
            name=cluster_name,
            papers=cluster_papers,
            status="white_space" if is_white_space else "saturated",
            paper_count=paper_count
        )
        clusters.append(cluster)
    
    clusters.sort(key=lambda x: x.paper_count, reverse=True)
    
    if len(clusters) < 2:
        clusters.extend(create_default_clusters(papers))
    
    return clusters

def identify_keywords(texts: List[str]) -> dict:
    all_keywords = {}
    
    tech_keywords = [
        "machine learning", "deep learning", "neural network", "transformer",
        "language model", "LLM", "natural language", "NLP", "computer vision",
        "reinforcement learning", "supervised", "unsupervised", "semi-supervised",
        "generative", "foundation model", "attention", "BERT", "GPT", "diffusion"
    ]
    
    domain_keywords = [
        "healthcare", "medical", "diagnosis", "treatment", "patient",
        "finance", "banking", "trading", "risk", "fraud",
        "robotics", "autonomous", "navigation", "control",
        "science", "research", "discovery", "experiment",
        "education", "learning", "teaching", "student",
        "security", "privacy", "encryption", "defense"
    ]
    
    method_keywords = [
        "optimization", "training", "inference", "deployment",
        "scalability", "efficiency", "performance", "accuracy",
        "explainability", "interpretability", "transparency",
        "fairness", "bias", "robustness", "generalization"
    ]
    
    for keyword in tech_keywords:
        count = sum(1 for text in texts if keyword.lower() in text.lower())
        if count > 0:
            if "Technical Methods" not in all_keywords:
                all_keywords["Technical Methods"] = []
            all_keywords["Technical Methods"].append((keyword, count))
    
    for keyword in domain_keywords:
        count = sum(1 for text in texts if keyword.lower() in text.lower())
        if count > 0:
            if "Application Domains" not in all_keywords:
                all_keywords["Application Domains"] = []
            all_keywords["Application Domains"].append((keyword, count))
    
    for keyword in method_keywords:
        count = sum(1 for text in texts if keyword.lower() in text.lower())
        if count > 0:
            if "Research Methods" not in all_keywords:
                all_keywords["Research Methods"] = []
            all_keywords["Research Methods"].append((keyword, count))
    
    result = {}
    for category, items in all_keywords.items():
        sorted_items = sorted(items, key=lambda x: x[1], reverse=True)
        result[category] = [item[0] for item in sorted_items[:5]]
    
    return result

def assign_keywords_to_papers(texts: List[str], keywords_clusters: dict) -> List[List[str]]:
    paper_keywords = []
    
    for text in texts:
        text_lower = text.lower()
        paper_kw = []
        for category, keywords in keywords_clusters.items():
            for kw in keywords:
                if kw.lower() in text_lower:
                    paper_kw.append(kw)
        paper_keywords.append(paper_kw)
    
    return paper_keywords

def create_default_clusters(papers: List[Paper]) -> List[Cluster]:
    clusters = []
    
    mid = len(papers) // 2
    
    cluster1 = Cluster(
        name="Core Research",
        papers=[p.id for p in papers[:mid]],
        status="saturated",
        paper_count=mid
    )
    
    cluster2 = Cluster(
        name="Emerging Directions",
        papers=[p.id for p in papers[mid:]],
        status="white_space",
        paper_count=len(papers) - mid
    )
    
    clusters.extend([cluster1, cluster2])
    
    return clusters
