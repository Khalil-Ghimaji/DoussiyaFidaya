"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface BarChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string
      borderColor?: string
      borderWidth?: number
    }[]
  }
}

export function BarChart({ data }: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Apply default colors if not provided
    const processedData = {
      ...data,
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        backgroundColor:
          dataset.backgroundColor ||
          ["rgba(59, 130, 246, 0.5)", "rgba(16, 185, 129, 0.5)", "rgba(249, 115, 22, 0.5)", "rgba(139, 92, 246, 0.5)"][
            index % 4
          ],
        borderColor:
          dataset.borderColor ||
          ["rgb(59, 130, 246)", "rgb(16, 185, 129)", "rgb(249, 115, 22)", "rgb(139, 92, 246)"][index % 4],
        borderWidth: dataset.borderWidth || 1,
      })),
    }

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: processedData,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} />
}

