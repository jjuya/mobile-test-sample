export class KeyboardDetector {
    public __type__ = "istudio.util.KeyboardDetector";
    private mStableViewportHeight: number;
    private mIsOpen = false;
    private mRAFId: number | null = null;

    private readonly STABLE_THRESHOLD = 6;
    private readonly THRESHOLD = 100;

    constructor() {
        this.mStableViewportHeight = this._getViewportHeight();

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", () =>
                this._handleViewportChange()
            );
            window.visualViewport.addEventListener("scroll", () =>
                this._handleViewportChange()
            );
        }
    }

    public get IsOpen() {
        return this.mIsOpen;
    }

    private _getViewportHeight() {
        return window.visualViewport?.height ?? window.innerHeight;
    }

    private _handleViewportChange() {
        // 키보드 안정화 확인 rAF 시작
        if (!this.mRAFId)
            this._checkViewportStable(() => this._updateKeyboardState());
    }

    private _updateKeyboardState() {
        const currentHeight = this._getViewportHeight();
        const isKeyboardNowOpen =
            this.mStableViewportHeight - currentHeight > this.THRESHOLD;

        if (!isKeyboardNowOpen) this.mStableViewportHeight = currentHeight;

        if (this.mIsOpen !== isKeyboardNowOpen) {
            this.mIsOpen = isKeyboardNowOpen;
        }
    }

    private _checkViewportStable(callback: () => void) {
        const STABILITY_THRESHOLD = this.STABLE_THRESHOLD;
        let lastHeight = this._getViewportHeight();
        let stableFrameCount = 0;

        const checkStability = () => {
            const currentHeight = this._getViewportHeight();
            if (currentHeight === lastHeight) {
                stableFrameCount++;
            } else {
                lastHeight = currentHeight;
                stableFrameCount = 0;
            }

            if (stableFrameCount >= STABILITY_THRESHOLD) {
                callback();
                this.mRAFId = null;
            } else {
                this.mRAFId = requestAnimationFrame(checkStability);
            }
        };

        if (this.mRAFId) cancelAnimationFrame(this.mRAFId);
        this.mRAFId = requestAnimationFrame(checkStability);
    }
}
