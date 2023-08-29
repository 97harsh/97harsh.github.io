---
layout: post
title: Backend to finding new jobs
description: How to setup the tech to go and find newly published jobs for you, I used a combinatino of Dynamo DB and AWS Lambda to setup a process that goes and finds newly published jobs every few hours
type: blog

tags: ["New-Jobs"]
---

Since I am graduating this semester I asked myself, what is the best way to find jobs and also create a project to showcase my skills to hack at different tools and make them work

Below is the stack I'm using to currently fetch Jobs:
* AWS Lambda
* DynamoDB
* AWS SQS(simple Queing Service)
* Google Sheets API

I have a combination of two lambda functions running:

1. To Fetch new jobs every few hours and push them to DynamoDB

![Lambda Function 1](/assets/images/find_jobs_lambda_1.jpeg){:class="dynamic-width" data-width="300" title="Process Diagram of Lambda 1" alt="Picture showing Lambda 1 Process"}

2. To Fetch newly inserted rows in DynamoDB and push them to Google Sheets
![Lambda Function 2](/assets/images/find_jobs_lambda_2.jpeg){:class="dynamic-width" data-width="300" title="Process Diagram of Lambda 2" alt="Picture showing Lambda 2 Process"}


Next Steps:
1. To Add Experience to make it more relevant to people applying 
2. Add Top skills required by the Job, eg: Deep Learning, Scikit-learn