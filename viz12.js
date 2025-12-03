import * as d3 from 'd3';

export function createStackedBarChart(container, data, options = {}) {
  const {
    width = 600,
    height = 80,
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
    weeklyBudget = 150
  } = options;

  // Clear previous chart
  d3.select(container).selectAll('*').remove();

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('max-width', '100%')
    .style('height', 'auto');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Colors
  const colors = {
    plant: 'hsl(142, 71%, 45%)',
    animal: 'hsl(32, 95%, 44%)',
    processed: 'hsl(0, 72%, 51%)'
  };

  // Scale
  const xScale = d3.scaleLinear()
    .domain([0, weeklyBudget])
    .range([0, innerWidth]);

  // Tooltip
  const tooltip = d3.select(container)
    .append('div')
    .attr('class', 'stacked-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'hsl(222, 47%, 11%)')
    .style('border', '1px solid hsl(217, 19%, 27%)')
    .style('border-radius', '8px')
    .style('padding', '10px')
    .style('box-shadow', '0 10px 25px rgba(0,0,0,0.3)')
    .style('pointer-events', 'none')
    .style('z-index', '1000');

  // Stack data
  const stackData = [
    { key: 'plant', value: data.plant, label: 'Plant-Based' },
    { key: 'animal', value: data.animal, label: 'Animal-Based' },
    { key: 'processed', value: data.processed, label: 'Processed' }
  ];

  let cumulative = 0;
  const bars = stackData.map(d => {
    const x = cumulative;
    cumulative += d.value;
    return { ...d, x, width: d.value };
  });

  // Draw bars
  const barGroup = g.selectAll('.bar')
    .data(bars)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', d => xScale(d.x))
    .attr('y', 0)
    .attr('height', innerHeight)
    .attr('fill', d => colors[d.key])
    .attr('rx', (d, i) => {
      if (i === 0) return 8;
      if (i === bars.length - 1) return 8;
      return 0;
    })
    .style('cursor', 'pointer')
    .style('transition', 'opacity 0.2s ease');

  // Animate width
  barGroup
    .attr('width', 0)
    .transition()
    .duration(800)
    .delay((d, i) => i * 100)
    .attr('width', d => xScale(d.width));

  // Hover interactions
  barGroup
    .on('mouseover', function(event, d) {
      d3.select(this).style('opacity', 0.85);
      
      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="display: flex; justify-content: space-between; gap: 16px; font-size: 13px;">
            <span style="color: ${colors[d.key]}; font-weight: 500;">${d.label}:</span>
            <span style="font-weight: 600; color: hsl(210, 40%, 98%);">$${d.value.toFixed(2)}</span>
          </div>
        `);
    })
    .on('mousemove', function(event) {
      const containerRect = container.getBoundingClientRect();
      tooltip
        .style('left', (event.clientX - containerRect.left + 10) + 'px')
        .style('top', (event.clientY - containerRect.top - 40) + 'px');
    })
    .on('mouseout', function() {
      d3.select(this).style('opacity', 1);
      tooltip.style('visibility', 'hidden');
    });

  return {
    update: (newData) => {
      let cumulative = 0;
      const newBars = [
        { key: 'plant', value: newData.plant, label: 'Plant-Based' },
        { key: 'animal', value: newData.animal, label: 'Animal-Based' },
        { key: 'processed', value: newData.processed, label: 'Processed' }
      ].map(d => {
        const x = cumulative;
        cumulative += d.value;
        return { ...d, x, width: d.value };
      });

      barGroup.data(newBars)
        .transition()
        .duration(400)
        .attr('x', d => xScale(d.x))
        .attr('width', d => xScale(d.width));
    },
    destroy: () => {
      d3.select(container).selectAll('*').remove();
    }
  };
}

export function createBreakdownBars(container, items, options = {}) {
  const {
    itemHeight = 44,
    maxPercent = 40
  } = options;

  // Clear previous
  d3.select(container).selectAll('*').remove();

  const colors = {
    plant: 'hsl(142, 71%, 45%)',
    animal: 'hsl(32, 95%, 44%)',
    processed: 'hsl(0, 72%, 51%)'
  };

  // Create item containers
  const itemDivs = d3.select(container)
    .selectAll('.breakdown-item')
    .data(items)
    .enter()
    .append('div')
    .attr('class', 'breakdown-item')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('justify-content', 'space-between')
    .style('padding', '8px')
    .style('background', 'hsla(222, 47%, 15%, 0.3)')
    .style('border-radius', '8px')
    .style('margin-bottom', '8px')
    .style('opacity', 0)
    .style('transform', 'translateX(-10px)');

  // Left side: icon + name
  const leftSide = itemDivs.append('div')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('gap', '8px');

  leftSide.append('span')
    .text(d => d.icon)
    .style('font-size', '16px');

  leftSide.append('span')
    .text(d => d.name)
    .style('font-size', '14px')
    .style('color', 'hsl(210, 40%, 98%)');

  // Right side: bar + value
  const rightSide = itemDivs.append('div')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('gap', '12px');

  // Progress bar container
  const barContainer = rightSide.append('div')
    .style('width', '64px')
    .style('height', '6px')
    .style('background', 'hsl(217, 19%, 27%)')
    .style('border-radius', '9999px')
    .style('overflow', 'hidden');

  // Progress bar fill
  const barFill = barContainer.append('div')
    .style('height', '100%')
    .style('border-radius', '9999px')
    .style('background', d => colors[d.type])
    .style('width', '0%');

  // Value
  rightSide.append('span')
    .text(d => `$${d.value.toFixed(2)}`)
    .style('font-size', '14px')
    .style('font-weight', '500')
    .style('width', '64px')
    .style('text-align', 'right')
    .style('color', d => colors[d.type]);

  // Animate in
  itemDivs
    .transition()
    .duration(300)
    .delay((d, i) => i * 30)
    .style('opacity', 1)
    .style('transform', 'translateX(0)');

  barFill
    .transition()
    .duration(500)
    .delay((d, i) => i * 30 + 100)
    .style('width', d => `${(d.percentage / maxPercent) * 100}%`);

  return {
    update: (newItems) => {
      // For simplicity, recreate
      createBreakdownBars(container, newItems, options);
    },
    destroy: () => {
      d3.select(container).selectAll('*').remove();
    }
  };
}
