---
layout: post
title: Image Classification with Cifar 10
description: This post shows how to create a Convolution neural network to classify images in Cifar 10. It also highlights what worked and what didn't when building this network.
type: project

tags: ["Computer-Vision"]
---

### TL;DR

What worked:
* Deep networks: Yes but too Deep network leads to overfitting and taking very long to train
* Wider networks: Yes, try to make your networks Deeper in the middle as more and more information is captured in those layers
* Learning Rate: Try starting to train with a small learning rate(1e-5), if training is too slow, you can experiment with increasing learning rates
* Monitor Validation Metric: Helps to identify if network is underfitted or overfitted


### Training the network


<script src="https://gist.github.com/97harsh/0818e110cbbf068cf128e56dadf07d36.js"></script>