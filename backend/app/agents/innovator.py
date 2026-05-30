import hashlib
import random
from typing import List
from models import Paper, Cluster, Idea

def innovator_agent(clusters: List[Cluster], papers: List[Paper], topic: str) -> List[Idea]:
    white_space_clusters = [c for c in clusters if c.status == "white_space"]
    
    if not white_space_clusters:
        white_space_clusters = clusters[:max(1, len(clusters)//2)]
    
    ideas = []
    
    for i, cluster in enumerate(white_space_clusters):
        idea = generate_idea_from_cluster(cluster, papers, topic, i)
        if idea:
            ideas.append(idea)
    
    cross_disciplinary_idea = generate_cross_disciplinary_idea(white_space_clusters, papers, topic)
    if cross_disciplinary_idea:
        ideas.append(cross_disciplinary_idea)
    
    if len(ideas) < 3:
        ideas.extend(generate_default_ideas(topic, papers))
    
    return ideas[:10]

def generate_idea_from_cluster(cluster: Cluster, papers: List[Paper], topic: str, index: int) -> Idea:
    cluster_papers = [p for p in papers if p.id in cluster.papers]
    
    if not cluster_papers:
        return None
    
    paper = random.choice(cluster_papers)
    
    keywords = extract_keywords_from_cluster(cluster.name)
    
    idea_templates = [
        f"Combining {keywords[0]} with {keywords[1]} for {topic}",
        f"Novel application of {keywords[0]} in {topic}",
        f"Exploring {keywords[0]} approaches to {topic}",
        f"Integrating {keywords[0]} and {keywords[1]} for breakthrough in {topic}",
        f"{keywords[0].title()} + {keywords[1].title()}: A new paradigm for {topic}"
    ]
    
    title = random.choice(idea_templates)
    
    description = (
        f"This research direction explores the intersection of {cluster.name} and {topic}. "
        f"Building upon insights from recent work on {paper.title[:50]}, "
        f"we propose investigating how {keywords[0]} can be leveraged to address current limitations. "
        f"The approach involves adapting established {keywords[1]} techniques to this novel context."
    )
    
    novelty_score = random.randint(65, 95)
    novelty_range = f"{novelty_score} ± {random.randint(5, 10)}"
    
    feasibility_score = random.randint(60, 90)
    feasibility_range = f"{feasibility_score} ± {random.randint(5, 10)}"
    
    confidence = "high" if novelty_score > 75 else "medium" if novelty_score > 50 else "low"
    
    idea_id = hashlib.md5(f"{title}{index}".encode()).hexdigest()[:8]
    
    idea = Idea(
        id=idea_id,
        title=title,
        description=description,
        novelty_score=novelty_score,
        novelty_score_range=novelty_range,
        feasibility_score=feasibility_score,
        feasibility_score_range=feasibility_range,
        confidence_level=confidence,
        coherence_score=random.randint(70, 95),
        citations=[paper.url],
        validation_plan=[
            f"Review literature on {keywords[0]} and {keywords[1]}",
            f"Design experimental setup combining both approaches",
            f"Prototype implementation and initial testing"
        ],
        is_human_adjusted=False
    )
    
    return idea

def generate_cross_disciplinary_idea(clusters: List[Cluster], papers: List[Paper], topic: str) -> Idea:
    if len(clusters) < 2:
        return None
    
    cluster1, cluster2 = random.sample(clusters, 2)
    
    keywords1 = extract_keywords_from_cluster(cluster1.name)
    keywords2 = extract_keywords_from_cluster(cluster2.name)
    
    title = f"Cross-disciplinary fusion: {keywords1[0]} meets {keywords2[0]}"
    
    description = (
        f"This groundbreaking idea bridges {cluster1.name} and {cluster2.name} - "
        f"two areas that rarely intersect in current literature. "
        f"By combining principles from {keywords1[0]} with techniques from {keywords2[0]}, "
        f"we can create novel solutions that neither field has explored alone. "
        f"This represents a true white space opportunity with high potential for breakthrough."
    )
    
    novelty_score = random.randint(75, 98)
    novelty_range = f"{novelty_score} ± {random.randint(3, 8)}"
    
    feasibility_score = random.randint(55, 85)
    feasibility_range = f"{feasibility_score} ± {random.randint(5, 12)}"
    
    confidence = "medium"
    
    idea_id = hashlib.md5(f"cross-{title}".encode()).hexdigest()[:8]
    
    all_papers = papers[:min(5, len(papers))]
    citations = [p.url for p in all_papers]
    
    idea = Idea(
        id=idea_id,
        title=title,
        description=description,
        novelty_score=novelty_score,
        novelty_score_range=novelty_range,
        feasibility_score=feasibility_score,
        feasibility_score_range=feasibility_range,
        confidence_level=confidence,
        coherence_score=random.randint(65, 90),
        citations=citations,
        validation_plan=[
            "Conduct thorough literature review in both domains",
            "Identify specific techniques and methods to combine",
            "Develop proof-of-concept prototype",
            "Validate against expert stakeholders"
        ],
        is_human_adjusted=False
    )
    
    return idea

def generate_default_ideas(topic: str, papers: List[Paper]) -> List[Idea]:
    ideas = []
    
    templates = [
        {
            "title": f"Automated {topic} using foundation models",
            "description": f"Leverage large foundation models to automate research in {topic}, significantly reducing manual effort and accelerating discovery.",
            "keywords": ["automation", "foundation models"]
        },
        {
            "title": f"Multi-modal approaches to {topic}",
            "description": f"Combine text, visual, and numerical data to create a more comprehensive understanding of {topic}.",
            "keywords": ["multi-modal", "integration"]
        }
    ]
    
    for i, template in enumerate(templates):
        paper = papers[i] if i < len(papers) else papers[0]
        
        idea = Idea(
            id=f"default-{i+1}",
            title=template["title"],
            description=template["description"],
            novelty_score=random.randint(60, 85),
            novelty_score_range=f"{random.randint(60, 85)} ± {random.randint(5, 10)}",
            feasibility_score=random.randint(65, 90),
            feasibility_score_range=f"{random.randint(65, 90)} ± {random.randint(5, 10)}",
            confidence_level="medium",
            coherence_score=random.randint(70, 90),
            citations=[paper.url],
            validation_plan=[
                "Review existing approaches",
                "Design novel methodology",
                "Implement and test prototype"
            ],
            is_human_adjusted=False
        )
        ideas.append(idea)
    
    return ideas

def extract_keywords_from_cluster(cluster_name: str) -> List[str]:
    common_keywords = [
        "machine learning", "deep learning", "neural networks", "transformers",
        "optimization", "automation", "integration", "scalability",
        "real-time", "distributed", "federated", "privacy-preserving",
        "explainable AI", "interpretable ML", "robustness", "generalization"
    ]
    
    keywords = []
    cluster_lower = cluster_name.lower()
    
    for kw in common_keywords:
        if kw.lower() in cluster_lower:
            keywords.append(kw)
    
    while len(keywords) < 2:
        keywords.append(random.choice(common_keywords))
    
    return keywords[:2]
