---
layout: page
title: Blogs
---

{% for post in site.posts %}
  {% if post.type== "blog" %}
  * {{ post.date | date_to_string }} &raquo; [ {{ post.title }} ]({{ site.baseurl }}{{ post.url }})
  {% endif %}
{% endfor %}
