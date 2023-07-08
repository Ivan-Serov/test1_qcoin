import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './SensorChart.css';

const SensorChart = ({ sensorNumber }) => {
  const canvasRef = useRef(null); // Ссылка на DOM-элемент canvas
  const chartRef = useRef(null);  // Ссылка на экземпляр Chart.js
  const [chartData, setChartData] = useState(null); // Состояние данных для графика
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chartColors = ['#FF6384', '#36A2EB', '#FFCE56', '#DDEE67']; // Цвета для секторов графика
  
  // Получение и перепаковка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
        const response = await axios.post('http://qcan.tactics.su/test_ivan.php?load_data', { sensor: sensorNumber }, config);
        const response2 = await axios.get('http://qcan.tactics.su/test_ivan.php?load_data&status');

        if (response.data.status !== 1 || response2.data.status !== 1) {
          throw new Error('Ошибка получения данных');
        }

        let data = response.data.answer;
        let data2 = response2.data.answer;

        const total = Object.values(data).reduce((acc, value) => acc + value, 0);
        const percentages = {};

        const labels = [];

        for (const key in data2) {
          const value = data[key];
          const percent = ((value / total) * 100).toFixed(2);
          percentages[key] = parseFloat(percent);
          labels.push(data2[key]);
        }

        const dataArr = Object.keys(data2).map((key) => percentages[key]);

        setChartData({ labels, data: dataArr }); // Установка полученных данных в состояние
      } catch (error) {
        console.error(error);
      }
    };

    const fetchDataInterval = setInterval(fetchData, 10000); // Запуск запроса данных каждые 10 секунд

    fetchData(); // Запуск запроса данных

    return () => {
      clearInterval(fetchDataInterval); // Очистка интервала при размонтировании компонента
    };
  }, [sensorNumber]);
  
  // Создание диаграммы
  useEffect(() => {
    if (chartData) {
      if (chartRef.current) {
        chartRef.current.destroy(); // Удаление диаграммы, если она уже существует
      }

      const ctx = canvasRef.current.getContext('2d'); // Получение контекста отрисовки для canvas
      
      const chartConfig = {
        type: 'doughnut', // Тип графика - "донат"
        data: {
          labels: chartData.labels, // Метки для секторов графика
          datasets: [
            {
              label: `Sensor ${sensorNumber}`, // Название датасета
              data: chartData.data, // Данные для секторов графика
              backgroundColor: chartColors,  // Цвета для секторов графика
            },
          ],
        },
        options: {
          maintainAspectRatio: false, // Отключение автоподстройки размеров графика
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label;
                  const percent = chartData.data[context.dataIndex];
                  return `${label}: ${percent}%`; // Форматирование текста всплывающей подсказки
                },
              },
            },
          },
        },
      };

      chartRef.current = new Chart(ctx, chartConfig);
    }
  }, [chartColors, chartData, sensorNumber]);

  return <canvas className="doughnut" ref={canvasRef} />;
};

export default SensorChart;

