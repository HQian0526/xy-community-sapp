<template>
	<!-- 微信 custom tabBar 槽。真正的底栏画在四个 Tab 页里，避免本组件里用 uni_modules 导致整栏空白。 -->
	<view class="xy-tabbar-slot"></view>
</template>

<script>
	export default {
		name: 'custom-tab-bar'
	}
</script>

<style>
	.xy-tabbar-slot {
		height: 0;
		overflow: hidden;
	}
</style>
