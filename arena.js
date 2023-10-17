function parseMarkdown(text) {
	// Regex function to parse out markdown in my channel
	return text.replace(/\*\*(.*?)\*\*/g, '$1');
}

// Wrap everything in an onload
window.onload = async function() {
	const CHANNEL_ID = 'YOUR-CHANNEL-NAME';
	const ARENA_API_CHANNEL_URL = `https://api.are.na/v2/channels/${CHANNEL_ID}`;
	const ARENA_API_CONTENT_URL = `https://api.are.na/v2/channels/${CHANNEL_ID}/contents?&per=100&sort=position&direction=desc&page=`;
	
	const contentDiv = document.getElementById('blockspace');
	const template = document.getElementById('bookTemplate');

	// Get channel data
  async function fetchChannelData() {
		const response = await fetch(ARENA_API_CHANNEL_URL);
		if (!response.ok) {
			console.error(`Failed to fetch channel data: ${response.statusText}`);
			return null;
		}
		return await response.json();
	}

  
	async function fetchBooksPage(page) {
		const response = await fetch(`${ARENA_API_CONTENT_URL}${page}`);
		if (!response.ok) {
			console.error(`Failed to fetch page ${page}: ${response.statusText}`);
			return null;
		}
		return await response.json();
	}

	const channelData = await fetchChannelData();
	if (!channelData) {
		console.error('Failed to fetch the channel data');
		return;
	}

  // Calculate the number of pages required
	const totalBlocks = channelData.length;
	const perPage = 100;  // As per your original setting
	const totalPages = Math.ceil(totalBlocks / perPage);
	console.log(`Total pages: ${totalPages}`);

  // Loop through all the pages
	for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
		const pageData = await fetchBooksPage(currentPage);
		if (!pageData) {
			console.error(`Failed to fetch page ${currentPage}`);
			continue;
		}

    // Duplicate the template and append it to the page for each block
		pageData.contents.forEach(item => {
			if (item.class === 'Image') {
					const clone = document.importNode(template.content, true);
					clone.querySelector('.picture').src = item.image.original.url;
					clone.querySelector('.book-title').textContent = item.title || '';
					clone.querySelector('.book-description').textContent = item.description || '';
					contentDiv.appendChild(clone);
			}

			if (item.class === 'Text') {
					const year = document.createElement('div');
					year.classList.add('year-text');
					year.classList.add('fade-in');
					year.textContent = parseMarkdown(item.content);
					contentDiv.appendChild(year);
			}
		});
		
		// Apply the animation effect
		let delay = 1000;
			Array.from(contentDiv.childNodes).forEach(child => {
				if (child.nodeType === Node.ELEMENT_NODE) {
					setTimeout(() => {
							child.classList.add('visible');
					}, delay);
					delay += 50;
				}
			});
	}
};
