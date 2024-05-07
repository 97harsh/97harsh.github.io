---
layout: post
title: Deploying simple webcam based classifier
description: Deploying webcam based classifier; written in Node Js. The model is relatively light and trains on the browser. Checkout the app here: <a href = "https://tfjs-2-classification.vercel.app" target="_blank">Vercel App</a>. 
type: blog

tags: ["Computer-Vision"]
---

## TL; DR
Deploying Tensorflow TJ apps on Vercel. Here's the link to the app: <a href = "https://tfjs-2-classification.vercel.app" target="_blank">Vercel App</a>.
Link to the Github: <a href = "https://github.com/97harsh/TFJS-Webcam-Classification" target="_blank">Github Repo</a>.


I have found client side ML quite interesting more recently, trying to get some projects in the space as cost of compute increases. Here's a project I did to get hands on with Tensorflow JS. The project simply trains images that you show on the webcam and tries to classify the images after training the model in the browser. The training is relatively quick( Under 1 minute) if you don't pass a lot of images.

Tech Stack:
1. Tensorflow.js: Train model, fetch pretrained MobileNet_V3 model
2. Express.js: To deploy with Node js
3. Vercel: To deploy for free


