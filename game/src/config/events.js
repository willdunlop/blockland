
export const events = {
    postMessage: data => new CustomEvent("post.message", { detail: { data } }),
    revealOptions: reveal => new CustomEvent("reveal.options", { detail: { reveal } }),
    giveSausageSizzle: data => new CustomEvent("give.sausageSizzle", {})
}