import Chart from 'chart.js/auto';
import chartsData from '../data/charts.json';

function initCharts() {
    const chartDefaults = {
        font: {
            family: "'Fustat', ui-sans-serif, system-ui, -apple-system, sans-serif",
            size: 13,
            weight: '500'
        },
        color: '#66C24A'
    };

    // Waste Trend Line Chart
    const wasteTrendCtx = document.getElementById('waste-trend-chart');
    if (wasteTrendCtx instanceof HTMLCanvasElement) {
        new Chart(wasteTrendCtx, {
            type: 'line',
            data: {
                labels: chartsData.wasteTrend.data.map(d => d.year),
                datasets: [{
                    label: 'Million Tonnes',
                    data: chartsData.wasteTrend.data.map(d => d.value),
                    borderColor: '#66C24A',
                    backgroundColor: 'rgba(102, 194, 74, 0.15)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#66C24A',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(11, 19, 32, 0.95)',
                        padding: 14,
                        titleFont: { ...chartDefaults.font, size: 14, weight: '600' },
                        bodyFont: { ...chartDefaults.font, size: 13 },
                        cornerRadius: 10
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(11, 19, 32, 0.08)'
                        },
                        ticks: {
                            font: chartDefaults.font,
                            color: 'rgba(11, 19, 32, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: { ...chartDefaults.font, size: 12 },
                            color: 'rgba(11, 19, 32, 0.7)',
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }

    // Waste Fate Pie Chart
    const wasteFateCtx = document.getElementById('waste-fate-chart');
    if (wasteFateCtx instanceof HTMLCanvasElement) {
        new Chart(wasteFateCtx, {
            type: 'pie',
            data: {
                labels: chartsData.wasteFate.data.map(d => d.category),
                datasets: [{
                    data: chartsData.wasteFate.data.map(d => d.value),
                    backgroundColor: [
                        '#66C24A',
                        '#3EA63B',
                        '#2B8A2E',
                        '#1F6E23',
                        '#145218'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'right',
                        align: 'center',
                        labels: {
                            font: { ...chartDefaults.font, size: 14 },
                            color: 'rgba(11, 19, 32, 0.8)',
                            padding: 12,
                            boxWidth: 16,
                            boxHeight: 16,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(11, 19, 32, 0.95)',
                        padding: 14,
                        titleFont: { ...chartDefaults.font, size: 14, weight: '600' },
                        bodyFont: { ...chartDefaults.font, size: 13 },
                        cornerRadius: 10,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value}M tonnes (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Material Recycling Rates Horizontal Bar Chart
    const materialRatesCtx = document.getElementById('material-rates-chart');
    if (materialRatesCtx instanceof HTMLCanvasElement) {
        new Chart(materialRatesCtx, {
            type: 'bar',
            data: {
                labels: chartsData.materialRecyclingRates.data.map(d => d.material),
                datasets: [{
                    label: 'Recovery Rate (%)',
                    data: chartsData.materialRecyclingRates.data.map(d => d.rate),
                    backgroundColor: '#66C24A',
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(11, 19, 32, 0.95)',
                        padding: 14,
                        titleFont: { ...chartDefaults.font, size: 14, weight: '600' },
                        bodyFont: { ...chartDefaults.font, size: 13 },
                        cornerRadius: 10,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.x + '%';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(11, 19, 32, 0.08)'
                        },
                        ticks: {
                            font: chartDefaults.font,
                            color: 'rgba(11, 19, 32, 0.7)',
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: chartDefaults.font,
                            color: 'rgba(11, 19, 32, 0.7)'
                        }
                    }
                }
            }
        });
    }
}

// Initialize on load
initCharts();

// Reinitialize on view transitions
document.addEventListener('astro:after-swap', initCharts);
