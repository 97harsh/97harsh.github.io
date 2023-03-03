---
layout: post
title: Reducing Transportation Costs with Fulfillment Center Location Optimization &#58; A Case Study
description: In this project that I worked on at Ola, we aimed to identify the optimal locations to place Self-Driving Cars (SDCs) to minimize transportation costs. We used mixed integer linear programming to solve this problem, setting constraints based on business requirements such as minimum fulfillment center size and personnel. We also cleaned and generated data on city locations, customer addresses, and rental costs for the optimization algorithm. Through our methods, we reduced total costs by 30% and decreased the distance between fulfillment centers and customers by half.

tags: ["Route Optimization"]
---

### TL;DR

In this project that I worked on at Ola, we aimed to identify the optimal locations to place Self-Driving Cars (SDCs) to minimize transportation costs. We used mixed integer linear programming to solve this problem, setting constraints based on business requirements such as minimum fulfillment center size and personnel. We also cleaned and generated data on city locations, customer addresses, and rental costs for the optimization algorithm. Through our methods, we reduced total costs by 30% and decreased the distance between fulfillment centers and customers by half.

### Introduction
The project aims to identify the optimal locations for placing SDCs (Scooter Delivery Centers) to minimize the total cost associated with transportation.

![Ola S1 pro scooter image](/assets/images/Ola Scooter S1 pro.webp){:class="post-images-class" title="Ola Scooter"}

### Problem statement:

The problem statement for this project was to identify optimal locations for self-driving cars (SDCs) to reduce the cost of transporting scooters from fulfillment centers to customers. The aim was to create a model that would help the business minimize transportation costs while ensuring that customers receive their orders on time.
The business had several constraints to consider while creating this model. For example, some fulfillment centers could only serve their state, while others could serve multiple states. Additionally, some states had low demand, and it was not feasible to have a fulfillment center in these states. The business also had constraints on the minimum size and personnel required in a fulfillment center, and only one SDC could serve a city. By considering these constraints, the model needed to provide the business with a feasible plan for the placement of SDCs that would optimize the overall cost of transportation.

### Methods:

The first step was data cleaning and generation. The team had to clean the addresses of cities because these were custom-filled and could have spelling mistakes. They could only take a city that has sold a scooter and some suggested locations from businesses for opening a fulfillment center, which resulted in 1000 cities/towns overall. The team took Google maps-based distances between the city center for the fulfillment center and the centroid of all orders coming from the town, or otherwise city centers, assuming that all these points are close enough to be considered a flat surface. We had the addresses of customers placing their orders, and we calculated latitude and longitude using Google APIs. Based on the vendor's rate chart, we estimated the rentals cost applicable for opening a fulfillment center for cities. For the towns where the vendor did not have a rate card, we distributed cities based on Tier-1,2,3 and took an average of rates provided. The team precomputed the distances between each town and all possible fulfillment centers, saving some computation by identifying the regions these cities lie in and not computing if the distance between states in which they lie is more than 1000 km, putting their distance as infinite.

The next step was problem formulation. The team could only suggest at a high level which city the SDC would be like and not the exact location. Not all states can have fulfillment centers, so we put a penalty variable. We had to approximate future demand based on current EV sales, pending orders, EV sales of all competitors, 2-wheeler sales, and All EV sales in India. The team created what it would look like if Ola started selling 30k scooters monthly. The goal was to minimize the overall cost of transportation, which included the first mile (factory to SDC), the last mile (SDC to customer), and the cost of renting fulfillment centers.

<!-- TODO: Add what is simplex algorithm here or as another blog post -->
<!-- Add Ola scooter images -->

To solve this problem, the team used mixed-integer linear programming. We used the simplex algorithm, which is a basic linear solver. If a solution exists, it exists on one of the extreme points (corners). The solver moves toward points with larger and larger values (like gradient descent, but it can only move along edges to the next extreme point). When driving along in this fashion, if it encounters an open border, the problem is infeasible (no solution). We added lower and upper bounds as constraining equations (e.g., if x>5, then instead, We added y=x-5). The team included several constraints from the business, such as some fulfillment centers can only serve their state, but it was not feasible for some of the other states, e.g., Northeastern states (very few orders). There was also a constraint on the minimum size of a fulfillment center (10,000 sq ft) and a restriction on the minimum personnel required in a fulfillment center (security guards, manager). Only one SDC can serve a city. The team assumed enough scooters would always be available to fulfill all locations' demands.

Finally, the team compared their results to other approaches We considered, such as weighted K-means clustering. However, it took much work to add these constraints. The team managed to reduce the current total cost from 3500 to 2700, i.e., by 30% and reduced the current 90th percentile distance between the fulfillment center to the customer from 200 km to 100 km. Overall, the mixed-integer linear programming approach with the simplex algorithm was an effective method for optimizing the placement of SDCs to reduce the total cost associated with transporting scooters.

### Results:

The approach reduced the total cost by 30% and reduced the distance between the fulfillment center and the customer. The project also included data cleaning and generation and precomputed the distances between each city and all possible fulfillment centers.

### Discussion:
Other approaches, such as Weighted K-means clustering, were considered but were not used due to difficulties in adding constraints. We approximated future demand based on current EV sales and other factors. Overall, the project successfully identified optimal SDC locations and reduced the total cost of transportation.
