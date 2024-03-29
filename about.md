---
layout: page
title: About
---


Thanks for being here


Hi, I am Harsh. 


I am currently doing my Master's in AI from Boston University. 


One particularly exciting project I'm working on looks at aggregating brain imaging data from different sources for individual patients. The goal is to build predictive models that can analyze these aggregated neurological images to detect conditions like Alzheimer's disease and chronic traumatic encephalopathy. While this is ambitious work, I'm using transformers and graph learning to account for missing data and identify the most salient features across modalities. This type of multimodal aggregation and analysis could someday unlock new insights into neurological disorders and personalized medicine, even in the face of missing data.

<img src="/assets/images/gtp_build_graph.png" alt="Building Graphs using images" style="border: 2px solid #000;">
Image Source: Graph Transformer(Yi et al.)


Prior to joining Boston University, I spent 3 years working in machine learning engineer roles where I wore many hats as both a data scientist and data engineer, building and deploying models while also migrating legacy systems. I took on whatever was needed to solve problems and deliver impact.


Some of the achievements from this experience that I'm most proud of include:

 * Consolidated siloed data sources into a unified database and built ETL pipeline at Ola Electric, <b>improving complaint resolution time by 40%</b>. Removed bottlenecks for agents by centralizing relevant complaint data.
 * Leading optimization efforts at Ola Electric that <b>reduced transportation costs by 30%</b> annually, around $6M in savings 
 * Built sales forecasting models at Fractal Analytics that achieved under 15% MAPE during COVID-19. Became the flagship product and expanded to handle all APAC forecasting based on model success, increasing sales through data-driven demand planning despite volatility. 
 * Improved data insertion speed by 50% for a client at Fractal Analytics by transitioning ETL pipelines to batched data aggregation. Migrated from legacy insertion approach to modular Python pipelines with batch loading, establishing more scalable data processing.


Across EV, fintech, and retail sectors, I leveraged my core data science and engineering skills to ship end-to-end machine learning solutions. This hands-on experience applying AI and data analytics to drive tangible business results gave me a strong foundation that motivates my current research at the intersection of healthcare and cutting-edge machine learning. I'm proud of my track record of tackling complex problems and delivering impact through a mix of data science, engineering, and cross-functional collaboration.

### Notable Projects:
<div class="projects-container">
  {% for project in site.data.projects %}
    <a href="{{ project.link }}" target="_blank" class="project-link">
      <div class="project">
        <img src="{{ project.image }}" alt="{{ project.title }}" />
        <div class="project-info">
          <div class="project-title">{{ project.title }}</div>
          <div class="project-description">{{ project.description }}</div>
        </div>
      </div>
    </a>
  {% endfor %}
</div>


Connect with me:


[harshsrharsh@gmail.com](mailto://harshsrharsh@gmail.com)

<a href="https://github.com/97harsh" target="_blank">Github</a>
<!-- [Github](https://github.com/97harsh) -->

<a href="https://www.linkedin.com/in/sharma-ai/" target="_blank">LinkedIn</a>


Thanks for reading !!

Also a mention to:

This theme is borrowed from https://github.com/poole/hyde 