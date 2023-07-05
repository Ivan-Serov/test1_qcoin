import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './SensorChart.css';

const SensorChart = ({ sensorNumber }) => {
  const canvasRef = useRef(null); // Ссылка на DOM-элемент canvas
  const chartRef = useRef(null); // Ссылка на экземпляр Chart.js
  const [chartData, setChartData] = useState(null); // Состояние данных для графика
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const chartColors = ['#FF6384', '#36A2EB', '#FFCE56']; // Цвета для секторов графика
  // Получение и перепаковка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } };
        const response = await axios.post('http://qcan.tactics.su/test_ivan.php?load_data', { sensor: sensorNumber }, config);
        const data = response.data;
        //////
        const response2 = await axios.get(`http://qcan.tactics.su/test_ivan.php?load_data&status`);
        const data2 = response2.data;
        //////
        if (data.status !== 1 ||  data2.status !== 1) {
          throw new Error('Ошибка получения данных');
        }

        const labels = [];
        const dataArr = [];

        for (const key in data.answer) {
          dataArr.push(data.answer[key]);
          labels.push(data2.answer[key]);
          //
          
        }
        console.log(data.answer);
        console.log(data2.answer);
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
  // Создание и отображение Диаграммы
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
                backgroundColor: chartColors, // Цвета для секторов графика
              },
            ],
          },
          options: {
            maintainAspectRatio: false, // Отключение автоподстройки размеров графика
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return context.label + ': ' + context.parsed.toFixed(2) + '%'; // Форматирование текста всплывающей подсказки
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
  }, [chartColors, chartData, sensorNumber]);

  return <canvas className="doughnut" ref={canvasRef} />; // Возвращение компонента canvas для отображения графика
};

export default SensorChart;