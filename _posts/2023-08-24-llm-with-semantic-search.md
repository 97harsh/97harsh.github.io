---
layout: post
title: Learnings from LLM with Semantic Search
description: What I learnt while reading about LLM with semantic search in terms of theory and practical aspects
type: blog

tags: ["NLP"]
---

## How to find top results
**Cascade Retrieval**

There are two stages of Query execution, Retreival phase and Reranking phase, this two staged approach is often used to balance efficiency and effectiveness

**Retrieval Stage**: In this stage, a fast and approximate method is used to retrieve a broad set of potentially relevant documents from a large corpus. This is often done using techniques like inverted indexing, BM25, or other efficient retrieval methods. The goal is to quickly narrow down the vast number of documents to a smaller, manageable set that likely contains the relevant documents.

**Reranking Stage**: Given the subset of documents from the first stage, more computationally intensive and sophisticated models, often deep learning-based models like BERT, are used to rerank the documents to improve the precision of the top results. The idea is to refine the results, ensuring that the most relevant documents are ranked at the top.


![How query is executed](/assets/images/how_query_works.jpeg){:class="post-images-class" title="Execution of a Query" alt="Picture showing how query is solved to find result"}

## Simplest Search using Keywords
How to rank results?
We'll use a concept called as BM25, similar to <a href = "https://en.wikipedia.org/wiki/Tf%E2%80%93idf" target="_blank">TF-IDF</a>, it is a probabilistic-based ranking function that ranks a set of documents based on the query terms appearing in each document, irrespective of the inter-relationship between the query terms themselves. It's particularly effective because it considers both term frequency and inverse document frequency, adjusting for document length.


### Inverted Index
To speed up the BM25 based keyword search, a popular method used is to index all the keywords along with the keywords being used. For every keyword in the document the document IDs where the word appears is stored; which helps in fast lookup of the words, sort of like condensing the words into a more easily searchable format

<!-- ![How query is executed](/assets/images/inverted_index.jpeg){:class="post-images-class" title="Inverted Index Example" alt="Picture showing how inverted index has keywords along with document ID"} -->
<img src="/assets/images/inverted_index.jpeg" alt="Picture showing how inverted index has keywords along with document ID" title="Inverted Index Example" width="300" height="200">



### Limitations
1. What happens if input and output do not share common keywords?
* Query: Pain in head
* Result: How to cure Headache
2. Lack of semantic understanding
* Apple pie vs Apple, Inc. difference
3. Not designed for long documents
* It might not capture the nuance of term importance in long texts

## In Progress

