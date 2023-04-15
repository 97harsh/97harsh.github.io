---
layout: post
title: Solving simple problems with Linear Programming
description: This post is to demonstrate how to formulate the given problem into objectives and constraints with a problem that can be solved using linear programming
type: blog
meta_description: "Learn how to solve simple problems using linear programming by formulating objectives and constraints. This post provides an example problem that demonstrates the process of using linear programming to optimize solutions. Read on to discover more about this mathematical technique and how it can be applied to various problems."


tags: ["Route-Optimization"]
---


## TL;DR
This post is to demonstrate how to formulate the given problem into objectives and constraints with a problem that can be solved using linear programming

## Linear Programming
Linear programming (LP) is a mathematical optimization technique used to maximize or minimize a linear objective function subject to a set of linear constraints. It is a powerful tool for solving problems where the decision-maker seeks to allocate limited resources in the most effective and efficient way.

In a linear programming problem, the decision variables are linearly related to the objective function and the constraints. The objective function is a linear combination of the decision variables, and the constraints are linear inequalities or equalities that limit the values that the decision variables can take.

Linear programming has numerous practical applications in business, engineering, economics, and other fields. It is often used to optimize resource allocation, production planning, inventory management, transportation, and distribution problems.

### Solving a problem
Let's solve an example problem here:

Problem Statement: Question adapted from Introduction to Management Science By Stevenson and Ozgur <a href="https://www.amazon.com/Introduction-Management-Science-Spreadsheets-Student/dp/0073252905" target="_blank">link</a>

#### Problem statement
A furniture company produces a variety of products. One department specializes in wood tables, chairs, and bookcases. These are made using three resources labor, wood, and machine time. The department has 60 hours of labor available each day, 16 hours of machine time, and 400 board feet of wood. A consultant has developed a linear programming model for the department.

#### Constraints:

1. Time: 
    * Table: 2 hrs of labor & 0.8 hr machine time
    * Chair: 1 hr of labor & 0.6 hr machine time
    * Book Case: 2.5 hr of labor & 1 hr of machine time
2. Material Required:
    * 30 board feet of wood to make Table
    * 20 Board feet of wood to make a Chair
    * 50 Board feet of wood to make Book Case
3. Minimum Quantity:
    * minimum 3 table
    * minimum 3 chairs
    * minimum 3 Book Cases

#### Profit:
* \$40 per Table
* \$30 per Chair
* \$45 per bookcase


#### Formulating the problem:

x= quantity of tables

y= quantity of chairs

z= quantity of bookcases


#### Objective Function: 

Profit = 40*x1+30*x2+45*x3

Maximize the profit

#### Constraints:
* Labor: 2*x + 1*y + 2.5*z <= 60 Hours

* Machine: 0.8*z + 0.6*y + 1.0*z <= 16 Hours

* Wood: 30*x + 20*y + 30*z <= 400 board-feet

* Minumum quantity: x, y, z >= 3


Installing PuLP
```Bash 
!pip install pulp
```

Imports
<script src="https://gist.github.com/97harsh/8d7dcb416157007565db717c6f5cec10.js"></script>

Solving the problem
<script src="https://gist.github.com/97harsh/e49f3d3415644bd645d561aa845463a8.js"></script>


Summary:
There can be a lot of ways to solve problems when solving linear programming.

The Best practices:
* Least number of variables as possible
* More constraints the better
* Some problems might not have solutions. If your problem is unsolvable, try to loosen some constraints to test if the problem is with your code or with the problem formulation