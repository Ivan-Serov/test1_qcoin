import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './SensorChart.css';
import {  chartColors, config, percentages, url} from '../../utils/constants'

const SensorChart = ({ sensorNumber }) => {
  const canvasRef = useRef(null); // Ссылка на DOM-элемент canvas
  const chartRef = useRef(null);  // Ссылка на экземпляр Chart.js
  const [chartData, setChartData] = useState(null); // Состояние данных для графика
  
  // Получение и перепаковка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(url, { sensor: sensorNumber }, config);
        const response2 = await axios.get(`${url}&status`);
        let data = response.data.answer;
        let data2 = response2.data.answer;
        
        let total = Object.values(data).reduce((acc, value) => acc + value, 0);
        let labels = [];

        if (response.data.status !== 1 || response2.data.status !== 1) {
          throw new Error('Ошибка получения данных');
        }

        for (const key in data2) {
          const value = data[key];
          const percent = ((value / total) * 100).toFixed(2);
          percentages[key] = parseFloat(percent);
          labels.push(data2[key]);
        }

        let dataArr = Object.keys(data2).map((key) => percentages[key]);

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
      if (!chartRef.current) { // Если экземпляр Chart.js не был создан
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
                    return  context.parsed.toFixed(2) + '%'; // Форматирование текста всплывающей подсказки
                  },
                },
              },
            },
          },
        };

        chartRef.current = new Chart(ctx, chartConfig); // Создание нового экземлпяра Chart.js и сохранение ссылки
        chartRef.current.update(); // Обновление графика
      } else { // Если экземпляр Chart.js уже существует
        chartRef.current.data.labels = chartData.labels; // Обновление меток секторов графика
        chartRef.current.data.datasets[0].data = chartData.data; // Обновление данных секторов графика
        chartRef.current.update(); // Обновление графика
      }
    }
  }, [chartData, sensorNumber]);

  return <canvas className="doughnut" ref={canvasRef} />; // Возвращение компонента canvas для отображения графика
};


export default SensorChart;

