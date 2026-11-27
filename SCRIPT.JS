const form = document.getElementById("recommendForm");
const submitButton = document.getElementById("submitButton");
const formMessage = document.getElementById("formMessage");
const resultsGrid = document.getElementById("resultsGrid");
const resultCount = document.getElementById("resultCount");
const resultsSubtitle = document.getElementById("resultsSubtitle");

const demoJobs = [
  {
    title: "Frontend Developer Intern",
    category: "Engineering",
    location: "Remote",
    skills: "HTML, CSS, JavaScript, React",
    skills_list: ["HTML", "CSS", "JavaScript", "React"],
    description: "Build responsive web interfaces and bring product designs to life.",
    experience: "Fresher",
    apply_url: "https://www.linkedin.com/jobs/"
  },
  {
    title: "Python Developer Intern",
    category: "Technology",
    location: "Indore",
    skills: "Python, Flask, SQL, REST APIs",
    skills_list: ["Python", "Flask", "SQL", "REST APIs"],
    description: "Help build and maintain Python applications, APIs, and database features.",
    experience: "0-1 years",
    apply_url: "https://www.linkedin.com/jobs/"
  },
  {
    title: "Data Analyst Intern",
    category: "AI & Data",
    location: "Remote",
    skills: "Python, SQL, Excel, pandas, visualization",
    skills_list: ["Python", "SQL", "Excel", "pandas", "Visualization"],
    description: "Explore datasets and turn business questions into useful insights.",
    experience: "Fresher",
    apply_url: "https://www.linkedin.com/jobs/"
  },
  {
    title: "UI/UX Design Intern",
    category: "Design",
    location: "Remote",
    skills: "Figma, wireframing, prototyping, user research",
    skills_list: ["Figma", "Wireframing", "Prototyping", "User research"],
    description: "Create clear user flows, wireframes, and interface prototypes.",
    experience: "Fresher",
    apply_url: "https://www.linkedin.com/jobs/"
  },
  {
    title: "QA Automation Intern",
    category: "Engineering",
    location: "Bhopal",
    skills: "Python, JavaScript, testing, debugging, Git",
    skills_list: ["Python", "JavaScript", "Testing", "Debugging", "Git"],
    description: "Write automated tests and help improve product quality.",
    experience: "Fresher",
    apply_url: "https://www.linkedin.com/jobs/"
  },
  {
    title: "DevOps Intern",
    category: "Cloud & DevOps",
    location: "Remote",
    skills: "Linux, Git, Docker, CI/CD, cloud",
    skills_list: ["Linux", "Git", "Docker", "CI/CD", "Cloud"],
    description: "Support build pipelines, deployments, and infrastructure automation.",
    experience: "Fresher",
    apply_url: "https://www.linkedin.com/jobs/"
  }
];

const icons = {
  "AI & Data": "⌘",
  "Engineering": "⌁",
  "Technology": "⌘",
  "Cloud & DevOps": "☁",
  "Design": "✳",
  "Security": "◇"
};

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

async function loadStats() {
  try {
    const response = await fetch("/api/stats");
    if (!response.ok) return;
    const stats = await response.json();
    document.getElementById("jobsStat").textContent = stats.jobs;
    document.getElementById("categoriesStat").textContent = stats.categories;
    document.getElementById("searchesStat").textContent = stats.searches;
  } catch (error) {
    console.warn("Could not load app statistics.", error);
  }
}

function renderJobs(jobs) {
  if (!jobs.length) {
    resultsGrid.innerHTML = `<div class="empty-state"><div class="empty-graphic"><span>⌕</span><i></i><b></b></div><strong>No matches found yet.</strong><p>Try adding more skills or using related terms, such as “data analysis” or “web development”.</p></div>`;
    return;
  }

  const cards = jobs.map((job, index) => {
    const skills = (job.skills_list || []).slice(0, 5)
      .map(skill => `<span class="skill-tag">${escapeHTML(skill)}</span>`).join("");
    const icon = icons[job.category] || "✳";
    const score = Math.max(0, Math.min(100, Number(job.match) || 0));
    return `
      <article class="job-card">
        <div class="job-card-top">
          <div class="job-icon">${icon}</div>
          <div class="job-title-wrap">
            <h3>${escapeHTML(job.title)}</h3>
            <div class="job-meta"><span>${escapeHTML(job.category)}</span><span>·</span><span>⌖ ${escapeHTML(job.location)}</span></div>
          </div>
          <div class="job-match">
            <span class="match-number">${score}%</span>
            <span class="match-label">SIMILARITY</span>
            <span class="match-track"><span class="match-fill" style="display:block;width:${score}%"></span></span>
          </div>
        </div>
        <p class="job-description">${escapeHTML(job.description)}</p>
        <div class="skill-list">${skills}</div>
        <div class="job-card-bottom">
          <span class="experience">${escapeHTML(job.experience || "Not specified")}</span>
          <a class="apply-link" href="${escapeHTML(job.apply_url)}" target="_blank" rel="noopener noreferrer">Explore jobs ↗</a>
        </div>
      </article>`;
  }).join("");

  resultsGrid.innerHTML = cards + `<p class="match-disclaimer">Match scores indicate text similarity between your profile and this demo catalogue. They are not a guarantee of hiring, eligibility, or job availability. Sample listings use a general job-search link; verify each opening before applying.</p>`;
}

function showDemoJobs(skills) {
  const terms = skills.toLowerCase().split(/[,;\s]+/).filter(term => term.length > 2);
  const jobs = demoJobs.map(job => {
    const searchableText = `${job.title} ${job.category} ${job.skills} ${job.description}`.toLowerCase();
    const matches = terms.filter(term => searchableText.includes(term)).length;
    return { ...job, match: Math.min(94, 62 + matches * 8) };
  }).sort((first, second) => second.match - first.match);

  renderJobs(jobs);
  resultCount.textContent = `${jobs.length} SAMPLE ROLES`;
  resultsSubtitle.textContent = skills.length
    ? "Showing sample opportunities while the recommendation service is unavailable."
    : "Showing sample opportunities. Add your skills to personalize your matches.";
  document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  formMessage.classList.remove("show");
  formMessage.textContent = "";

  const payload = {
    skills: document.getElementById("skills").value.trim(),
    education: document.getElementById("education").value,
    location: document.getElementById("location").value.trim()
  };

  if (payload.skills.length < 2) {
    showDemoJobs(payload.skills);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Finding matches...";
  resultCount.textContent = "ANALYZING";
  resultsSubtitle.textContent = "Comparing your profile against the job catalogue…";

  try {
    let response;
    try {
      response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      if (error instanceof TypeError) {
        showDemoJobs(payload.skills);
        return;
      }
      throw error;
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");

    renderJobs(data.recommendations || []);
    resultCount.textContent = `${data.count} ROLES RANKED`;
    resultsSubtitle.textContent = "Ranked by profile similarity and your location preference.";
    await loadStats();
    document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    formMessage.textContent = error.message || "Could not reach the recommendation server. Is Flask running?";
    formMessage.classList.add("show");
    resultCount.textContent = "REQUEST FAILED";
    resultsSubtitle.textContent = "Please check the form and try again.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Find my matches";
  }
});

document.getElementById("mobileMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(link => link.classList.remove("active"));
    item.classList.add("active");
    if (window.innerWidth <= 820) document.getElementById("sidebar").classList.remove("open");
  });
});

loadStats();