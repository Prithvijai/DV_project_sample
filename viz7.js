// ========================================
// KRISHNA VINOD VISUALIZATION
// ========================================

mapboxgl.accessToken = 'pk.eyJ1Ijoia3Zpbm9kIiwiYSI6ImNtaHg3YXlqaDAweGMyanB4cTRoczFjMDYifQ.g7Q7Ejb2zh-GMPnz_f0XbA';

// === GLOBAL STATE ===
let map;
let metricsData;
let treemapStateSeries;
let treemapYears;
let treemapCurrentYear;
let treemapCurrentFocus = 'all';
let treemapSelectedState = null;
// ========================================
let activeChapterId = null;
let fertilizerFireHandle = null;
let fertilizerFirePhase = 0;
let fertilizerFireTargetOpacity = 0;

const FIRE_GRADIENT_STOPS = [1, 5, 10, 25, 50, 100, 200, 500];
const FIRE_BASE_COLORS = ['#fef3d3', '#fed18c', '#fda762', '#f86f3c', '#d9442e', '#a92424', '#6b1015', '#37060d'];
const FIRE_GLOW_COLORS = ['#fff8e1', '#ffd27a', '#ff9b45', '#ff6137', '#ff2d1c', '#ff6215', '#ff9711', '#ffd400'];

// === MAPBOX CHAPTER CONFIGURATIONS ===
const chapters = {
    'world-view': {
        center: [-55, -11.5],
        zoom: 3.7,
        pitch: 0,
        bearing: 0,
        curve: 1.1
    },
    'amazon-basin': {
        center: [-61, -4.5],
        zoom: 5,
        pitch: 36,
        bearing: -10,
        curve: 1.4
    },
    'rondonia-fishbone': {
        center: [-63.8, -9.5],
        zoom: 7.4,
        pitch: 62,
        bearing: 45,
        curve: 1.3
    },
    'mato-grosso-boom': {
        center: [-55.5, -13.5],
        zoom: 6.7,
        pitch: 55,
        bearing: -12,
        curve: 1.25,
        extrudeState: 'MT'
    },
    'arc-of-fire': {
        center: [-52, -10],
        zoom: 5,
        pitch: 46,
        bearing: 18,
        curve: 1.25
    },
    'br163-artery': {
        center: [-55.8, -8.7],
        zoom: 6.4,
        pitch: 68,
        bearing: 4,
        curve: 1.25,
        extrudeState: 'PA'
    },
    'fertilizer-yield': {
        center: [-55.5, -13],
        zoom: 5.4,
        pitch: 38,
        bearing: 24,
        curve: 1.2
    },
    'final-cost': {
        center: [-54, -12.3],
        zoom: 5.6,
        pitch: 30,
        bearing: -28,
        curve: 1.35
    }
};

const SOY_GROWTH_GRADIENT = 'linear-gradient(90deg, #fff7ec 0%, #fdd49e 45%, #d7301f 100%)';

const soyHotspots = [
    { name: 'Sorriso, MT', description: 'World soy capital pushing deep into Amazonia', coordinates: [-55.721, -12.542] },
    { name: 'Campo Novo do Parecis, MT', description: 'Cerrado grains frontier turned export hub', coordinates: [-58.084, -13.677] },
    { name: 'Santarém, PA', description: 'BR-163 terminus and river export lifeline', coordinates: [-54.709, -2.438] }
];

let soyMarkers = [];
let stateFeatureIdBySigla = new Map();
let highlightedStateIds = new Set();

const legendChannelTemplate = { boundary: false, gradient: false, soy: false, fertilizer: false };
let previousLegendChannels = { ...legendChannelTemplate };
let previousLegendChapter = null;

const chapterVisualPlan = {
    'world-view': {
        channels: { boundary: true },
        legend: [
            { type: 'swatch', title: 'Amazon Legal', color: '#4a7c59', label: 'Legal Amazon frontier', channel: 'boundary' }
        ],
        transitions: { boundaryFillOpacity: 0.22, boundaryLineOpacity: 0.9 }
    },
    'amazon-basin': {
        channels: { boundary: true, gradient: true },
        legend: [
            { type: 'swatch', title: 'Southern rampart', color: '#4a7c59', label: 'Legal Amazon perimeter', channel: 'boundary' },
            { type: 'gradient', title: 'Soy multiplier', caption: 'Growth factor 2000 → 2024 (1x → 10x+)', channel: 'gradient' }
        ],
        transitions: { gradientOpacity: 0.72, boundaryFillOpacity: 0.18, boundaryLineOpacity: 0.75 }
    },
    'rondonia-fishbone': {
        channels: { boundary: false },
        legend: [
            { type: 'swatch', title: 'Settlement scars', color: '#ffc857', label: 'Rondônia, Acre & Amazonas corridors' }
        ],
        highlights: {
            states: ['RO', 'AC', 'AM'],
            color: '#ffc857',
            lineColor: '#c87c00',
            opacity: 0.78
        }
    },
    'mato-grosso-boom': {
        channels: { boundary: true, gradient: true, soy: true },
        legend: [
            { type: 'swatch', title: 'Forest edge', color: '#4a7c59', label: 'Legal Amazon outline', channel: 'boundary' },
            { type: 'gradient', title: 'Soy growth surge', caption: 'Growth factor 2000 → 2024 (1x → 10x+)', channel: 'gradient' },
            { type: 'soy', title: 'Powerhouse municipalities', label: 'Sorriso · Campo Novo · Santarém', channel: 'soy' }
        ],
        transitions: { gradientOpacity: 0.85, boundaryFillOpacity: 0.12 }
    },
    'arc-of-fire': {
        channels: { boundary: true, gradient: true, soy: true },
        legend: [
            { type: 'swatch', title: 'Arc frontier', color: '#4a7c59', label: 'Legal Amazon bend', channel: 'boundary' },
            { type: 'gradient', title: 'Explosive acreage gains', caption: 'Arc of Fire states (1x → 10x+)', channel: 'gradient' },
            { type: 'soy', title: 'Flashpoint hubs', label: 'Alta Floresta · Sinop · Balsas', channel: 'soy' }
        ],
        transitions: { gradientOpacity: 0.82, boundaryFillOpacity: 0.1 }
    },
    'br163-artery': {
        channels: { boundary: true, gradient: true, soy: true },
        legend: [
            { type: 'swatch', title: 'Forest corridor', color: '#4a7c59', label: 'Legal Amazon outline', channel: 'boundary' },
            { type: 'gradient', title: 'BR-163 soy funnel', caption: 'Growth factor along the highway', channel: 'gradient' },
            { type: 'soy', title: 'Logistics nodes', label: 'Sorriso · Santarém · Itaituba', channel: 'soy' }
        ],
        transitions: { gradientOpacity: 0.75, boundaryFillOpacity: 0.1 }
    },
    'fertilizer-yield': {
        channels: { fertilizer: true },
        legend: [
            { type: 'swatch', title: 'Soil pressure', color: '#d45a00', label: 'Fertilizer-intensive soils', channel: 'fertilizer' }
        ],
        transitions: { fertilizerFillOpacity: 0.32, fertilizerLineOpacity: 0.95, fertilizerAuraOpacity: 0.45 }
    },
    'final-cost': {
        channels: { boundary: true, gradient: true, fertilizer: true },
        legend: [
            { type: 'swatch', title: 'Legal Amazon', color: '#4a7c59', label: 'Boundary still under pressure', channel: 'boundary' },
            { type: 'gradient', title: 'Soy trajectory', caption: 'Growth factor 2000 → 2024', channel: 'gradient' },
            { type: 'swatch', title: 'Soil toll', color: '#d45a00', label: 'Fertilizer load across the frontier', channel: 'fertilizer' }
        ],
        transitions: { gradientOpacity: 0.6, boundaryFillOpacity: 0.16, fertilizerFillOpacity: 0.34, fertilizerLineOpacity: 0.9, fertilizerAuraOpacity: 0.35 }
    }
};

const setLayerPaint = (layerId, property, value) => {
    if (map && map.getLayer(layerId)) {
        map.setPaintProperty(layerId, property, value);
    }
};

const getChapterPlan = (chapter) => chapterVisualPlan[chapter] || null;

function getLegendChannels(chapter) {
    const plan = getChapterPlan(chapter);
    if (!plan) return { ...legendChannelTemplate };
    return { ...legendChannelTemplate, ...plan.channels };
}

function applyLegendDrivenLayers(chapter = null, overrideChannels = null) {
    if (!map || !map.isStyleLoaded()) return;

    const plan = chapter ? getChapterPlan(chapter) : null;
    const baseChannels = plan?.channels || legendChannelTemplate;
    const nextState = overrideChannels
        ? { ...legendChannelTemplate, ...overrideChannels }
        : { ...legendChannelTemplate, ...baseChannels };

    const channelChanged = chapter !== previousLegendChapter || Object.keys(nextState).some(key => nextState[key] !== previousLegendChannels[key]);
    if (!channelChanged) return;

    previousLegendChannels = nextState;
    previousLegendChapter = chapter;

    const transitions = plan?.transitions || {};
    const gradientOpacity = nextState.gradient ? (transitions.gradientOpacity ?? 0.75) : 0;
    const extrusionOpacity = nextState.gradient ? (transitions.extrusionOpacity ?? 0.65) : 0;
    const boundaryActive = nextState.boundary || nextState.fertilizer;
    const fertilizerMode = nextState.fertilizer;

    const boundaryFillColor = fertilizerMode ? '#f4a750' : '#4a7c59';
    const boundaryLineColor = fertilizerMode ? '#d45a00' : '#4a7c59';
    const boundaryFillOpacity = fertilizerMode
        ? (transitions.fertilizerFillOpacity ?? 0.32)
        : nextState.boundary
            ? (transitions.boundaryFillOpacity ?? 0.12)
            : 0;
    const boundaryLineOpacity = boundaryActive
        ? (fertilizerMode ? (transitions.fertilizerLineOpacity ?? 0.9) : (transitions.boundaryLineOpacity ?? 0.8))
        : 0;

    setLayerPaint('states-growth', 'fill-opacity', gradientOpacity);
    setLayerPaint('states-extrusion', 'fill-extrusion-opacity', extrusionOpacity);
    setLayerPaint('amazon-boundary-fill', 'fill-color', boundaryFillColor);
    setLayerPaint('amazon-boundary-fill', 'fill-opacity', boundaryFillOpacity);
    setLayerPaint('amazon-boundary-line', 'line-color', boundaryLineColor);
    setLayerPaint('amazon-boundary-line', 'line-opacity', boundaryLineOpacity);

    toggleSoyMarkers(nextState.soy);
    if (nextState.fertilizer) {
        startFertilizerFire(transitions.fertilizerAuraOpacity ?? 0.38);
    } else {
        stopFertilizerFire();
    }
}

// Wait for DOM to be ready
function startVisualization() {
    Promise.all([
        d3.json("krishna_data/amazon_legal_boundary_simplified.geojson"),
        d3.csv("krishna_data/soy_amazon_vs_nonamazon_by_year.csv", parseSoyYear),
        d3.csv("krishna_data/soy_municipal_2000_2024.csv", parseSoyMunicipal),
        d3.csv("krishna_data/fertilizer_use_brazil.csv", parseFertilizer)
    ])
        .then(initialize)
        .catch((error) => console.error("❌ Failed to load data:", error));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startVisualization);
} else {
    startVisualization();
}

function initialize([amazonBoundary, soyAmazonVsNon, soyMunicipal, fertilizerSeries]) {
    metricsData = computeStateMetrics(soyMunicipal);
    treemapStateSeries = metricsData.stateSeries;
    treemapYears = metricsData.years;
    treemapCurrentYear = treemapYears[treemapYears.length - 1];
    initializeMap(amazonBoundary);

    // Use enhanced interactive chart functions
    drawAreaChartEnhanced(soyAmazonVsNon);
    drawFertilizerChartEnhanced(fertilizerSeries);
    initTreemapStory();
    // setupScrollama is called AFTER map loads
}

function initializeMap(boundaryGeo) {
    map = new mapboxgl.Map({
        container: 'map-container',
        style: 'mapbox://styles/mapbox/navigation-night-v1', // Dark theme with colorful/neon accents
        center: chapters['world-view'].center,
        zoom: chapters['world-view'].zoom,
        pitch: chapters['world-view'].pitch,
        bearing: chapters['world-view'].bearing,
        interactive: false, // Disable all user interaction
        attributionControl: false
    });

    map.on('load', () => {
        // Override water color to dark blue
        if (map.getLayer('water')) {
            map.setPaintProperty('water', 'fill-color', '#001f3f'); // Deep dark blue
        }

        map.addSource('amazon-boundary', { type: 'geojson', data: boundaryGeo });

        map.addLayer({
            'id': 'amazon-boundary-fill',
            'type': 'fill',
            'source': 'amazon-boundary',
            'paint': {
                'fill-color': '#4a7c59',
                'fill-opacity': 0
            }
        });

        map.addLayer({
            'id': 'amazon-boundary-line',
            'type': 'line',
            'source': 'amazon-boundary',
            'paint': {
                'line-color': '#4a7c59',
                'line-width': 2.5,
                'line-opacity': 0
            }
        });

        setLayerPaint('amazon-boundary-fill', 'fill-opacity-transition', { duration: 400, delay: 0 });
        setLayerPaint('amazon-boundary-fill', 'fill-color-transition', { duration: 400, delay: 0 });
        setLayerPaint('amazon-boundary-line', 'line-opacity-transition', { duration: 400, delay: 0 });
        setLayerPaint('amazon-boundary-line', 'line-color-transition', { duration: 400, delay: 0 });

        addStateChoropleth().then(() => {
            addStateExtrusion(); // Add the 3D layer
            addSoyHotspotMarkers();
            updateLegend('world-view');
            updateMapLayers('world-view');
            setupScrollama();
        });
    });

    map.on('error', (e) => console.error("❌ MAPBOX ERROR:", e.error));
}

async function addStateChoropleth() {
    const statesUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson";
    const statesGeo = await d3.json(statesUrl);

    const idRegistry = new Map();
    statesGeo.features.forEach((feature, idx) => {
        feature.id = feature.id ?? idx;
        idRegistry.set(feature.properties.sigla, feature.id);
        const metric = metricsData.metricsMap.get(feature.properties.sigla);
        feature.properties.growth_ratio = metric ? metric.ratio || 1 : 1;
        feature.properties.area_2024 = metric ? metric.areaLatest : 0;
    });
    stateFeatureIdBySigla = idRegistry;

    map.addSource('brazil-states', { 'type': 'geojson', 'data': statesGeo });

    map.addLayer({
        'id': 'states-growth',
        'type': 'fill',
        'source': 'brazil-states',
        'paint': {
            'fill-color': [
                'interpolate', ['linear'], ['get', 'growth_ratio'],
                1, '#fff7ec',
                5, '#fee8c8',
                10, '#fdd49e',
                25, '#fdbb84',
                50, '#fc8d59',
                100, '#ef6548',
                200, '#d7301f',
                500, '#990000'
            ],
            'fill-opacity': 0
        }
    });

    map.addLayer({
        'id': 'states-highlight',
        'type': 'fill',
        'source': 'brazil-states',
        'paint': {
            'fill-color': ['coalesce', ['feature-state', 'highlightColor'], '#ffc857'],
            'fill-opacity': ['case', ['boolean', ['feature-state', 'highlight'], false], ['coalesce', ['feature-state', 'highlightOpacity'], 0.75], 0]
        }
    });

    map.addLayer({
        id: 'fertilizer-embers',
        type: 'fill',
        source: 'brazil-states',
        paint: {
            'fill-color': buildFireExpression(0),
            'fill-opacity': 0
        }
    }, 'states-highlight');

    setLayerPaint('states-growth', 'fill-opacity-transition', { duration: 450, delay: 0 });
    setLayerPaint('states-growth', 'fill-color-transition', { duration: 450, delay: 0 });
    setLayerPaint('states-highlight', 'fill-opacity-transition', { duration: 450, delay: 0 });
    setLayerPaint('fertilizer-embers', 'fill-opacity-transition', { duration: 650, delay: 0 });
    setLayerPaint('fertilizer-embers', 'fill-color-transition', { duration: 300, delay: 0 });

    map.addLayer({
        'id': 'states-outline',
        'type': 'line',
        'source': 'brazil-states',
        'paint': {
            'line-color': '#888',
            'line-width': 0.5,
            'line-opacity': 0.3
        }
    });

    map.addLayer({
        'id': 'states-highlight-outline',
        'type': 'line',
        'source': 'brazil-states',
        'paint': {
            'line-color': ['coalesce', ['feature-state', 'highlightLineColor'], '#c87c00'],
            'line-width': ['case', ['boolean', ['feature-state', 'highlight'], false], 2.5, 0],
            'line-opacity': ['case', ['boolean', ['feature-state', 'highlight'], false], 0.95, 0]
        }
    });
    setLayerPaint('states-highlight-outline', 'line-opacity-transition', { duration: 400, delay: 0 });
    setLayerPaint('states-highlight-outline', 'line-color-transition', { duration: 400, delay: 0 });

    map.on('mousemove', 'states-growth', handleMapHover);
    map.on('mouseleave', 'states-growth', () => tooltip.classed("show", false));

    return Promise.resolve();
}

function addStateExtrusion() {
    if (map.getLayer('states-extrusion')) return;
    map.addLayer({
        'id': 'states-extrusion',
        'type': 'fill-extrusion',
        'source': 'brazil-states',
        'paint': {
            'fill-extrusion-color': [
                'interpolate', ['linear'], ['get', 'growth_ratio'],
                1, '#fff7ec',
                50, '#fc8d59',
                500, '#990000'
            ],
            'fill-extrusion-height': 0, // Start at 0 for animation
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.65
        }
    });

    // Set transition parameters
    setLayerPaint('states-extrusion', 'fill-extrusion-opacity-transition', { duration: 450, delay: 0 });
    setLayerPaint('states-extrusion', 'fill-extrusion-height-transition', { duration: 2000, delay: 500 }); // Slower growth

    // Trigger animation to full height after mount
    setTimeout(() => {
        if (!map || !map.getLayer('states-extrusion')) return;
        map.setPaintProperty('states-extrusion', 'fill-extrusion-height', [
            'case',
            ['boolean', ['feature-state', 'extrude'], false],
            ['interpolate', ['linear'], ['get', 'growth_ratio'],
                1, 40000,
                10, 90000,
                50, 150000,
                200, 220000
            ],
            0
        ]);
    }, 100);
}

function addSoyHotspotMarkers() {
    if (!map) return;
    soyMarkers.forEach(marker => marker.remove());
    soyMarkers = soyHotspots.map((spot) => {
        const markerEl = document.createElement('button');
        markerEl.type = 'button';
        markerEl.className = 'soy-marker';
        markerEl.setAttribute('aria-label', `${spot.name} soy hub`);

        const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true,
            offset: 18
        }).setHTML(`<strong>${spot.name}</strong><br>${spot.description}`);

        return new mapboxgl.Marker({ element: markerEl, anchor: 'center' })
            .setLngLat(spot.coordinates)
            .setPopup(popup)
            .addTo(map);
    });
}

function toggleSoyMarkers(isVisible) {
    soyMarkers.forEach(marker => {
        const element = marker.getElement();
        if (!element) return;
        if (!element.style.transition) {
            element.style.transition = 'opacity 0.35s ease';
        }
        element.style.opacity = isVisible ? '1' : '0';
        element.style.pointerEvents = isVisible ? 'auto' : 'none';
    });
}

function clearStateHighlights() {
    if (!map || !map.isStyleLoaded()) return;
    highlightedStateIds.forEach(id => {
        map.setFeatureState({ source: 'brazil-states', id }, { highlight: false });
    });
    highlightedStateIds = new Set();
}

function updateStateHighlights(chapter) {
    if (!map || !map.isStyleLoaded()) return;
    const plan = getChapterPlan(chapter);
    const highlightConfig = plan?.highlights;

    if (!highlightConfig || !Array.isArray(highlightConfig.states) || highlightConfig.states.length === 0) {
        clearStateHighlights();
        return;
    }

    const desired = new Set();
    const color = highlightConfig.color || '#ffc857';
    const lineColor = highlightConfig.lineColor || '#c87c00';
    const opacity = highlightConfig.opacity ?? 0.75;
    highlightConfig.states.forEach(sigla => {
        const id = stateFeatureIdBySigla.get(sigla);
        if (id === undefined) return;
        map.setFeatureState({ source: 'brazil-states', id }, {
            highlight: true,
            highlightColor: color,
            highlightLineColor: lineColor,
            highlightOpacity: opacity
        });
        desired.add(id);
    });

    highlightedStateIds.forEach(id => {
        if (!desired.has(id)) {
            map.setFeatureState({ source: 'brazil-states', id }, { highlight: false });
        }
    });

    highlightedStateIds = desired;
}

function handleMapHover(e) {
    if (e.features.length > 0) {
        const props = e.features[0].properties;
        if (props.area_2024 === 0) return;

        tooltip.classed("show", true)
            .html(
                `<strong>${props.name || props.sigla}</strong><br>` +
                `Soy Area: ${formatMillions(props.area_2024)} Mha<br>` +
                `Growth Factor: ${props.growth_ratio.toFixed(1)}x`
            )
            .style("left", `${e.originalEvent.pageX + 12}px`)
            .style("top", `${e.originalEvent.pageY - 28}px`);
    }
}

const sceneHooks = {
    'mato-grosso-boom': () => pulseAreaChart(),
    'arc-of-fire': () => pulseAreaChart(),
    'fertilizer-yield': () => pulseFertilizerLine(),
    'final-cost': () => {
        pulseAreaChart();
        pulseFertilizerLine();
    }
};

function setupScrollama() {
    const scroller = scrollama();

    scroller
        .setup({
            step: '.step',
            offset: 0.6,
            debug: false,
        })
        .onStepEnter(response => {
            const chapterID = response.element.getAttribute('data-step');
            const chapter = chapters[chapterID];

            document.querySelectorAll('.step').forEach(s => s.classList.remove('is-active'));
            response.element.classList.add('is-active');
            highlightStoryCharts(chapterID);
            runSceneHook(chapterID);

            if (chapterID === activeChapterId) {
                return;
            }

            activeChapterId = chapterID;

            if (chapter && map) {
                const flyOptions = buildFlyOptions(chapter);
                map.flyTo(flyOptions);
                updateMapLayers(chapterID, chapter.extrudeState);
                updateLegend(chapterID);
            }
        })
        .onStepExit(response => {
            const chapterID = response.element.getAttribute('data-step');
            if (chapterID === 'final-cost' && response.direction === 'down') {
                hideLegend();
                highlightStoryCharts(null);
            }
            if (chapterID === 'world-view' && response.direction === 'up') {
                hideLegend();
            }
        });

    window.addEventListener('resize', scroller.resize);
}

function buildFlyOptions(chapterConfig) {
    const { center, zoom, pitch, bearing, duration, curve } = chapterConfig;
    const options = {
        center,
        zoom,
        pitch,
        bearing,
        essential: true,
        curve: curve ?? 1.2,
        easing: (t) => 1 - Math.pow(1 - t, 3)
    };
    if (duration) {
        options.duration = duration;
    }
    return options;
}

function runSceneHook(chapterID) {
    const hook = sceneHooks[chapterID];
    if (hook) {
        hook();
    }
}

let currentlyExtruded = null;

function updateMapLayers(chapter, extrudeStateId = null) {
    if (!map || !map.isStyleLoaded()) return;

    if (currentlyExtruded !== null) {
        map.setFeatureState({ source: 'brazil-states', id: currentlyExtruded }, { extrude: false });
        currentlyExtruded = null;
    }

    if (extrudeStateId) {
        const targetId = stateFeatureIdBySigla.get(extrudeStateId);
        if (targetId !== undefined) {
            map.setFeatureState({ source: 'brazil-states', id: targetId }, { extrude: true });
            currentlyExtruded = targetId;
        }
    }

    const channels = getLegendChannels(chapter);
    applyLegendDrivenLayers(chapter, channels);
    updateStateHighlights(chapter);
}

function updateLegend(chapter) {
    const legendEl = document.getElementById('map-legend');
    if (!legendEl) return;
    legendEl.innerHTML = '';

    if (!chapter) {
        hideLegend();
        return;
    }

    const plan = getChapterPlan(chapter);
    if (!plan || !plan.legend || plan.legend.length === 0) {
        hideLegend();
        return;
    }

    const activeChannels = getLegendChannels(chapter);

    plan.legend.forEach(entry => {
        if (entry.channel && !activeChannels[entry.channel]) return;
        if (entry.type === 'swatch') {
            const section = createLegendSection(entry.title);
            section.appendChild(createSwatchRow(entry.color || '#4a7c59', entry.label || ''));
            legendEl.appendChild(section);
        } else if (entry.type === 'gradient') {
            const section = createLegendSection(entry.title);
            const gradient = document.createElement('div');
            gradient.className = 'legend-gradient';
            gradient.style.background = entry.gradient || SOY_GROWTH_GRADIENT;
            section.appendChild(gradient);
            if (entry.caption) {
                const caption = document.createElement('span');
                caption.className = 'legend-caption';
                caption.textContent = entry.caption;
                section.appendChild(caption);
            }
            legendEl.appendChild(section);
        } else if (entry.type === 'soy') {
            legendEl.appendChild(createSoyLegendRow(entry.title, entry.label));
        }
    });

    showLegend();
}

function createLegendSection(title) {
    const section = document.createElement('div');
    section.className = 'legend-section';
    if (title) {
        const heading = document.createElement('p');
        heading.className = 'legend-title';
        heading.textContent = title;
        section.appendChild(heading);
    }
    return section;
}

function createSwatchRow(color, label) {
    const row = document.createElement('div');
    row.className = 'legend-row';
    const swatch = document.createElement('span');
    swatch.className = 'legend-swatch';
    swatch.style.background = color;
    row.appendChild(swatch);
    const text = document.createElement('span');
    text.className = 'legend-text';
    text.textContent = label;
    row.appendChild(text);
    return row;
}

function createSoyLegendRow(title = 'Soy frontier hubs', label = 'Key plantation hubs (Sorriso, Santarém, MATOPIBA)') {
    const section = createLegendSection(title);
    const row = document.createElement('div');
    row.className = 'legend-row';
    const icon = document.createElement('span');
    icon.className = 'legend-icon';
    const img = document.createElement('img');
    img.src = 'krishna_data/soy-pin.svg';
    img.alt = 'Soy crop icon';
    icon.appendChild(img);
    row.appendChild(icon);
    const text = document.createElement('span');
    text.className = 'legend-text';
    text.textContent = label || 'Key plantation hubs (Sorriso, Santarém, MATOPIBA)';
    row.appendChild(text);
    section.appendChild(row);
    return section;
}

function showLegend() {
    const legendEl = document.getElementById('map-legend');
    if (legendEl) legendEl.classList.remove('is-hidden');
}

function hideLegend() {
    const legendEl = document.getElementById('map-legend');
    if (legendEl) legendEl.classList.add('is-hidden');
    applyLegendDrivenLayers(null, legendChannelTemplate);
    clearStateHighlights();
}

function highlightStoryCharts(chapter) {
    const areaCard = document.getElementById('area-card');
    const fertilizerCard = document.getElementById('fertilizer-card');
    if (!areaCard || !fertilizerCard) return;

    const areaChapters = ['mato-grosso-boom', 'arc-of-fire', 'final-cost'];
    const fertilizerChapters = ['fertilizer-yield', 'final-cost'];

    areaCard.classList.toggle('is-highlight', areaChapters.includes(chapter));
    fertilizerCard.classList.toggle('is-highlight', fertilizerChapters.includes(chapter));
}

function drawAreaChart(rows) {
    const { inside, outside } = rows.reduce((acc, row) => {
        acc[row.amazonia ? "inside" : "outside"].push(row);
        return acc;
    }, { inside: [], outside: [] });

    const container = d3.select("#area-chart");
    const width = container.node().getBoundingClientRect().width;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3.scaleLinear().domain(d3.extent(rows, d => d.ano)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(rows, d => d.area_colhida_ha)]).range([height - margin.bottom, margin.top]);

    const area = d3.area().x(d => x(d.ano)).y0(y(0)).y1(d => y(d.area_colhida_ha)).curve(d3.curveCatmullRom.alpha(0.4));

    svg.append("path").datum(outside).attr("fill", "#d1cdc1").attr("d", area);
    svg.append("path").datum(inside).attr("fill", "var(--accent)").attr("opacity", 0.8).attr("d", area);

    const axisTicks = {
        color: "var(--muted)",
        font: "'Architects Daughter', cursive"
    };
    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d"))).call(g => g.selectAll(".domain, .tick line").attr("stroke", axisTicks.color)).call(g => g.selectAll("text").attr("fill", axisTicks.color).attr("font-family", axisTicks.font));
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y).ticks(6).tickFormat(d => `${(d / 1e6).toFixed(0)}M`)).call(g => g.selectAll(".domain, .tick line").attr("stroke", axisTicks.color)).call(g => g.selectAll("text").attr("fill", axisTicks.color).attr("font-family", axisTicks.font));
}

function drawFertilizerChart(rows) {
    const container = d3.select("#fertilizer-chart");
    const width = container.node().getBoundingClientRect().width;
    const height = 300;
    const margin = { top: 28, right: 24, bottom: 46, left: 64 };

    const svg = container.append("svg").attr("viewBox", `0 0 ${width} ${height}`);
    const x = d3.scaleLinear().domain(d3.extent(rows, d => d.year)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, d3.max(rows, d => d.kgPerHa)]).nice().range([height - margin.bottom, margin.top]);

    const line = d3.line().x(d => x(d.year)).y(d => y(d.kgPerHa)).curve(d3.curveCatmullRom.alpha(0.5));

    svg.append("path").datum(rows).attr("fill", "none").attr("stroke", "var(--accent-dark)").attr("stroke-width", 3.5).attr("d", line);

    const axisTicks = {
        color: "var(--muted)",
        font: "'Architects Daughter', cursive"
    };
    svg.append("g").attr("transform", `translate(0, ${height - margin.bottom})`).call(d3.axisBottom(x).ticks(7).tickFormat(d3.format("d"))).call(g => g.selectAll(".domain, .tick line").attr("stroke", axisTicks.color)).call(g => g.selectAll("text").attr("fill", axisTicks.color).attr("font-family", axisTicks.font));
    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).call(d3.axisLeft(y).ticks(6)).call(g => g.selectAll(".domain, .tick line").attr("stroke", axisTicks.color)).call(g => g.selectAll("text").attr("fill", axisTicks.color).attr("font-family", axisTicks.font));
}

function computeStateMetrics(rows) {
    const amazonRows = rows.filter(d => d.amazonia && d.uf);
    const yearsSet = new Set();
    amazonRows.forEach(d => yearsSet.add(d.ano));

    const grouped = d3.rollup(amazonRows, entries => {
        const byYear = d3.rollup(entries, v => d3.sum(v, d => d.area_colhida_ha), d => d.ano);
        const series = Array.from(byYear, ([year, area]) => ({ year: +year, area }))
            .sort((a, b) => a.year - b.year);
        const area2000 = series.find(d => d.year === 2000)?.area || 0;
        const latestEntry = series[series.length - 1] || { area: 0 };
        const change = latestEntry.area - area2000;
        const ratio = area2000 > 1000 ? latestEntry.area / area2000 : (latestEntry.area > 0 ? 500 : 1);
        return { area2000, areaLatest: latestEntry.area, change, ratio, series };
    }, d => d.uf);

    const metrics = Array.from(grouped, ([uf, stats]) => ({ uf, ...stats }))
        .sort((a, b) => b.change - a.change);

    const stateSeries = new Map(metrics.map(d => [d.uf, d.series]));
    const metricsMap = new Map(metrics.map(d => [d.uf, d]));
    const years = Array.from(yearsSet).sort((a, b) => a - b);

    return { metrics, metricsMap, stateSeries, years };
}

function formatMillions(value) {
    if (!Number.isFinite(value)) return "0";
    return (value / 1_000_000).toFixed(1);
}

function parseSoyYear(row) {
    return {
        ano: +row.ano,
        amazonia: parseBoolean(row.amazonia_legal),
        area_colhida_ha: +row.area_colhida_ha,
    };
}

function parseSoyMunicipal(row) {
    return {
        ano: +row.ano,
        uf: row.uf_sigla,
        amazonia: parseBoolean(row.amazonia_legal),
        area_colhida_ha: +row.area_colhida_ha,
    };
}

function parseFertilizer(row) {
    return {
        year: +row.year,
        kgPerHa: +row.fertilizer_kg_per_ha
    };
}

function parseBoolean(value) {
    const normalized = String(value).trim().toLowerCase();
    return normalized === "true" || normalized === "1";
}

function startFertilizerFire(targetOpacity = 0.4) {
    fertilizerFireTargetOpacity = targetOpacity;
    if (!map || !map.isStyleLoaded()) return;
    if (!map.getLayer('fertilizer-embers')) return;
    if (fertilizerFireHandle) return;

    const animate = () => {
        if (!map || !map.isStyleLoaded() || !map.getLayer('fertilizer-embers')) {
            fertilizerFireHandle = null;
            return;
        }

        fertilizerFirePhase += 0.02;
        const blend = (Math.sin(fertilizerFirePhase * 0.8) + 1) / 2;
        map.setPaintProperty('fertilizer-embers', 'fill-color', buildFireExpression(blend));

        const pulse = fertilizerFireTargetOpacity + 0.08 * Math.sin(fertilizerFirePhase * 1.6);
        setLayerPaint('fertilizer-embers', 'fill-opacity', Math.max(0, pulse));
        fertilizerFireHandle = requestAnimationFrame(animate);
    };

    fertilizerFireHandle = requestAnimationFrame(animate);
}

function stopFertilizerFire() {
    if (fertilizerFireHandle) {
        cancelAnimationFrame(fertilizerFireHandle);
        fertilizerFireHandle = null;
    }
    fertilizerFirePhase = 0;
    if (map && map.isStyleLoaded() && map.getLayer('fertilizer-embers')) {
        setLayerPaint('fertilizer-embers', 'fill-opacity', 0);
        map.setPaintProperty('fertilizer-embers', 'fill-color', buildFireExpression(0));
    }
}

function buildFireExpression(blend = 0) {
    const expression = ['interpolate', ['linear'], ['get', 'growth_ratio']];
    FIRE_GRADIENT_STOPS.forEach((stop, idx) => {
        const base = FIRE_BASE_COLORS[idx % FIRE_BASE_COLORS.length];
        const glow = FIRE_GLOW_COLORS[idx % FIRE_GLOW_COLORS.length];
        expression.push(stop, mixColors(base, glow, blend));
    });
    return expression;
}

function mixColors(baseHex, glowHex, blend) {
    const base = hexToRgb(baseHex);
    const glow = hexToRgb(glowHex);
    const mixed = {
        r: Math.round(base.r + (glow.r - base.r) * blend),
        g: Math.round(base.g + (glow.g - base.g) * blend),
        b: Math.round(base.b + (glow.b - base.b) * blend),
    };
    return rgbToHex(mixed);
}

function hexToRgb(hex) {
    const normalized = hex.replace('#', '');
    const bigint = parseInt(normalized, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

function rgbToHex({ r, g, b }) {
    return `#${[r, g, b]
        .map((value) => {
            const hex = value.toString(16);
            return hex.length === 1 ? `0${hex}` : hex;
        })
        .join('')}`;
}
// =========================================
// ENHANCED INTERACTIVE CHART FUNCTIONS
// =========================================

function drawAreaChartEnhanced(rows) {
    const width = 640;
    const height = 320;
    const margin = { top: 32, right: 32, bottom: 48, left: 72 };

    const svg = d3.select('#area-chart')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove();

    const inside = rows.filter(d => d.amazonia);
    const outside = rows.filter(d => !d.amazonia);
    const insideByYear = new Map(inside.map(d => [d.ano, d]));
    const outsideByYear = new Map(outside.map(d => [d.ano, d]));
    const years = Array.from(new Set(rows.map(d => d.ano))).sort((a, b) => a - b);

    const x = d3.scaleLinear().domain(d3.extent(years)).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear()
        .domain([0, d3.max(rows, d => d.area_colhida_ha)]).nice()
        .range([height - margin.bottom, margin.top]);

    const area = d3.area()
        .x(d => x(d.ano))
        .y0(y(0))
        .y1(d => y(d.area_colhida_ha))
        .curve(d3.curveCatmullRom.alpha(0.4));

    const deltaSeries = years.map(year => {
        const insideValue = insideByYear.get(year)?.area_colhida_ha || 0;
        const outsideValue = outsideByYear.get(year)?.area_colhida_ha || 0;
        return {
            ano: year,
            higher: Math.max(insideValue, outsideValue),
            lower: Math.min(insideValue, outsideValue)
        };
    });

    const ribbon = d3.area()
        .x(d => x(d.ano))
        .y0(d => y(d.lower))
        .y1(d => y(d.higher))
        .curve(d3.curveCatmullRom.alpha(0.4));

    const deltaRibbon = svg.append('path')
        .datum(deltaSeries)
        .attr('class', 'area-delta')
        .attr('fill', 'rgba(255,255,255,0.35)')
        .attr('d', ribbon)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .attr('opacity', 1);

    const outsidePath = svg.append('path')
        .attr('class', 'area-fill area-outside')
        .datum(outside)
        .attr('fill', 'rgba(166, 190, 179, 0.5)')
        .attr('d', area)
        .attr('opacity', 0);

    const insidePath = svg.append('path')
        .attr('class', 'area-fill area-inside')
        .datum(inside)
        .attr('fill', 'rgba(32, 106, 93, 0.82)')
        .attr('d', area)
        .attr('opacity', 0);

    outsidePath.transition().duration(900).attr('opacity', 1);
    insidePath.transition().delay(150).duration(900).attr('opacity', 1);

    const axisBottom = svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format('d')));

    const axisLeft = svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${(d / 1e6).toFixed(0)}M ha`));

    axisBottom.selectAll('text').attr('fill', 'var(--muted)');
    axisLeft.selectAll('text').attr('fill', 'var(--muted)');

    const hoverLine = svg.append('line')
        .attr('class', 'hover-line')
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .style('stroke', '#1a3c32')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '6 4')
        .style('opacity', 0);

    const chartTooltip = d3.select('body')
        .selectAll('.area-chart-tooltip')
        .data([null])
        .join('div')
        .attr('class', 'tooltip area-chart-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(13, 24, 21, 0.92)')
        .style('color', '#fff')
        .style('padding', '0.75rem 1rem')
        .style('border-radius', '6px')
        .style('font-size', '0.85rem')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 1000);

    const focusCard = svg.append('g')
        .attr('class', 'area-focus-card')
        .attr('transform', `translate(${width - margin.right - 190}, ${margin.top - 12})`)
        .style('opacity', 0);

    focusCard.append('rect')
        .attr('width', 190)
        .attr('height', 90)
        .attr('rx', 12)
        .attr('fill', 'rgba(255,255,255,0.95)')
        .attr('stroke', 'rgba(25,68,55,0.25)');

    const focusYearText = focusCard.append('text')
        .attr('x', 14)
        .attr('y', 22)
        .attr('fill', '#1d1d1f')
        .attr('font-size', '1rem')
        .attr('font-weight', 700);

    const focusInsideText = focusCard.append('text')
        .attr('x', 14)
        .attr('y', 40)
        .attr('fill', '#206a5d')
        .attr('font-size', '0.82rem');

    const focusOutsideText = focusCard.append('text')
        .attr('x', 14)
        .attr('y', 58)
        .attr('fill', '#4f4f4f')
        .attr('font-size', '0.82rem');

    const focusGapText = focusCard.append('text')
        .attr('x', 14)
        .attr('y', 76)
        .attr('fill', '#d45a00')
        .attr('font-size', '0.78rem');

    const legend = svg.append('g')
        .attr('class', 'area-legend')
        .attr('transform', `translate(${margin.left}, ${margin.top - 18})`);

    const toggleState = { inside: true, outside: true };
    const legendData = [
        { key: 'inside', label: 'Amazon Legal', color: 'rgba(32, 106, 93, 0.9)' },
        { key: 'outside', label: 'Rest of Brazil', color: 'rgba(166, 190, 179, 0.9)' }
    ];

    legendData.forEach((series, idx) => {
        const chip = legend.append('g')
            .attr('class', 'legend-chip')
            .attr('transform', `translate(${idx * 170}, 0)`)
            .style('cursor', 'pointer')
            .on('click', () => {
                toggleState[series.key] = !toggleState[series.key];
                chip.classed('is-disabled', !toggleState[series.key]);
                updateVisibility();
            });

        chip.append('rect')
            .attr('width', 14)
            .attr('height', 14)
            .attr('rx', 3)
            .attr('fill', series.color);

        chip.append('text')
            .attr('x', 22)
            .attr('y', 11)
            .attr('fill', '#1d1d1f')
            .attr('font-size', '0.8rem')
            .text(series.label);
    });

    const playControl = svg.append('g')
        .attr('class', 'chart-play-control')
        .attr('transform', `translate(${width - margin.right - 140}, ${height - margin.bottom + 28})`)
        .style('cursor', 'pointer');

    playControl.append('rect')
        .attr('width', 130)
        .attr('height', 28)
        .attr('rx', 16)
        .attr('fill', '#194437')
        .attr('opacity', 0.92);

    const playLabel = playControl.append('text')
        .attr('x', 65)
        .attr('y', 19)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', '0.78rem')
        .text('Play timeline');

    let pinnedYear = null;
    let playbackTimer = null;

    playControl.on('click', () => {
        if (playbackTimer) {
            stopPlayback();
        } else {
            startPlayback();
        }
    });

    svg.append('text')
        .attr('class', 'reset-pin')
        .attr('x', margin.left)
        .attr('y', height - margin.bottom + 30)
        .attr('fill', '#206a5d')
        .attr('font-size', '0.78rem')
        .style('cursor', 'pointer')
        .text('Reset pin')
        .on('click', () => {
            pinnedYear = null;
            hideFocusState();
        });

    const interactionOverlay = svg.append('rect')
        .attr('class', 'interaction-overlay')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', 'transparent')
        .on('mousemove', (event) => {
            const [mx] = d3.pointer(event);
            const year = clampYear(Math.round(x.invert(mx)));
            setFocusYear(year, { pointer: { x: event.pageX, y: event.pageY } });
        })
        .on('mouseleave', () => {
            if (pinnedYear === null) {
                hideFocusState();
            }
        })
        .on('click', (event) => {
            const [mx] = d3.pointer(event);
            const year = clampYear(Math.round(x.invert(mx)));
            pinnedYear = year;
            setFocusYear(year, { pin: true, pointer: { x: event.pageX, y: event.pageY } });
        });

    updateVisibility();

    function updateVisibility() {
        insidePath.transition().duration(250).attr('opacity', toggleState.inside ? 1 : 0.1);
        outsidePath.transition().duration(250).attr('opacity', toggleState.outside ? 1 : 0.1);
        deltaRibbon.attr('opacity', toggleState.inside && toggleState.outside ? 1 : 0.15);
        if (!toggleState.inside && !toggleState.outside) {
            hideFocusState();
        }
    }

    function clampYear(value) {
        return Math.max(years[0], Math.min(years[years.length - 1], value));
    }

    function hideFocusState() {
        focusCard.transition().duration(180).style('opacity', 0);
        hoverLine.transition().duration(150).style('opacity', 0);
        chartTooltip.transition().duration(120).style('opacity', 0);
    }

    function setFocusYear(year, { pin = false, animate = false, pointer = null } = {}) {
        const insideDatum = insideByYear.get(year);
        const outsideDatum = outsideByYear.get(year);
        if ((!insideDatum && !outsideDatum) || (!toggleState.inside && !toggleState.outside)) {
            hideFocusState();
            return;
        }

        const insideValue = toggleState.inside ? insideDatum?.area_colhida_ha ?? 0 : 0;
        const outsideValue = toggleState.outside ? outsideDatum?.area_colhida_ha ?? 0 : 0;
        const total = insideValue + outsideValue;
        const gap = Math.abs(insideValue - outsideValue);
        const shareInside = total ? (insideValue / total) * 100 : 0;
        const shareOutside = total ? (outsideValue / total) * 100 : 0;

        focusCard.style('opacity', 1);
        focusYearText.text(pin && pinnedYear === year ? `${year} · pinned` : year);
        focusInsideText.text(`Amazon: ${(insideValue / 1e6).toFixed(2)} M ha (${shareInside.toFixed(1)}%)`);
        focusOutsideText.text(`Rest: ${(outsideValue / 1e6).toFixed(2)} M ha (${shareOutside.toFixed(1)}%)`);
        focusGapText.text(total ? `Gap: ${(gap / 1e6).toFixed(2)} M ha` : 'Gap: —');

        hoverLine
            .style('opacity', 0.88)
            .transition()
            .duration(animate ? 260 : 100)
            .attr('x1', x(year))
            .attr('x2', x(year));

        const bounds = svg.node().getBoundingClientRect();
        const tooltipX = pointer?.x ?? bounds.left + x(year);
        const tooltipY = pointer?.y ?? bounds.top + y(Math.max(insideValue, outsideValue));

        chartTooltip
            .style('opacity', 1)
            .html(`
                <strong>${year}</strong><br>
                Amazon: ${(insideValue / 1e6).toFixed(2)} M ha<br>
                Rest: ${(outsideValue / 1e6).toFixed(2)} M ha<br>
                Share gap: ${(Math.abs(shareInside - shareOutside)).toFixed(1)} pts
            `)
            .style('left', `${tooltipX + 14}px`)
            .style('top', `${tooltipY - 32}px`);

        if (pin) {
            pinnedYear = year;
        } else if (pinnedYear && year !== pinnedYear) {
            pinnedYear = null;
        }
    }

    function startPlayback() {
        stopPlayback();
        let index = 0;
        playLabel.text('Stop replay');
        playbackTimer = d3.interval(() => {
            setFocusYear(years[index], { animate: true });
            index += 1;
            if (index >= years.length) {
                stopPlayback();
            }
        }, 320);
    }

    function stopPlayback() {
        if (playbackTimer) {
            playbackTimer.stop();
            playbackTimer = null;
        }
        playLabel.text('Play timeline');
    }
}

function drawFertilizerChartEnhanced(rows) {
    const width = 640;
    const height = 320;
    const margin = { top: 36, right: 30, bottom: 48, left: 70 };

    const svg = d3.select('#fertilizer-chart')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove();

    const extentYears = d3.extent(rows, d => d.year);
    const maxKg = d3.max(rows, d => d.kgPerHa);
    const sustainableThreshold = 220;
    const riskThreshold = 320;

    const x = d3.scaleLinear().domain(extentYears).range([margin.left, width - margin.right]);
    const y = d3.scaleLinear().domain([0, Math.max(maxKg, riskThreshold)]).nice().range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.kgPerHa))
        .curve(d3.curveCatmullRom.alpha(0.65));

    const rollingAvg = rows.map((d, i) => {
        const window = rows.slice(Math.max(0, i - 2), Math.min(rows.length, i + 3));
        return { year: d.year, kgPerHa: d3.mean(window, p => p.kgPerHa) };
    });

    const defs = svg.append('defs');
    const glowGradient = defs.append('linearGradient')
        .attr('id', 'fert-area-gradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');

    glowGradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(212,90,0,0.45)');
    glowGradient.append('stop').attr('offset', '60%').attr('stop-color', 'rgba(212,90,0,0.1)');
    glowGradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(212,90,0,0)');

    svg.append('rect')
        .attr('x', margin.left)
        .attr('y', y(riskThreshold))
        .attr('width', width - margin.left - margin.right)
        .attr('height', y(sustainableThreshold) - y(riskThreshold))
        .attr('fill', 'rgba(212, 90, 0, 0.08)');

    svg.append('rect')
        .attr('x', margin.left)
        .attr('y', y(sustainableThreshold))
        .attr('width', width - margin.left - margin.right)
        .attr('height', (height - margin.bottom) - y(sustainableThreshold))
        .attr('fill', 'rgba(32, 106, 93, 0.05)');

    const area = d3.area()
        .x(d => x(d.year))
        .y0(() => y(sustainableThreshold))
        .y1(d => y(d.kgPerHa))
        .curve(d3.curveCatmullRom.alpha(0.5));

    svg.append('path')
        .datum(rows)
        .attr('class', 'fert-area')
        .attr('fill', 'url(#fert-area-gradient)')
        .attr('d', area);

    svg.append('line')
        .attr('class', 'threshold-line')
        .attr('x1', margin.left)
        .attr('x2', width - margin.right)
        .attr('y1', y(sustainableThreshold))
        .attr('y2', y(sustainableThreshold))
        .attr('stroke', '#206a5d')
        .attr('stroke-dasharray', '6 6')
        .attr('stroke-width', 1.5);

    svg.append('text')
        .attr('x', width - margin.right)
        .attr('y', y(sustainableThreshold) - 6)
        .attr('text-anchor', 'end')
        .attr('fill', '#206a5d')
        .attr('font-size', '0.74rem')
        .text('Sustainable frontier (~220 kg/ha)');

    const axisBottom = svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(7).tickFormat(d3.format('d')));

    const axisLeft = svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d} kg/ha`));

    axisBottom.selectAll('text').attr('fill', 'var(--muted)');
    axisLeft.selectAll('text').attr('fill', 'var(--muted)');

    const linePath = svg.append('path')
        .attr('class', 'fertilizer-line')
        .datum(rows)
        .attr('fill', 'none')
        .attr('stroke', '#d45a00')
        .attr('stroke-width', 3)
        .attr('d', line);

    const avgPath = svg.append('path')
        .attr('class', 'fertilizer-avg-line')
        .datum(rollingAvg)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(32,106,93,0.9)')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 6')
        .attr('d', line);

    const totalLength = linePath.node().getTotalLength();
    linePath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1600)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0);

    const yoyMap = new Map(rows.map((d, i) => {
        const prev = rows[i - 1];
        const change = prev ? d.kgPerHa - prev.kgPerHa : 0;
        const pct = prev ? (change / prev.kgPerHa) * 100 : 0;
        return [d.year, { change, pct }];
    }));

    const earliestDatum = rows.reduce((acc, d) => (d.year < acc.year ? d : acc), rows[0]);
    const peakDatum = rows.reduce((acc, d) => (d.kgPerHa > acc.kgPerHa ? d : acc), rows[0]);
    const highlightYears = Array.from(new Set([earliestDatum.year, peakDatum.year]));

    const peakPoints = svg.selectAll('circle.fert-peak')
        .data(rows.filter(d => highlightYears.includes(d.year)))
        .join('circle')
        .attr('class', 'fert-peak')
        .attr('cx', d => x(d.year))
        .attr('cy', d => y(d.kgPerHa))
        .attr('r', 5)
        .attr('fill', '#fff')
        .attr('stroke', '#d45a00')
        .attr('stroke-width', 2);

    const hoverLine = svg.append('line')
        .attr('class', 'hover-line')
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .style('stroke', '#d45a00')
        .style('stroke-width', 1.5)
        .style('stroke-dasharray', '6 4')
        .style('opacity', 0);

    const focusCard = svg.append('g')
        .attr('class', 'fert-focus-card')
        .attr('transform', `translate(${margin.left}, ${margin.top - 10})`)
        .style('opacity', 0);

    focusCard.append('rect')
        .attr('width', 210)
        .attr('height', 92)
        .attr('rx', 12)
        .attr('fill', 'rgba(255,255,255,0.96)')
        .attr('stroke', 'rgba(14,26,23,0.1)');

    const focusYearText = focusCard.append('text')
        .attr('x', 16)
        .attr('y', 24)
        .attr('font-weight', 700)
        .attr('fill', '#1d1d1f');

    const focusKgText = focusCard.append('text')
        .attr('x', 16)
        .attr('y', 44)
        .attr('fill', '#d45a00')
        .attr('font-size', '0.86rem');

    const focusYoyText = focusCard.append('text')
        .attr('x', 16)
        .attr('y', 62)
        .attr('fill', '#4f4f4f')
        .attr('font-size', '0.78rem');

    const focusStatusText = focusCard.append('text')
        .attr('x', 16)
        .attr('y', 80)
        .attr('fill', '#206a5d')
        .attr('font-size', '0.75rem');

    const fertTooltip = d3.select('body')
        .selectAll('.fert-tooltip')
        .data([null])
        .join('div')
        .attr('class', 'tooltip fert-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(13, 24, 21, 0.92)')
        .style('color', 'white')
        .style('padding', '0.75rem 1rem')
        .style('border-radius', '6px')
        .style('font-size', '0.85rem')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('z-index', 1000);

    const bandStart = clampYear(2004);
    const bandEnd = clampYear(2012);
    if (bandEnd > bandStart) {
        svg.append('rect')
            .attr('class', 'fert-annotation-band')
            .attr('x', x(bandStart))
            .attr('y', margin.top)
            .attr('width', x(bandEnd) - x(bandStart))
            .attr('height', height - margin.bottom - margin.top)
            .attr('fill', 'rgba(255, 255, 255, 0.06)');

        svg.append('text')
            .attr('x', x(bandStart) + 6)
            .attr('y', margin.top + 16)
            .attr('fill', '#666')
            .attr('font-size', '0.72rem')
            .text('Arc-of-Fire agribusiness sprint');
    }

    const annotations = [
        { year: 2005, text: 'Credit boom fuels input use', anchor: 'start', dy: -32 },
        { year: rows[rows.length - 1].year, text: 'Frontier soils demand more nutrients', anchor: 'end', dy: -40 }
    ];

    const annotationGroup = svg.append('g').attr('class', 'fert-annotations');
    annotations.forEach(note => {
        const xPos = x(note.year);
        annotationGroup.append('line')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', height - margin.bottom)
            .attr('y2', height - margin.bottom - 34)
            .attr('stroke', 'rgba(212,90,0,0.35)')
            .attr('stroke-dasharray', '4 4');

        annotationGroup.append('text')
            .attr('x', xPos)
            .attr('y', height - margin.bottom - 40)
            .attr('text-anchor', note.anchor)
            .attr('fill', '#7a1f00')
            .attr('font-size', '0.75rem')
            .text(note.text);
    });

    let pinnedYear = null;

    const overlay = svg.append('rect')
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', width - margin.left - margin.right)
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', 'transparent')
        .on('mousemove', (event) => {
            const [mx] = d3.pointer(event);
            const year = clampYear(Math.round(x.invert(mx)));
            setFocusYear(year, { pointer: { x: event.pageX, y: event.pageY } });
        })
        .on('mouseleave', () => {
            if (pinnedYear === null) hideFocus();
        })
        .on('click', (event) => {
            const [mx] = d3.pointer(event);
            pinnedYear = clampYear(Math.round(x.invert(mx)));
            setFocusYear(pinnedYear, { pin: true, pointer: { x: event.pageX, y: event.pageY } });
        });

    svg.append('text')
        .attr('x', width - margin.right)
        .attr('y', margin.top - 8)
        .attr('text-anchor', 'end')
        .attr('fill', '#206a5d')
        .attr('font-size', '0.75rem')
        .style('cursor', 'pointer')
        .text('Clear pin')
        .on('click', () => {
            pinnedYear = null;
            hideFocus();
        });

    setFocusYear(rows[rows.length - 1].year);

    function clampYear(value) {
        return Math.max(extentYears[0], Math.min(extentYears[1], value));
    }

    function hideFocus() {
        focusCard.transition().duration(180).style('opacity', 0);
        hoverLine.transition().duration(150).style('opacity', 0);
        fertTooltip.transition().duration(120).style('opacity', 0);
    }

    function setFocusYear(year, { pin = false, pointer = null } = {}) {
        const datum = rows.reduce((closest, current) => {
            return Math.abs(current.year - year) < Math.abs(closest.year - year) ? current : closest;
        }, rows[0]);
        if (!datum) return;
        const yoy = yoyMap.get(year) || { change: 0, pct: 0 };
        const status = datum.kgPerHa >= riskThreshold
            ? 'Above stress band'
            : (datum.kgPerHa >= sustainableThreshold ? 'Pressured frontier' : 'Below frontier');

        focusCard.style('opacity', 1);
        focusYearText.text(pin && pinnedYear === year ? `${year} · pinned` : year);
        focusKgText.text(`${datum.kgPerHa.toFixed(1)} kg per hectare`);
        focusYoyText.text(`YoY change: ${yoy.change >= 0 ? '+' : ''}${yoy.change.toFixed(1)} kg (${yoy.pct >= 0 ? '+' : ''}${yoy.pct.toFixed(1)}%)`);
        focusStatusText.text(status);

        hoverLine
            .style('opacity', 0.9)
            .attr('x1', x(year))
            .attr('x2', x(year));

        const bounds = svg.node().getBoundingClientRect();
        const tooltipX = pointer?.x ?? bounds.left + x(year);
        const tooltipY = pointer?.y ?? bounds.top + y(datum.kgPerHa);

        fertTooltip
            .style('opacity', 1)
            .html(`
                <strong>${year}</strong><br>
                ${datum.kgPerHa.toFixed(1)} kg/ha<br>
                ${status}
            `)
            .style('left', `${tooltipX + 10}px`)
            .style('top', `${tooltipY - 32}px`);

        if (pin) {
            pinnedYear = year;
        }
    }
}

function pulseAreaChart() {
    const insidePath = d3.select('#area-chart').select('path.area-inside');
    if (insidePath.empty()) return;
    const totalLength = insidePath.node().getTotalLength();
    insidePath.interrupt();
    insidePath
        .attr('stroke', 'rgba(32, 106, 93, 0.85)')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1400)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0)
        .attr('fill-opacity', 0.78)
        .on('end', () => insidePath.attr('stroke', 'none'));
}

function pulseFertilizerLine() {
    const linePath = d3.select('#fertilizer-chart').select('path.fertilizer-line');
    if (linePath.empty()) return;
    const totalLength = linePath.node().getTotalLength();
    linePath.interrupt();
    linePath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1600)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0);

    d3.select('#fertilizer-chart')
        .selectAll('circle.data-point')
        .interrupt()
        .transition()
        .duration(350)
        .attr('r', 6)
        .transition()
        .duration(350)
        .attr('r', 4);
}

function initTreemapStory() {
    if (!treemapStateSeries || !treemapYears) return;
    const container = document.getElementById('treemap-story-vis');
    if (!container) return;

    const svg = d3.select('#treemap-story-vis')
        .append('svg')
        .attr('viewBox', '0 0 960 520')
        .attr('preserveAspectRatio', 'xMidYMid meet');

    const chartGroup = svg.append('g');
    const treemapLayout = d3.treemap().paddingInner(8).round(true);

    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip treemap-story-tooltip')
        .style('opacity', 0);

    const stateUniverse = Array.from(treemapStateSeries.keys());
    const focusGroups = {
        all: { label: 'All Amazon', states: stateUniverse },
        arc: { label: 'Arc of Fire', states: ['MT', 'PA', 'RO', 'MA', 'TO'] },
        shield: { label: 'Forest Shield', states: ['AM', 'AC', 'AP', 'RR'] },
        rivers: { label: 'River Ports', states: ['PA', 'MA', 'AM'] },
    };

    const yearSlider = document.getElementById('treemap-year-slider');
    const yearLabel = document.getElementById('treemap-year-label');
    if (yearSlider && yearLabel) {
        yearSlider.min = treemapYears[0];
        yearSlider.max = treemapYears[treemapYears.length - 1];
        yearSlider.value = treemapCurrentYear;
        yearLabel.textContent = treemapCurrentYear;
        yearSlider.addEventListener('input', (event) => {
            treemapCurrentYear = +event.target.value;
            yearLabel.textContent = treemapCurrentYear;
            renderTreemap();
            if (treemapSelectedState) {
                updateStateSpotlight(treemapSelectedState);
            }
        });
    }

    const focusButtons = document.querySelectorAll('#treemap-focus button');
    focusButtons.forEach(button => {
        button.addEventListener('click', () => {
            focusButtons.forEach(btn => btn.classList.toggle('active', btn === button));
            treemapCurrentFocus = button.dataset.group || 'all';
            renderTreemap();
        });
    });

    window.addEventListener('resize', () => renderTreemap());

    renderTreemap();

    function renderTreemap() {
        const activeKey = focusGroups[treemapCurrentFocus] ? treemapCurrentFocus : 'all';
        const statePool = focusGroups[activeKey].states;
        const nodes = buildTreemapNodes(statePool, treemapCurrentYear);

        const width = container.clientWidth || 960;
        const height = 520;
        svg.attr('viewBox', `0 0 ${width} ${height}`);
        treemapLayout.size([width, height]);

        if (!nodes.length) {
            chartGroup.selectAll('g.treemap-cell').remove();
            treemapSelectedState = null;
            updateStateSpotlight(null);
            return;
        }

        const root = d3.hierarchy({ children: nodes })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);
        treemapLayout(root);

        const ratios = nodes.map(n => n.ratio || 1);
        const ratioExtent = d3.extent(ratios);
        const ratioMin = ratioExtent[0] || 1;
        const ratioMax = ratioExtent[1] && ratioExtent[1] !== ratioExtent[0] ? ratioExtent[1] : ratioMin + 1;
        const colorScale = d3.scaleSequential(d3.interpolateYlOrBr).domain([ratioMin, ratioMax]);

        const cells = chartGroup.selectAll('g.treemap-cell')
            .data(root.leaves(), d => d.data.uf);

        const cellsEnter = cells.enter()
            .append('g')
            .attr('class', 'treemap-cell')
            .attr('opacity', 0);

        cellsEnter.append('rect')
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('stroke', '#fdfcf7')
            .attr('stroke-width', 2)
            .style('cursor', 'pointer');

        cellsEnter.append('text')
            .attr('class', 'cell-label')
            .attr('font-weight', '700')
            .attr('fill', '#1f332c');

        cellsEnter.append('text')
            .attr('class', 'cell-value')
            .attr('fill', '#1f332c')
            .attr('opacity', 0.8)
            .attr('font-size', '0.8rem');

        cells.exit()
            .transition()
            .duration(300)
            .attr('opacity', 0)
            .remove();

        const merged = cellsEnter.merge(cells);

        merged.transition()
            .duration(600)
            .attr('opacity', 1)
            .attr('transform', d => `translate(${d.x0},${d.y0})`);

        merged.select('rect')
            .transition()
            .duration(600)
            .attr('width', d => Math.max(0, d.x1 - d.x0))
            .attr('height', d => Math.max(0, d.y1 - d.y0))
            .attr('fill', d => colorScale(d.data.ratio || 1));

        merged.select('.cell-label')
            .text(d => d.data.uf)
            .attr('x', 12)
            .attr('y', 24)
            .style('opacity', d => hasRoom(d, 60, 36) ? 1 : 0);

        merged.select('.cell-value')
            .text(d => `${formatMillions(d.data.value)} Mha`)
            .attr('x', 12)
            .attr('y', 44)
            .style('opacity', d => hasRoom(d, 80, 50) ? 0.8 : 0);

        merged.classed('is-selected', d => d.data.uf === treemapSelectedState);

        merged.select('rect')
            .on('mousemove', (event, d) => {
                const delta = d.data.change || 0;
                const deltaPrefix = delta >= 0 ? '+' : '−';
                const deltaMagnitude = formatMillions(Math.abs(delta));
                tooltip
                    .style('opacity', 1)
                    .html(`
                        <strong>${d.data.uf}</strong><br>
                        ${formatMillions(d.data.value)} Mha in ${treemapCurrentYear}<br>
                        Δ since 2000: ${deltaPrefix}${deltaMagnitude} Mha<br>
                        Growth: ${d.data.ratio ? d.data.ratio.toFixed(1) + '×' : 'n/a'}
                    `)
                    .style('left', `${event.pageX + 12}px`)
                    .style('top', `${event.pageY - 28}px`);
            })
            .on('mouseleave', () => tooltip.style('opacity', 0))
            .on('click', (event, d) => {
                treemapSelectedState = d.data.uf;
                updateStateSpotlight(treemapSelectedState);
                chartGroup.selectAll('g.treemap-cell')
                    .classed('is-selected', node => node.data.uf === treemapSelectedState);
            });

        if (!treemapSelectedState) {
            treemapSelectedState = nodes[0].uf;
            updateStateSpotlight(treemapSelectedState);
            merged.classed('is-selected', d => d.data.uf === treemapSelectedState);
        } else if (!nodes.some(n => n.uf === treemapSelectedState)) {
            treemapSelectedState = nodes[0]?.uf || null;
            updateStateSpotlight(treemapSelectedState);
            merged.classed('is-selected', d => d.data.uf === treemapSelectedState);
        }
    }

    function buildTreemapNodes(statePool, year) {
        return statePool.map(uf => {
            const series = treemapStateSeries.get(uf) || [];
            const latest = series.find(point => point.year === year) || series[series.length - 1];
            const baseline = series.find(point => point.year === 2000) || series[0];
            return {
                uf,
                value: latest ? latest.area : 0,
                change: latest && baseline ? latest.area - baseline.area : 0,
                ratio: baseline && baseline.area > 0 && latest ? latest.area / baseline.area : null,
                series
            };
        }).filter(d => d.value > 0);
    }

    function hasRoom(node, minWidth, minHeight) {
        return (node.x1 - node.x0) >= minWidth && (node.y1 - node.y0) >= minHeight;
    }
}

function updateStateSpotlight(uf) {
    const panel = document.getElementById('treemap-state-spotlight');
    if (!panel) return;

    const nameEl = panel.querySelector('.state-name');
    const valueEl = panel.querySelector('.state-value');
    const sparkline = d3.select('#treemap-sparkline');
    sparkline.selectAll('*').remove();

    if (!uf || !treemapStateSeries || !treemapStateSeries.has(uf)) {
        if (nameEl) nameEl.textContent = '—';
        if (valueEl) valueEl.textContent = 'Select a state';
        return;
    }

    const series = treemapStateSeries.get(uf);
    if (!series || !series.length) {
        if (nameEl) nameEl.textContent = uf;
        if (valueEl) valueEl.textContent = 'No data available';
        return;
    }

    const latest = series.find(point => point.year === treemapCurrentYear) || series[series.length - 1];
    if (nameEl) nameEl.textContent = uf;
    if (valueEl) valueEl.textContent = `${(latest.area / 1_000_000).toFixed(1)} Mha in ${latest.year}`;

    drawStateSparkline(series);
}

function drawStateSparkline(series) {
    const sparkline = d3.select('#treemap-sparkline')
        .attr('viewBox', '0 0 280 140')
        .attr('preserveAspectRatio', 'xMidYMid meet');
    sparkline.selectAll('*').remove();

    if (!series || !series.length) return;

    const width = 280;
    const height = 140;
    const margin = { top: 16, right: 12, bottom: 28, left: 36 };

    const x = d3.scaleLinear()
        .domain(d3.extent(series, d => d.year))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(series, d => d.area)]).nice()
        .range([height - margin.bottom, margin.top]);

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.area))
        .curve(d3.curveMonotoneX);

    sparkline.append('path')
        .datum(series)
        .attr('fill', 'none')
        .attr('stroke', '#4a7c59')
        .attr('stroke-width', 2)
        .attr('d', line);

    sparkline.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format('d')))
        .call(g => g.selectAll('text').attr('font-size', '0.7rem'));

    sparkline.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y).ticks(3).tickFormat(d => `${(d / 1_000_000).toFixed(1)}M`))
        .call(g => g.selectAll('text').attr('font-size', '0.7rem'));

    const focusPoint = series.find(d => d.year === treemapCurrentYear) || series[series.length - 1];
    if (focusPoint) {
        sparkline.append('circle')
            .attr('cx', x(focusPoint.year))
            .attr('cy', y(focusPoint.area))
            .attr('r', 4)
            .attr('fill', '#d45a00');
    }
}