---
layout: post
title: Automating My Job Search with AWS Lambda, DynamoDB and Google Sheets
description: I built an automated job search assistant using AWS serverless services to streamline my upcoming job hunt as a new grad. This project leverages Lambda, DynamoDB, SQS, and Google Sheets to continuously find and collate relevant job listings tailored to my skills. The end-to-end pipeline scrapes opportunities, dedupes listings, and populates a shareable spreadsheet to easily track applications. I detail the implementation, challenges faced, and future enhancements like intelligent filtering and automated resume customization. This serves both as a guide for others to create similar projects and a demonstration of my hands-on engineering skills.
type: blog

tags: ["New-Jobs"]
---

## Elaborating on the goal
As a computer science student preparing to graduate soon, I wanted to build a system to automatically find and track relevant job openings tailored to my skills and interests. The main goal was to create an automated pipeline that would continuously scrape job sites for opportunities and collate them in a centralized location so I can easily track applications and deadlines.

## Explaining the tech stack
I decided to use AWS Lambda functions for the scraper logic since it allows running code on a schedule without managing servers. DynamoDB provides a fast and scalable datastore for capturing job listings as they are found. I'm using SQS queues to efficiently pass data between the Lambda functions. Finally, the collated job listings are populated into a Google Sheet using the Sheets API for a clean and shareable output.

To Summarize:
* AWS Lambda
* DynamoDB
* AWS SQS(simple Queing Service)
* Google Sheets API

I have a combination of two lambda functions running:

* To Fetch new jobs every few hours and push them to DynamoDB
![Lambda Function 1](/assets/images/find_jobs_lambda_1.jpeg){:class="dynamic-width" data-width="600" title="Process Diagram of Lambda 1" alt="Picture showing Lambda 1 Process"}

* To Fetch newly inserted rows in DynamoDB and push them to Google Sheets
![Lambda Function 2](/assets/images/find_jobs_lambda_2.jpeg){:class="dynamic-width" data-width="600" title="Process Diagram of Lambda 2" alt="Picture showing Lambda 2 Process"}

Link to the Jobs being found: 
(<a href = "{{site.url}}/2023/08/29/job-links/" target="_blank">Staying on Top of the Job Hunt with a Serverless Job Listings Tracker</a>)

Next Steps:
1. To Add Experience to make it more relevant to people applying 
2. Add Top skills required by the Job, eg: Deep Learning, Scikit-learn