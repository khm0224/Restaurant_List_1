(function () {
    const slider = document.getElementById('regionSlider');

    if (!slider) {
        return;
    }

    const track = document.getElementById('regionTrack');
    const prevBtn = document.getElementById('regionPrev');
    const nextBtn = document.getElementById('regionNext');

    if (!track || !prevBtn || !nextBtn) {
        return;
    }

    const MOVE_DURATION = 500;
    let originalItems = [];
    let cloneItems = [];
    let moveDistance = 0;
    let accumulatedSteps = 0;
    let finishTimer = null;
    let isMoving = false;

    function getMoveDistance() {
        const firstItem = track.firstElementChild;

        if (!firstItem) {
            return 0;
        }

        const trackStyle = getComputedStyle(track);
        const gap = parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;

        return firstItem.getBoundingClientRect().width + gap;
    }

    function createClone(item) {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.style.pointerEvents = 'none';
        return clone;
    }

    function prepareInfiniteTrack() {
        originalItems = Array.from(track.children);

        if (originalItems.length === 0) {
            return false;
        }

        const beforeClones = originalItems.map(createClone);
        const afterClones = originalItems.map(createClone);
        cloneItems = [...beforeClones, ...afterClones];

        beforeClones.slice().reverse().forEach((clone) => {
            track.insertBefore(clone, track.firstElementChild);
        });
        afterClones.forEach((clone) => track.appendChild(clone));

        moveDistance = getMoveDistance();
        accumulatedSteps = 0;

        track.style.transition = 'none';
        track.style.transform = `translateX(-${originalItems.length * moveDistance}px)`;
        track.offsetWidth;
        track.style.transition = `transform ${MOVE_DURATION}ms ease`;
        isMoving = true;

        return true;
    }

    function finishMove() {
        if (!isMoving) {
            return;
        }

        const total = originalItems.length;
        const rightSteps = ((accumulatedSteps % total) + total) % total;

        originalItems.slice(0, rightSteps).forEach((item) => {
            track.appendChild(item);
        });
        cloneItems.forEach((clone) => clone.remove());

        track.style.transition = 'none';
        track.style.transform = 'translateX(0)';

        originalItems = [];
        cloneItems = [];
        accumulatedSteps = 0;
        isMoving = false;
    }

    function move(step) {
        if (!isMoving && !prepareInfiniteTrack()) {
            return;
        }

        accumulatedSteps += step;

        const basePosition = originalItems.length * moveDistance;
        const targetPosition = basePosition + (accumulatedSteps * moveDistance);
        track.style.transform = `translateX(-${targetPosition}px)`;

        clearTimeout(finishTimer);
        finishTimer = setTimeout(finishMove, MOVE_DURATION + 30);
    }

    nextBtn.addEventListener('click', () => move(1));
    prevBtn.addEventListener('click', () => move(-1));
})();
