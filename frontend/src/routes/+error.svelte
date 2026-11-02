<script lang="ts">
	import { page } from '$app/state'
</script>

<div class="flex flex-col min-h-screen justify-center items-center">
	<h1 class="text-2xl font-bold">Error</h1>
	<p class="text-lg">{page.status}</p>
</div>
