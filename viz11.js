import * as d3 from 'd3';

export function createROIChart(container, data, options = {}) {
  const {
    width = 800,
    height = 450,
    margin = { top: 40, right: 40, bottom: 60, left: 70 },
    onHover = () => {},
    onLeave = () => {}
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

  // Main group
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, 12])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([innerHeight, 0]);

  const sizeScale = d3.scaleLinear()
    .domain([0, 40])
    .range([8, 25]);

  // Color function
  const getColor = (type) => {
    if (type === 'plant') return 'hsl(142, 71%, 45%)';
    if (type === 'animal') return 'hsl(32, 95%, 44%)';
    return 'hsl(0, 72%, 51%)';
  };

  const getStrokeColor = (type) => {
    if (type === 'plant') return 'hsl(142, 76%, 36%)';
    if (type === 'animal') return 'hsl(26, 90%, 37%)';
    return 'hsl(0, 72%, 41%)';
  };

  // Grid lines
  const gridGroup = g.append('g').attr('class', 'grid');

  // Vertical grid lines
  gridGroup.selectAll('.grid-v')
    .data(xScale.ticks(6))
    .enter()
    .append('line')
    .attr('class', 'grid-v')
    .attr('x1', d => xScale(d))
    .attr('x2', d => xScale(d))
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', 'hsl(217, 19%, 27%)')
    .attr('stroke-dasharray', '3,3')
    .attr('opacity', 0.5);

  // Horizontal grid lines
  gridGroup.selectAll('.grid-h')
    .data(yScale.ticks(5))
    .enter()
    .append('line')
    .attr('class', 'grid-h')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', d => yScale(d))
    .attr('y2', d => yScale(d))
    .attr('stroke', 'hsl(217, 19%, 27%)')
    .attr('stroke-dasharray', '3,3')
    .attr('opacity', 0.5);

  // Reference lines for quadrants
  g.append('line')
    .attr('x1', xScale(5))
    .attr('x2', xScale(5))
    .attr('y1', 0)
    .attr('y2', innerHeight)
    .attr('stroke', 'hsl(217, 19%, 35%)')
    .attr('stroke-dasharray', '5,5')
    .attr('opacity', 0.7);

  g.append('line')
    .attr('x1', 0)
    .attr('x2', innerWidth)
    .attr('y1', yScale(50))
    .attr('y2', yScale(50))
    .attr('stroke', 'hsl(217, 19%, 35%)')
    .attr('stroke-dasharray', '5,5')
    .attr('opacity', 0.7);

  // X Axis
  const xAxis = d3.axisBottom(xScale)
    .ticks(6)
    .tickFormat(d => `$${d}`);

  g.append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(xAxis)
    .call(g => g.selectAll('text').attr('fill', 'hsl(215, 20%, 65%)').style('font-size', '12px'))
    .call(g => g.selectAll('line').attr('stroke', 'hsl(217, 19%, 35%)'))
    .call(g => g.select('.domain').attr('stroke', 'hsl(217, 19%, 35%)'));

  // X Axis Label
  g.append('text')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + 45)
    .attr('text-anchor', 'middle')
    .attr('fill', 'hsl(215, 20%, 65%)')
    .style('font-size', '14px')
    .text('Weekly Cost per Serving ($)');

  // Y Axis
  const yAxis = d3.axisLeft(yScale)
    .ticks(5);

  g.append('g')
    .call(yAxis)
    .call(g => g.selectAll('text').attr('fill', 'hsl(215, 20%, 65%)').style('font-size', '12px'))
    .call(g => g.selectAll('line').attr('stroke', 'hsl(217, 19%, 35%)'))
    .call(g => g.select('.domain').attr('stroke', 'hsl(217, 19%, 35%)'));

  // Y Axis Label
  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -innerHeight / 2)
    .attr('y', -50)
    .attr('text-anchor', 'middle')
    .attr('fill', 'hsl(215, 20%, 65%)')
    .style('font-size', '14px')
    .text('Combined Health + Env. ROI');

  // Tooltip
  const tooltip = d3.select(container)
    .append('div')
    .attr('class', 'roi-tooltip')
    .style('position', 'absolute')
    .style('visibility', 'hidden')
    .style('background', 'hsl(222, 47%, 11%)')
    .style('border', '1px solid hsl(217, 19%, 27%)')
    .style('border-radius', '8px')
    .style('padding', '12px')
    .style('box-shadow', '0 10px 25px rgba(0,0,0,0.3)')
    .style('pointer-events', 'none')
    .style('z-index', '1000')
    .style('max-width', '280px');

  // Data points
  const circles = g.selectAll('.data-point')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'data-point')
    .attr('cx', d => xScale(d.x))
    .attr('cy', d => yScale(d.y))
    .attr('r', d => sizeScale(d.allocationPercent))
    .attr('fill', d => getColor(d.type))
    .attr('fill-opacity', 0.8)
    .attr('stroke', d => getStrokeColor(d.type))
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .style('transition', 'all 0.2s ease');

  // Hover interactions
  circles
    .on('mouseover', function(event, d) {
      d3.select(this)
        .attr('fill-opacity', 1)
        .attr('r', sizeScale(d.allocationPercent) * 1.2);

      const typeLabel = d.type === 'plant' ? 'Plant-Based' : d.type === 'animal' ? 'Animal-Based' : 'Processed';
      const typeColor = d.type === 'plant' ? 'hsl(142, 71%, 45%)' : d.type === 'animal' ? 'hsl(32, 95%, 44%)' : 'hsl(0, 72%, 51%)';

      tooltip
        .style('visibility', 'visible')
        .html(`
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <span style="font-size: 24px;">${d.icon}</span>
            <div>
              <div style="font-weight: 600; color: hsl(210, 40%, 98%); font-size: 14px;">${d.name}</div>
              <div style="font-size: 11px; font-weight: 500; color: ${typeColor};">${typeLabel}</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: hsl(215, 20%, 65%);">Weekly Cost:</span>
              <span style="font-weight: 500; color: hsl(210, 40%, 98%);">$${d.weeklyPricePerServing.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: hsl(215, 20%, 65%);">Health ROI:</span>
              <span style="font-weight: 500; color: ${d.healthROI > 60 ? 'hsl(142, 71%, 45%)' : 'hsl(32, 95%, 44%)'};">${d.healthROI}/100</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: hsl(215, 20%, 65%);">Environmental ROI:</span>
              <span style="font-weight: 500; color: ${d.environmentalROI > 60 ? 'hsl(142, 71%, 45%)' : 'hsl(32, 95%, 44%)'};">${d.environmentalROI}/100</span>
            </div>
            <div style="border-top: 1px solid hsl(217, 19%, 27%); padding-top: 6px; margin-top: 4px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(215, 20%, 65%);">CO₂ per kg:</span>
                <span style="font-weight: 500; color: hsl(210, 40%, 98%);">${d.co2PerKg} kg</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: hsl(215, 20%, 65%);">Lifetime Savings:</span>
                <span style="font-weight: 500; color: hsl(142, 71%, 45%);">$${d.lifetimeSavings.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <p style="font-size: 11px; color: hsl(215, 20%, 65%); margin-top: 10px; padding-top: 8px; border-top: 1px solid hsl(217, 19%, 27%);">
            ${d.healthNotes}
          </p>
        `);

      onHover(d);
    })
    .on('mousemove', function(event) {
      const containerRect = container.getBoundingClientRect();
      tooltip
        .style('left', (event.clientX - containerRect.left + 15) + 'px')
        .style('top', (event.clientY - containerRect.top - 10) + 'px');
    })
    .on('mouseout', function(event, d) {
      d3.select(this)
        .attr('fill-opacity', 0.8)
        .attr('r', sizeScale(d.allocationPercent));

      tooltip.style('visibility', 'hidden');
      onLeave();
    });

  // Initial animation
  circles
    .attr('r', 0)
    .transition()
    .duration(600)
    .delay((d, i) => i * 30)
    .attr('r', d => sizeScale(d.allocationPercent));

  return {
    update: (newData) => {
      circles.data(newData)
        .transition()
        .duration(400)
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', d => sizeScale(d.allocationPercent));
    },
    destroy: () => {
      d3.select(container).selectAll('*').remove();
    }
  };
}
