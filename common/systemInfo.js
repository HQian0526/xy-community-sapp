/**
 * 窗口布局信息（优先使用微信推荐的新 API，避免 getSystemInfoSync 弃用警告）
 */
export function getWindowLayout() {
	if (typeof uni !== 'undefined' && typeof uni.getWindowInfo === 'function') {
		const win = uni.getWindowInfo() || {}
		const bottomInset = win.safeAreaInsets && win.safeAreaInsets.bottom
		return {
			windowWidth: win.windowWidth,
			windowHeight: win.windowHeight,
			screenWidth: win.screenWidth,
			screenHeight: win.screenHeight,
			statusBarHeight: win.statusBarHeight,
			windowBottom: typeof win.windowBottom === 'number'
				? win.windowBottom
				: (typeof bottomInset === 'number' ? bottomInset : 0)
		}
	}
	const sys = uni.getSystemInfoSync() || {}
	return {
		windowWidth: sys.windowWidth,
		windowHeight: sys.windowHeight,
		screenWidth: sys.screenWidth,
		screenHeight: sys.screenHeight,
		statusBarHeight: sys.statusBarHeight,
		windowBottom: typeof sys.windowBottom === 'number' ? sys.windowBottom : 50
	}
}
