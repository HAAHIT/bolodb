<script lang="ts">
  import { apiCall } from '$lib/api';

  let { turn, onClose } = $props();

  let name = $state('');
  let description = $state('');
  let vizType = $state('table');
  let saving = $state(false);

  async function save() {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }
    saving = true;
    try {
      await apiCall('/api/saved-queries', 'POST', {
        name,
        description,
        question: turn.question,
        sql: turn.sql,
        columns: turn.columns,
        database_id: turn.database_id,
        visualization_type: vizType,
        last_result: turn.rows ? turn.rows.slice(0, 500) : null
      });
      alert('Saved successfully!');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Failed to save query');
    } finally {
      saving = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onclick={onClose}></div>
    <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
    <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">Save Query</h3>
        <p class="text-sm text-gray-500 mt-1">Save this query as a report so you can add it to dashboards.</p>

        <div class="mt-4 space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700">Question</label>
            <div class="mt-1 text-sm bg-gray-50 p-2 rounded border border-gray-200 truncate">
              {turn.question}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" bind:value={name} class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. Daily Active Users">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea bind:value={description} rows="2" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Default Visualization</label>
            <select bind:value={vizType} class="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <option value="table">Data Table</option>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="area">Area Chart</option>
              <option value="number">Single Number Card</option>
            </select>
          </div>
        </div>
      </div>
      <div class="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
        <button type="button" onclick={save} disabled={saving} class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onclick={onClose} class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
