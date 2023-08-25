---
layout: post
title: What are embeddings?
description: Why are embeddings important for me as a Software Engineer and how they might help improve my search results
type: blog

tags: ["NLP"]
---

## What are embeddings
Understanding Natural language as mathematics aims are finding out ways to mathematically represent words or sentences
as numbers such that representation of words or sentences which have similar meaning are closer together than words further apart.
These days owing to neural networks and machine learning we're able to develop more and more complex methods to represent these numbers which helps us

I have used a simple and light model which can be run on everyday CPU to generate embeddings and showed how sentences which have similar meaning are closer together in space
<script src="https://gist.github.com/97harsh/806a6b6c7c65cc2aff997a44efaeec49.js"></script>


Point to note, for the mathematically more curious, the plot I'm projecting at the end is just a projection into 2D space done using UMAP. This method although robust has some assumptions which might or might not be met always, if you're curious here's a blog post on UMAP's website on how it really works <a href = "https://umap-learn.readthedocs.io/en/latest/how_umap_works.html" target="_blank">UMAP</a>
