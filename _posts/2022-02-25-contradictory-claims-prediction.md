---
layout: post
title: How Natural Language Processing Helps Detect Contradictory Claims in Medical Research during a Pandemic
date: 2023-02-25
categories: [Project, Opensource]
---

<div class="blog-post">
	<h2>How Natural Language Processing Helps Detect Contradictory Claims in Medical Research during a Pandemic</h2>
	<p class="blog-post-meta">Posted on Feb 25, 2023 by <a href="#">Harsh Sharma</a></p>
	<p>The COVID-19 pandemic has created an infodemic of research papers about the virus and its potential treatments. With so much new research being produced, it's hard for clinicians and researchers to keep up and determine what works and what doesn't. This is especially true when research papers contain contradictory claims about the efficacy or toxicity of a drug treatment. In this post, we'll discuss how natural language processing (NLP) can be used to automatically process large amounts of medical literature to detect contradictions in claims, which may help curators update databases that inform clinical practice and contextualize if a paper is part of a majority or minority opinion of certain claims.</p>
	<hr>
    Problem statement:
    During the peak of COVID-19, when a lot of research was coming out about different drugs that could potentially work, many contradictory claims were made. The challenge was to extract these claims from a large dataset of research papers and identify semantically similar claims for comparison.
    <br>
    Methods:
    To extract drug-related research claims, the team used a method developed by Achakulvisut et al. with the June 17 release of COVID-19 filtered texts in the CORD-19 subset of biomedical literature provided by Kaggle. Research claims were extracted from the title, abstract, and conclusion sections only, with a predetermined set of section names being normalized as conclusion sections. To create an annotated set of comparable drug-related research claims, the team created a set of annotator guidelines in collaboration with a team at Roam Analytics. They then sampled a set of 1000 claims pairs for gold standard annotation.
    <br>
    To detect contradictions, the team trained supervised models using a data regime of fine-tuning steps that were more domain- and task-specific. They used the Biomed-RoBERTa model fine-tuned on MedNLI, a corpus of pairs of contradictory/entailing/neutral sentences that are created based on clinicians’ synthetic premises based on hypotheses extracted from clinical notes in electronic medical records. They further fine-tuned the model using ManConCorpus, a corpus of research claims extracted from systematic reviews about specific topics in cardiovascular health. They also used negation detection and SBERT fine-tuned on MedNLI and ManConCorpus for claim similarity detection.
    <br>
    Results:
    The team was able to extract 1339 pairable claims from the dataset of COVID-19-related papers. They achieved precision/recall/F1 scores of 71%/56%/63% for claim extraction and 81%/38%/51% for contradiction detection. They found that the BlueBERT model fine-tuned on MedNLI showed the most promise for detecting contradictions, with a contradiction class F1 score of 45%. The team also manually annotated 500 pairs of claims related to COVID-19 therapeutics.
    <br>
    Discussion:
    The team's work shows that NLP can be a powerful tool for detecting contradictions in medical research, especially during a pandemic when research is being produced at an unprecedented rate. By identifying contradictory claims, researchers and clinicians can better understand what works and what doesn't, and curators can update databases to reflect the most accurate information. The team's approach also highlights the importance of domain-specific training data, as fine-tuning models on relevant datasets can greatly improve performance. In the future, this approach can be applied to other areas of medical research to help distill where differing opinions lie about the efficacy of treatments.
	<!-- Placeholder content for your blog post goes here -->
</div><!-- /.blog-post -->
