const search = () => {
    // Get the search query from the input field
    const query = document.getElementById("search-input").value;
  
    // Define the Fuse.js options
    const options = {
      includeScore: true,
      keys: ["title", "excerpt", "content"]
    };
  
    // Search the Jekyll site data using Fuse.js
    const fuse = new Fuse({{ site.data.posts }}, options);
    const results = fuse.search(query);
  
    // Render the search results
    const searchResults = document.getElementById("search-results");
    searchResults.innerHTML = "";
  
    if (results.length > 0) {
      results.forEach((result) => {
        const item = result.item;
        const score = result.score;
  
        // Render the search result
        const resultElement = document.createElement("div");
        resultElement.innerHTML = `<h2>${item.title}</h2><p>${item.excerpt}</p>`;
        searchResults.appendChild(resultElement);
      });
    } else {
      // Render a message when there are no search results
      const noResultsElement = document.createElement("div");
      noResultsElement.innerText = "No results found.";
      searchResults.appendChild(noResultsElement);
    }
  };
  
  // Bind the search function to the input field
  document.getElementById("search-input").addEventListener("input", search);
  