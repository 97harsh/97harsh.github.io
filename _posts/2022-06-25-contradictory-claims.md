---
layout: post
title: Using Natural Language Processing to Detect Contradictory Claims in COVID-19 Research
description: This blog post describes a research project that aimed to automatically process a massive body of COVID-19 literature to detect contradictions in research claims related to drug treatments using natural language processing (NLP) and machine learning. The post details the steps taken to extract relevant claims from the CORD-19 dataset, identify sentences that could be compared, create an annotated set of similar drug-related research claims, and detect contradictions between pairs of papers. The post also discusses the models used, the results obtained, and potential use cases for the research findings.

tags: [NLP, Opensource]
---

How Natural Language Processing Helps Detect Contradictory Claims in Medical Research during a Pandemic

### TL;DR

This blog post describes a research project that aimed to automatically process a massive body of COVID-19 literature to detect contradictions in research claims related to drug treatments using natural language processing (NLP) and machine learning. The post details the steps taken to extract relevant claims from the CORD-19 dataset, identify sentences that could be compared, create an annotated set of similar drug-related research claims, and detect contradictions between pairs of papers. The post also discusses the models used, the results obtained, and potential use cases for the research findings.


### Introduction

The COVID-19 pandemic has created an infodemic of research papers about the virus and its potential treatments. With so much new research being produced, it's hard for clinicians and researchers to determine what works and what doesn't. This is especially true when research papers contain contradictory claims about the efficacy or toxicity of drug treatment. In this post, we'll discuss how natural language processing (NLP) can be used to process automatically large amounts of medical literature to detect contradictions in claims, which may help curators update databases that inform clinical practice and contextualize if a paper is part of a majority or minority opinion of specific claims.
<!-- add links to research on how we extracted the claims -->
<!-- add links to the repo we built -->
<!-- Add a link to CORD dataset -->
<!-- Add links to the analysis we did and some excerpts on what we uncovered -->
### Problem statement:

During the peak of COVID-19, when a lot of research was coming out about different drugs that could work, many contradictory claims were made. The challenge was to extract these claims from a large dataset of research papers and identify semantically similar claims for comparison.

### Methods:

To extract drug-related research claims, the team used a method developed by Achakulvisut et al. with the June 17 release of COVID-19 filtered texts in the CORD-19 subset of biomedical literature provided by Kaggle. Research claims were extracted from the title, abstract, and conclusion sections, with a predetermined set of section names normalized as conclusion sections. To create an annotated collection of similar drug-related research claims, the team created a set of annotator guidelines in collaboration with a team at Roam Analytics. They then sampled a set of 1000 claims pairs for gold standard annotation.

To detect contradictions, the team trained supervised models using a data regime of fine-tuning steps that were more domain- and task-specific. They used the Biomed-RoBERTa model fine-tuned on MedNLI, a corpus of pairs of contradictory/entailing/neutral sentences created based on clinicians' synthetic, with a predetermined set of section names notes in electronic medical records. They further fine-tuned the model using ManConCorpus, a corpus of research claims extracted from systematic reviews about specific topics in cardiovascular health. They also used negation detection, and SBERT fine-tuned on MedNLI and ManConCorpus for claim similarity detection.

### Results:

We extracted 1339 pairable claims from the dataset of COVID-19-related papers. They achieved precision/recall/F1 scores of 71%/56%/63% for claim extraction and 81%/38%/51% for contradiction detection. The BlueBERT model fine-tuned on MedNLI showed the most promise for detecting contradictions, with a contradiction class F1 score of 45%. The team also manually annotated 500 pairs of claims related to COVID-19 therapeutics.

### Discussion:
We show that NLP can be a powerful tool for detecting contradictions in medical research, especially during a pandemic when research is being produced at an unprecedented rate. By identifying contradictory claims, researchers and clinicians can better understand what works and what doesn't. Curators can update databases to reflect the most accurate information. The team's approach also highlights the importance of domain-specific training data, as fine-tuning models on relevant datasets can significantly improve performance. In the future, this approach can be applied to other areas of medical research to help distill where differing opinions lie about the efficacy of treatments.
