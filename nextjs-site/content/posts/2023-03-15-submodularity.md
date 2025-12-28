---
layout: post
title: What is submodularity
description: Submodularity is a term used to describe the concept of diminishing returns. Adding more agents will not give a proportionally high yield if you have a submodular system. E.g., In parallel processing, using two threads would not make the system 2x as fast, or using 10x the threads does not make the system as fast.
type: blog
meta_description: "Discover the concept of submodularity and how it relates to diminishing returns. This post explains the meaning of submodularity and provides examples of how it applies in different contexts, such as parallel processing. Read on to learn more about this important concept and its implications."


tags: ["Route-Optimization"]
---

#### TL;DR
Submodularity is a term used to describe the concept of diminishing returns. Adding more agents will not give a proportionally high yield if you have a submodular system. E.g., In parallel processing, using two threads would not make the system 2x as fast, or using 10x the threads does not make the system as fast.

#### What is Submodularity?

Submodularity is a mathematical property that describes the behavior of set functions. A set function is a function that takes a set of elements as input and returns an actual number as output. Submodularity is a property of set functions that captures the notion of diminishing returns.

More formally, a set function $f: 2^V \rightarrow \mathbb{R}$ is submodular if it satisfies the following property:


f(A∪{x})−f(A)≥f(B∪{x})−f(B)

for all $A \subseteq B \subseteq V$ and $x \in V \setminus B$. This property states that the marginal gain of adding an element to a smaller set is greater than or equal to the marginal gain of adding the same element to a larger set.

Intuitively, this means that the more elements we have already added to a set, the less value we get from adding additional components. This property is often referred to as the "diminishing returns" property.


#### Examples of Submodular and Non-Submodular Functions

##### Example 1: Toy Collection

Suppose you are a 10-year-old child who collects toys. You have a specific budget to buy toys, each with a different value. Suppose you have three toys in mind: a teddy bear, a toy car, and a puzzle. Your goal is to maximize the total value of the toys you buy.

In this case, the value of a set of toys can be expressed as the sum of the individual values of the toys in the collection. This function is submodular because adding a toy to a smaller set gives a more significant value increase than adding the toy to a more extensive set that already contains the smaller group. For example, adding the teddy bear to a collection containing only the toy car gives a more significant increase in value than adding the same teddy bear to a set containing both the toy car and the puzzle.

##### Example 2: Facility location

Suppose you are a company that wants to open a set of facilities in a city to maximize the number of customers served. Let's define a set function f that takes a subset of locations and returns the number of customers the selected areas do. If the number of customers a site serves depends on the distance to the other places, then the set function f is non-submodular. Adding a location to a smaller set may or may not increase the number of customers served more than adding the exact location to a more extensive collection.

Read about my project on Identifying Fulfillment Centers at Ola: <a href = "{{ site.baseurl}}/2023/02/26/route-optimization/" target="_blank">link</a>

##### Example 3: Image segmentation

Suppose you have an image and want to segment it into regions to maximize the quality of the segmentation. Let's define a set function f that takes a subset of pixels and returns the quality of the segmentation. If the segmentation quality depends on the spatial arrangement of the pixels, then the set function f is non-submodular. This is because adding a pixel to a smaller set may or may not improve the quality of the segmentation more than adding the same pixel to a more extensive collection.


##### Example 4: Graph Cut
Now, let's consider a more advanced example from computer vision. Suppose you are given an image, and your goal is to segment the image into two regions: the foreground and the background. One way to do this is by using graph cuts, a popular image segmentation algorithm.

In this case, the value of a set of pixels is defined as the sum of the weights of the edges that connect the pixels within the background to those outside the location. This function is also submodular because adding a pixel to a smaller set gives a more significant increase in value than adding the same pixel to a more extensive collection that already contains the smaller group. For example, adding a pixel to the foreground gives a more significant increase in value if the pixel is near the boundary between the foreground and the background than if it is deep inside the foreground.


#### Examples of non-submodular functions

In contrast, non-submodular functions don't exhibit diminishing returns. One example is the function that calculates the area of a rectangle. Increase the length or width of a rectangle by a certain amount. The increase in place will be constant, regardless of the initial size of the rectangle.

