---
layout: page
title: Project
---

{% for post in site.posts %}
  {% if post.type== "project" %}
  * {{ post.date | date_to_string }} &raquo; [ {{ post.title }} ]({{ site.baseurl }}{{ post.url }})
  {% endif %}
{% endfor %}