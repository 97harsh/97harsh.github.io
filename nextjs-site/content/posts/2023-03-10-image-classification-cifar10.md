---
layout: post
title: Image Classification with Cifar 10
description: This post shows how to create a Convolution neural network to classify images in Cifar 10. It also highlights what worked and what didn't when building this network.
type: project
meta_description: "Learn how to create a convolutional neural network to classify images in Cifar 10 and discover what worked and what didn't when building this network. Read this post to find out more about the process and techniques used in this computer vision project."


tags: ["Computer-Vision"]
---

### TL;DR

What worked:
* Deeper networks: Yes, but too Deep a network leads to overfitting and taking very long to train
* Wider networks: Yes, try to make your networks Deeper in the middle as more and more information is captured in those layers
* Learning Rate: Try starting to train with a small learning rate(1e-5). If training is too slow, you can experiment with increasing learning rates
* Monitor Validation Metric: Helps to identify if the network is under-fitted or overfitted

### Cifar 10 Description:
Given an image, classify it into one of the 10 classes

### Input
Image with 3 channels(R,G,B)

### Output
Cifar 10 classes:
Airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck



### Created Network

|Layer (type:depth-idx)| Output Shape| Param #|
|---|---|---|
|Conv2d: 1-1| [-1, 64, 32, 32]| 1,792|
|BatchNorm2d: 1-2|     [-1, 64, 32, 32]| 128|
| ReLU: 1-3|   [-1, 64, 32, 32]| --|
| MaxPool2d: 1-4|       [-1, 64, 16, 16]| --|
| Conv2d: 1-5| [-1, 128, 16, 16]|         73,856|
| BatchNorm2d: 1-6|     [-1, 128, 16, 16]|         256|
| ReLU: 1-7|   [-1, 128, 16, 16]|         --|
| Conv2d: 1-8| [-1, 256, 16, 16]|         295,168|
| BatchNorm2d: 1-9|     [-1, 256, 16, 16]|         512|
| ReLU: 1-10|  [-1, 256, 16, 16]|         --|
| MaxPool2d: 1-11|      [-1, 256, 8, 8]|  --|
| Conv2d: 1-12|         [-1, 256, 8, 8]|  590,080|
| BatchNorm2d: 1-13|    [-1, 256, 8, 8]|  512|
| ReLU: 1-14|  [-1, 256, 8, 8]|  --|
| Conv2d: 1-15|         [-1, 256, 6, 6]|  590,080|
| BatchNorm2d: 1-16|    [-1, 256, 6, 6]|  512|
| ReLU: 1-17|  [-1, 256, 6, 6]|  --|
| MaxPool2d: 1-18|      [-1, 256, 3, 3]|  --|
| Conv2d: 1-19|         [-1, 256, 1, 1]|  590,080|
| ReLU: 1-20|  [-1, 256, 1, 1]|  --|
|Linear: 2-1|     [-1, 256]|        65,792|
|ReLU: 2-2|       [-1, 256]|        --|
| Dropout: 1-22|        [-1, 256]|        --|
| Linear: 1-23|         [-1, 10]|         2,570|




### Code


<script src="https://gist.github.com/97harsh/0818e110cbbf068cf128e56dadf07d36.js"></script>