const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealItems = document.querySelectorAll("[data-reveal]");

if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        },
        {
            threshold: 0.18,
            rootMargin: "0px 0px -8% 0px"
        }
    );

    revealItems.forEach((item, index) => {
        item.style.setProperty("--reveal-delay", `${Math.min(index * 70, 420)}ms`);
        revealObserver.observe(item);
    });

    const heroVisual = document.querySelector("[data-parallax]");

    if (heroVisual) {
        const floatingNotes = heroVisual.querySelectorAll(".floating-note");
        const portraitCard = heroVisual.querySelector(".portrait-card");

        heroVisual.addEventListener("pointermove", (event) => {
            const bounds = heroVisual.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;

            if (portraitCard) {
                portraitCard.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0) rotateX(${y * -4}deg) rotateY(${x * 5}deg)`;
            }

            floatingNotes.forEach((note, index) => {
                const strength = index === 0 ? 18 : 12;
                note.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
            });
        });

        heroVisual.addEventListener("pointerleave", () => {
            if (portraitCard) {
                portraitCard.style.transform = "";
            }

            floatingNotes.forEach((note) => {
                note.style.transform = "";
            });
        });
    }
} else {
    revealItems.forEach((item) => {
        item.classList.add("is-visible");
    });
}

async function enhanceTypographyWithPretext() {
    const targets = Array.from(document.querySelectorAll("[data-pretext]"));

    if (targets.length === 0) {
        return;
    }

    try {
        const { prepareWithSegments, layoutWithLines } = await import("https://esm.sh/@chenglou/pretext");

        await document.fonts.ready;

        const renderTarget = (element) => {
            const text = element.dataset.pretextSource || element.textContent.trim();

            if (!text) {
                return;
            }

            element.dataset.pretextSource = text;

            const computed = getComputedStyle(element);
            const width = Math.floor(element.clientWidth);
            const font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
            const lineHeight = Number.parseFloat(computed.lineHeight);

            if (!width || Number.isNaN(lineHeight)) {
                return;
            }

            const prepared = prepareWithSegments(text, font);
            const { lines } = layoutWithLines(prepared, width, lineHeight);

            if (!lines || lines.length === 0) {
                element.textContent = text;
                return;
            }

            element.textContent = "";

            const wrapper = document.createElement("span");
            wrapper.className = "pretext-lines";

            lines.forEach((line) => {
                const lineNode = document.createElement("span");
                lineNode.className = "pretext-line";
                lineNode.style.setProperty("--line-index", wrapper.childElementCount);
                if (typeof line.width === "number") {
                    lineNode.style.setProperty("--line-width", `${Math.ceil(line.width)}px`);
                }
                lineNode.dataset.parity = wrapper.childElementCount % 2 === 0 ? "even" : "odd";
                lineNode.textContent = line.text;
                wrapper.appendChild(lineNode);
            });

            element.appendChild(wrapper);
            element.classList.add("pretext-ready");
        };

        const rerenderAll = () => {
            targets.forEach(renderTarget);
        };

        rerenderAll();

        const resizeObserver = new ResizeObserver(() => {
            rerenderAll();
        });

        targets.forEach((element) => {
            resizeObserver.observe(element);
        });
    } catch (error) {
        console.warn("Pretext enhancement unavailable", error);
    }
}

enhanceTypographyWithPretext();
