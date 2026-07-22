<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';

  let { panel, data } = $props();

  let chartDom: HTMLElement;
  let chart: echarts.ECharts | null = null;

  onMount(() => {
    if (panel.visualization_type !== 'table' && panel.visualization_type !== 'number') {
      chart = echarts.init(chartDom);
      updateChart();
    }

    const handleResize = () => {
      chart?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart?.dispose();
    };
  });

  $effect(() => {
    if (chart && panel && data) {
      updateChart();
    }
  });

  function updateChart() {
    if (!chart || !data || !data.rows || data.rows.length === 0) return;

    // In Phase 1, we do some basic automatic mapping or read from viz_config
    const type = panel.visualization_type || 'bar';

    // Basic automatic mapping: first string col as X, first number col as Y
    let xAxisCol = data.columns[0]?.name;
    let yAxisCol = data.columns.find((c: any) => c.type_name === 'integer' || c.type_name === 'float' || c.type_name === 'numeric')?.name;

    if (panel.viz_config?.x_axis) xAxisCol = panel.viz_config.x_axis;
    if (panel.viz_config?.y_axis) yAxisCol = panel.viz_config.y_axis;

    if (!yAxisCol && data.columns.length > 1) {
       yAxisCol = data.columns[1]?.name;
    }

    const xAxisData = data.rows.map((r: any) => r[xAxisCol]);
    const seriesData = data.rows.map((r: any) => r[yAxisCol]);

    let option: any = {
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true }
    };

    if (type === 'pie') {
      option = {
        tooltip: { trigger: 'item' },
        series: [
          {
            type: 'pie',
            radius: '50%',
            data: data.rows.map((r: any) => ({ name: r[xAxisCol], value: r[yAxisCol] })),
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };
    } else {
      option.xAxis = {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          interval: 'auto',
          rotate: xAxisData.length > 10 ? 45 : 0
        }
      };
      option.yAxis = { type: 'value' };

      let seriesConfig: any = {
        data: seriesData,
        type: type === 'area' ? 'line' : type
      };

      if (type === 'area') {
        seriesConfig.areaStyle = {};
      }

      option.series = [seriesConfig];
    }

    chart.setOption(option);
  }
</script>

<div class="h-full w-full flex flex-col bg-white overflow-hidden">
  <div class="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
    <h3 class="text-sm font-medium text-gray-700 truncate">{panel.title || 'Untitled Panel'}</h3>
  </div>
  <div class="flex-1 p-2 relative overflow-hidden">
    {#if !data}
       <div class="absolute inset-0 flex justify-center items-center">
         <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
       </div>
    {:else if data.error}
       <div class="absolute inset-0 flex justify-center items-center p-4 text-center">
         <p class="text-sm text-red-500 bg-red-50 p-2 rounded">{data.error}</p>
       </div>
    {:else if panel.visualization_type === 'table'}
       <div class="h-full overflow-auto text-sm">
         <table class="min-w-full divide-y divide-gray-200">
           <thead class="bg-gray-50 sticky top-0">
             <tr>
               {#each data.columns || [] as col}
                 <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   {col.name}
                 </th>
               {/each}
             </tr>
           </thead>
           <tbody class="bg-white divide-y divide-gray-200">
             {#each data.rows || [] as row}
               <tr class="hover:bg-gray-50">
                 {#each data.columns || [] as col}
                   <td class="px-3 py-2 whitespace-nowrap text-gray-700">
                     {row[col.name]}
                   </td>
                 {/each}
               </tr>
             {/each}
           </tbody>
         </table>
       </div>
    {:else if panel.visualization_type === 'number'}
       <div class="h-full flex justify-center items-center">
         <div class="text-center">
            {#if data.rows && data.rows.length > 0 && data.columns && data.columns.length > 0}
              <div class="text-4xl font-bold text-gray-900">
                 {data.rows[0][data.columns[data.columns.length-1].name]}
              </div>
              <div class="text-sm text-gray-500 mt-2 uppercase tracking-wide">
                 {data.columns[data.columns.length-1].name}
              </div>
            {/if}
         </div>
       </div>
    {:else}
       <div bind:this={chartDom} class="w-full h-full"></div>
    {/if}
  </div>
</div>
