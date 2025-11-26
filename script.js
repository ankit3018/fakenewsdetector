//firebase code

const firebaseConfig = {
    apiKey: "AIzaSyD_Ly-2T4AnIVhaCTB0dSyI1-gith_J1yk",
    authDomain: "fakenewsdetector-8b8a5.firebaseapp.com",
    projectId: "fakenewsdetector-8b8a5",
    storageBucket: "fakenewsdetector-8b8a5.firebasestorage.app",
    messagingSenderId: "613917087088",
    appId: "1:613917087088:web:5ea73a5f837d184cfd6bb5",
    measurementId: "G-JLV1E36MH3"
  };




const sampleResults = [
  {
    type: 'fake',
    icon: '❌',
    title: 'Likely False Information',
    description: 'Our analysis indicates this claim contains misleading or false information. Multiple fact-checking sources contradict the main assertions.',
    confidence: 87,
    confidenceLabel: 'Confidence: 87% False',
    facts: [
      { status: 'false', label: 'False Claim', text: 'The headline contains exaggerated statistics not supported by official data' },
      { status: 'false', label: 'Misleading Context', text: 'Key information is presented out of context to support a false narrative' },
      { status: 'unverified', label: 'Unverified Source', text: 'The original source cited has no credible verification or track record' }
    ],
    sources: [
      { icon: '📰', name: 'Reuters Fact Check', description: 'Debunked similar claims with official government data' },
      { icon: '✓', name: 'Snopes.com', description: 'Rated as "False" - comprehensive fact-check available' },
      { icon: '🔬', name: 'AP News Fact Check', description: 'Verified the actual statistics contradict this claim' }
    ]
  },
  {
    type: 'real',
    icon: '✅',
    title: 'Verified Information',
    description: 'This information appears credible and is corroborated by multiple reliable sources. The facts align with verified reports from established news organizations.',
    confidence: 92,
    confidenceLabel: 'Confidence: 92% Accurate',
    facts: [
      { status: 'true', label: 'Verified Facts', text: 'Core claims match reports from multiple reputable news agencies' },
      { status: 'true', label: 'Credible Sources', text: 'Information originates from established, trustworthy news organizations' },
      { status: 'true', label: 'Cross-Referenced', text: 'Details confirmed across independent fact-checking platforms' }
    ],
    sources: [
      { icon: '📰', name: 'BBC News', description: 'Published comprehensive coverage with verified details' },
      { icon: '🌐', name: 'Associated Press', description: 'Confirmed key facts through independent reporting' },
      { icon: '📊', name: 'Reuters', description: 'Corroborated information with official sources' }
    ]
  },
  {
    type: 'mixed',
    icon: '⚠️',
    title: 'Partially Accurate',
    description: 'This content contains a mix of accurate and misleading information. Some facts are verified while others lack proper context or are exaggerated.',
    confidence: 65,
    confidenceLabel: 'Confidence: 65% Mixed Accuracy',
    facts: [
      { status: 'true', label: 'Accurate Element', text: 'The basic event or occurrence is confirmed by reliable sources' },
      { status: 'false', label: 'Exaggerated Details', text: 'Specific numbers and impacts are inflated beyond verified reports' },
      { status: 'unverified', label: 'Missing Context', text: 'Important contextual information is omitted, creating misleading impression' }
    ],
    sources: [
      { icon: '📰', name: 'The Guardian', description: 'Reported on the event with more balanced context' },
      { icon: '✓', name: 'FactCheck.org', description: 'Rated as "Mixture" - some truth, some exaggeration' },
      { icon: '📊', name: 'PolitiFact', description: 'Provided detailed analysis of accurate vs misleading elements' }
    ]
  }
];

function displayResults(result, inputText) {
  document.getElementById('submitted-text').textContent = inputText;
  
  const verdictCard = document.getElementById('verdict-card');
  verdictCard.className = `verdict-card ${result.type}`;
  
  document.getElementById('verdict-icon').textContent = result.icon;
  document.getElementById('verdict-title').textContent = result.title;
  document.getElementById('verdict-description').textContent = result.description;
  document.getElementById('confidence-label').textContent = result.confidenceLabel;
  
  const confidenceFill = document.getElementById('confidence-fill');
  confidenceFill.style.width = '0%';
  setTimeout(() => {
    confidenceFill.style.width = result.confidence + '%';
  }, 100);

  const factsContainer = document.getElementById('facts-container');
  factsContainer.innerHTML = '';
  result.facts.forEach(fact => {
    const factItem = document.createElement('div');
    factItem.className = `fact-item ${fact.status}`;
    factItem.innerHTML = `
      <div class="fact-label">${fact.label}</div>
      <p class="fact-text">${fact.text}</p>
    `;
    factsContainer.appendChild(factItem);
  });

  const sourcesContainer = document.getElementById('sources-container');
  sourcesContainer.innerHTML = '';
  result.sources.forEach(source => {
    const sourceItem = document.createElement('div');
    sourceItem.className = 'source-item';
    sourceItem.innerHTML = `
      <span class="source-icon">${source.icon}</span>
      <div class="source-content">
        <div class="source-name">${source.name}</div>
        <p class="source-description">${source.description}</p>
      </div>
    `;
    sourcesContainer.appendChild(sourceItem);
  });

  document.getElementById('results-container').classList.add('show');
  
  setTimeout(() => {
    document.getElementById('results-container').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }, 100);
}

document.getElementById('analyze-btn').addEventListener('click', function(e) {
  e.preventDefault();
  
  const input = document.getElementById('news-input').value.trim();
  const btn = document.getElementById('analyze-btn');
  const resultsContainer = document.getElementById('results-container');

  if (!input) {
    return;
  }

  btn.classList.add('loading');
  resultsContainer.classList.remove('show');

  setTimeout(() => {
    const randomResult = sampleResults[Math.floor(Math.random() * sampleResults.length)];
    displayResults(randomResult, input);
    btn.classList.remove('loading');
  }, 2500);
});
