(() => {
  const target = document.getElementById("chapterContent");
  const toc = document.getElementById("chapterToc");
  if (!target || !toc) return;
  const escapeHTML = value => value.replace(/[&<>"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
  const inline = value => {
    let safe = escapeHTML(value);
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\*(.+?)\*/g, "<em>$1</em>");
    return safe;
  };
  const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r/g, "").split("\n");
    const out = [];
    let paragraph = [], list = null, quote = [];
    const flushParagraph = () => { if (paragraph.length) { out.push("<p>" + inline(paragraph.join(" ")) + "</p>"); paragraph = []; } };
    const flushList = () => { if (list) { out.push("</" + list + ">"); list = null; } };
    const flushQuote = () => { if (quote.length) { out.push("<blockquote>" + quote.map(x => "<p>" + inline(x) + "</p>").join("") + "</blockquote>"); quote = []; } };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) { flushParagraph(); flushList(); flushQuote(); continue; }
      if (line === "---") { flushParagraph(); flushList(); flushQuote(); out.push("<hr>"); continue; }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        flushParagraph(); flushList(); flushQuote();
        const level = heading[1].length, text = heading[2];
        if (text === "End of Chapter 01") out.push('<p class="chapter-end">END OF CHAPTER 01</p>');
        else out.push("<h" + level + ' id="' + slug(text) + '">' + inline(text) + "</h" + level + ">");
        continue;
      }
      if (line.startsWith("> ")) { flushParagraph(); flushList(); quote.push(line.slice(2)); continue; }
      const bullet = line.match(/^[-*]\s+(.+)$/);
      const numbered = line.match(/^\d+\.\s+(.+)$/);
      if (bullet || numbered) {
        flushParagraph(); flushQuote();
        const kind = bullet ? "ul" : "ol";
        if (list !== kind) { flushList(); list = kind; out.push("<" + list + ">"); }
        out.push("<li>" + inline((bullet || numbered)[1]) + "</li>");
        continue;
      }
      flushList(); flushQuote(); paragraph.push(line);
    }
    flushParagraph(); flushList(); flushQuote();
    return out.join("\n");
  }
  fetch("book/chapters/01-study.md")
    .then(response => { if (!response.ok) throw new Error("The manuscript could not be loaded."); return response.text(); })
    .then(markdown => {
      target.innerHTML = renderMarkdown(markdown);
      const headings = [...target.querySelectorAll("h2, h3")];
      toc.innerHTML = headings.map((heading, index) => '<a href="#' + heading.id + '" data-target="' + heading.id + '" class="' + (index === 0 ? "toc-active" : "") + '">' + escapeHTML(heading.textContent) + "</a>").join("");
      const links = [...toc.querySelectorAll("a")];
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          links.forEach(link => link.classList.toggle("toc-active", link.dataset.target === entry.target.id));
        });
      }, { rootMargin: "-15% 0px -70% 0px" });
      headings.forEach(heading => observer.observe(heading));
    })
    .catch(() => { target.innerHTML = '<p class="loading-message">This chapter could not be loaded. Please refresh the page or <a href="book/chapters/01-study.md">open the manuscript directly</a>.</p>'; });
  let fontSize = 16;
  document.getElementById("fontDown")?.addEventListener("click", () => { fontSize = Math.max(14, fontSize - 1); target.style.fontSize = fontSize + "px"; });
  document.getElementById("fontUp")?.addEventListener("click", () => { fontSize = Math.min(21, fontSize + 1); target.style.fontSize = fontSize + "px"; });
})();