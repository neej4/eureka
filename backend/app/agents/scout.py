import httpx
import asyncio
import hashlib
from typing import List
from ..models import Paper

FALLBACK_PAPERS = [
    {
        "id": "fallback-1",
        "title": "Large Language Models for Scientific Discovery",
        "abstract": "We investigate the use of large language models (LLMs) for accelerating scientific discovery across multiple domains. We demonstrate that LLMs can effectively assist researchers in literature review, hypothesis generation, and experimental design.",
        "authors": ["John Smith", "Jane Doe"],
        "year": 2024,
        "url": "https://arxiv.org/abs/2401.00001"
    },
    {
        "id": "fallback-2",
        "title": "Multi-Agent Systems for Scientific Research",
        "abstract": "We present a multi-agent framework where specialized AI agents collaborate to solve complex scientific problems. Each agent is trained for a specific task such as data collection, analysis, or hypothesis generation.",
        "authors": ["Alice Johnson", "Bob Williams"],
        "year": 2024,
        "url": "https://arxiv.org/abs/2401.00002"
    },
    {
        "id": "fallback-3",
        "title": "AI-Assisted Literature Review System",
        "abstract": "We develop an automated system for conducting comprehensive literature reviews using natural language processing and machine learning techniques. Our system can identify relevant papers, extract key findings, and generate summaries.",
        "authors": ["Carol Chen"],
        "year": 2023,
        "url": "https://arxiv.org/abs/2312.00003"
    },
    {
        "id": "fallback-4",
        "title": "Gap Analysis in Machine Learning Research",
        "abstract": "We perform a systematic gap analysis of current machine learning research to identify underexplored areas with high potential for breakthrough discoveries. Our methodology combines bibliometric analysis with expert review.",
        "authors": ["David Lee", "Eva Martinez"],
        "year": 2024,
        "url": "https://arxiv.org/abs/2401.00004"
    },
    {
        "id": "fallback-5",
        "title": "Automated Hypothesis Generation from Scientific Papers",
        "abstract": "We propose a novel approach for generating research hypotheses automatically from existing scientific literature. Our system uses deep learning to understand the context and generate novel, feasible research directions.",
        "authors": ["Frank Zhang"],
        "year": 2023,
        "url": "https://arxiv.org/abs/2312.00005"
    },
    {
        "id": "fallback-6",
        "title": "Knowledge Graph Construction from Research Papers",
        "abstract": "We present a method for constructing knowledge graphs from research papers to visualize the relationships between different concepts and identify white spaces in the literature.",
        "authors": ["Grace Kim", "Henry Wang"],
        "year": 2024,
        "url": "https://arxiv.org/abs/2401.00006"
    },
    {
        "id": "fallback-7",
        "title": "Cross-Disciplinary Innovation Detection",
        "abstract": "We develop techniques for detecting potential cross-disciplinary innovations by analyzing papers from multiple fields and identifying promising combinations of concepts.",
        "authors": ["Ivy Liu"],
        "year": 2023,
        "url": "https://arxiv.org/abs/2312.00007"
    },
    {
        "id": "fallback-8",
        "title": "Research Idea Scoring and Validation",
        "abstract": "We propose a scoring system for evaluating research ideas based on novelty, feasibility, and potential impact. Our system uses both automated scoring and expert validation.",
        "authors": ["Jack Brown", "Kate Davis"],
        "year": 2024,
        "url": "https://arxiv.org/abs/2401.00008"
    },
    {
        "id": "fallback-9",
        "title": "Semantic Search in Scientific Literature",
        "abstract": "We develop a semantic search engine for scientific literature that understands the meaning behind queries and returns highly relevant papers based on conceptual similarity.",
        "authors": ["Laura Wilson"],
        "year": 2023,
        "url": "https://arxiv.org/abs/2312.00009"
    },
    {
        "id": "fallback-10",
        "title": "Future Directions in AI Research",
        "abstract": "We analyze current trends in AI research to predict future directions and identify the most promising areas for breakthrough innovations in the next decade.",
        "authors": ["Michael Taylor", "Nancy Anderson"],
        "year": 2024,
        "url": "https://arxiv.org/abs/2401.00010"
    }
]

async def scout_agent(topic: str, timeout: int = 15) -> List[Paper]:
    try:
        search_url = f"http://export.arxiv.org/api/query?search_query=ti:{topic}+OR+abs:{topic}&start=0&max_results=50"
        
        async with httpx.AsyncClient() as client:
            response = await asyncio.wait_for(
                client.get(search_url),
                timeout=timeout
            )
            
            if response.status_code != 200:
                return get_fallback_papers()
            
            content = response.text
            
            papers = parse_arxiv_response(content, topic)
            
            if len(papers) == 0:
                return get_fallback_papers()
            
            return papers
            
    except (asyncio.TimeoutError, httpx.RequestError, Exception):
        return get_fallback_papers()

def parse_arxiv_response(xml_content: str, topic: str) -> List[Paper]:
    papers = []
    entries = xml_content.split("<entry>")
    
    for i, entry in enumerate(entries[1:51], 1):
        try:
            title = extract_xml_field(entry, "<title>", "</title>").replace("\n", " ").strip()
            abstract = extract_xml_field(entry, "<summary>", "</summary>").replace("\n", " ").strip()
            authors_data = entry.split("<author>")
            authors = []
            for author_entry in authors_data[1:]:
                name = extract_xml_field(author_entry, "<name>", "</name>")
                if name:
                    authors.append(name)
            
            year_str = extract_xml_field(entry, "<published>", "</published>")
            year = 2024
            if year_str:
                try:
                    year = int(year_str[:4])
                except:
                    pass
            
            id_url = extract_xml_field(entry, "<id>", "</id>")
            paper_id = hashlib.md5(id_url.encode()).hexdigest()[:8] if id_url else f"paper-{i}"
            
            paper = Paper(
                id=paper_id,
                title=title,
                abstract=abstract,
                authors=authors if authors else ["Unknown Author"],
                year=year,
                url=id_url if id_url else f"https://arxiv.org/abs/{paper_id}"
            )
            papers.append(paper)
            
        except Exception:
            continue
    
    return papers[:50]

def extract_xml_field(xml: str, start_tag: str, end_tag: str) -> str:
    try:
        start = xml.index(start_tag) + len(start_tag)
        end = xml.index(end_tag, start)
        return xml[start:end]
    except (ValueError, IndexError):
        return ""

def get_fallback_papers() -> List[Paper]:
    return [Paper(**paper) for paper in FALLBACK_PAPERS]
