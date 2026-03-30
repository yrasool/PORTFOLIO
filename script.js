const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
    const revealItems = document.querySelectorAll("[data-reveal]");

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
    document.querySelectorAll("[data-reveal]").forEach((item) => {
        item.classList.add("is-visible");
    });
}
