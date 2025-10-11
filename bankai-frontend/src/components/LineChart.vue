<template>
    <Line :data="data" :options="options" />
  </template>
  
  <script setup>
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler, // Importante para preencher a área
  } from 'chart.js';
  import { Line } from 'vue-chartjs';
  
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // Registra o preenchimento
  );
  
  defineProps({
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false,
      })
    }
  });
  </script>