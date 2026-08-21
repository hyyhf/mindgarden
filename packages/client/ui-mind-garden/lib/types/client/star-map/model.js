/** Deterministic constellation model derived from encrypted reflection records. */
function hash(value) {
    let result = 2166136261;
    for (const character of value) {
        result ^= character.charCodeAt(0);
        result = Math.imul(result, 16777619);
    }
    return result >>> 0;
}
function position(id, index, count) {
    const seed = hash(id) / 0xFFFFFFFF;
    const fraction = (index + 0.5) / Math.max(1, count);
    const inclination = Math.acos(1 - 2 * fraction);
    const azimuth = Math.PI * (1 + Math.sqrt(5)) * index + seed * Math.PI;
    const distance = 19 + (index % 4) * 4 + seed * 5;
    return {
        x: Math.sin(inclination) * Math.cos(azimuth) * distance,
        y: Math.cos(inclination) * distance * 0.72,
        z: Math.sin(inclination) * Math.sin(azimuth) * distance,
    };
}
/**
 * Build a bounded, repeatable 3D constellation from records already available to the view.
 * @param questions - open and closed questions in service display order.
 * @param reviews - proposed, saved, and archived reviews in service display order.
 * @param mode - current dialogue posture represented by the center star.
 * @param labels - localized labels and interpolation templates.
 * @param profile - optional completed private profile represented by the center star.
 * @param traits - governed private traits represented as first-ring stars.
 * @returns the constellation nodes and links.
 */
export function createGardenStarMap(questions, reviews, mode, labels, profile, traits = []) {
    const visibleTraits = traits.filter(item => item.status !== 'retired').slice(0, 16);
    const visibleQuestions = questions.filter(item => item.status === 'open').slice(0, 18);
    const visibleReviews = reviews.filter(item => item.status !== 'archived').slice(0, 12);
    const total = visibleTraits.length + visibleQuestions.length + visibleReviews.length;
    const center = {
        id: 'center',
        kind: 'center',
        title: profile?.displayName || labels.center,
        detail: mode === 'serenity' ? labels.serenity : labels.clarity,
        status: mode,
        x: 0,
        y: 0,
        z: 0,
        radius: 2.2,
    };
    const nodes = [center];
    visibleTraits.forEach((trait, index) => {
        nodes.push({
            id: `trait:${String(trait.id)}`,
            kind: 'trait',
            title: trait.label,
            detail: trait.description || labels.traitDetail,
            status: trait.status,
            ...position(String(trait.id), index, total),
            radius: trait.status === 'confirmed' ? 1.2 : 1,
        });
    });
    visibleQuestions.forEach((question, index) => {
        nodes.push({
            id: `question:${String(question.id)}`,
            kind: 'question',
            title: question.question,
            detail: question.source?.evidenceQuote
                ?? labels.since.replace('{date}', question.createdStamp.localDate),
            status: question.status,
            ...position(String(question.id), visibleTraits.length + index, total),
            radius: 0.76,
        });
    });
    visibleReviews.forEach((review, reviewIndex) => {
        const index = visibleTraits.length + visibleQuestions.length + reviewIndex;
        nodes.push({
            id: `review:${String(review.id)}`,
            kind: 'review',
            title: review.content.split('\n', 1)[0]?.slice(0, 72) || labels.unnamedReview,
            detail: labels.reviewDetail
                .replace('{start}', review.startStamp.localDate)
                .replace('{end}', review.endStamp.localDate)
                .replace('{count}', String(review.sources.length)),
            status: review.status,
            ...position(String(review.id), index, total),
            radius: review.status === 'saved' ? 1.12 : 0.92,
        });
    });
    const links = nodes.slice(1).map(node => ({
        id: `orbit:${node.id}`,
        source: 'center',
        target: node.id,
        kind: 'orbit',
    }));
    let previousReview;
    for (const review of visibleReviews) {
        if (previousReview !== undefined) {
            links.push({
                id: `continuity:${String(previousReview.id)}:${String(review.id)}`,
                source: `review:${String(previousReview.id)}`,
                target: `review:${String(review.id)}`,
                kind: 'continuity',
            });
        }
        previousReview = review;
    }
    return { nodes, links };
}
//# sourceMappingURL=model.js.map