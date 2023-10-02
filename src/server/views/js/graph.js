function createOptions(datas) {
    const datasList = [];
    Object.keys(datas["values"]).forEach((element) => {
        datasList.push({
            name: element,
            type: "line",
            symbolSize: 8,
            data: datas["values"][element]
        });
    });
    return {
        tooltip: {
            trigger: "axis",
            axisPointer: {
                animation: false
            }
        },
        title: {
            left: 'center',
            text: datas.title
        },
        legend: {
            data: Object.keys(datas["values"]),
            left: 10
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: { readOnly: true },
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        axisPointer: {
            link: [
                {
                    xAxisIndex: "all"
                }
            ]
        },
        dataZoom: [
            {
                type: "inside",
                realtime: true,
                start: 50,
                end: 100,
            },
            {
                start: 50,
                end: 100,
            }
        ],
        grid: [
            {
                left: 60,
                right: 50,
                height: "75%"
            }
        ],
        xAxis: [
            {
                type: "category",
                boundaryGap: false,
                axisLine: { onZero: true },
                data: datas["dates"]
            }
        ],
        yAxis: [
            {
                name: datas["keys"][0],
                type: "value"
            }
        ],
        series: datasList
    };
}

function showGraph(value) {
    const container = document.getElementById('graph');
    if(container) {
        echarts.dispose(container);
        const myChart = echarts.init(container);
        const option = createOptions(value);
        myChart.on('click', async function(_PARAMS) {
          if (_PARAMS.dataIndex) await editDataClicked(value["ids"][_PARAMS.dataIndex], _PARAMS);
        });
        myChart.setOption(option);
        graphContainer.style.display = "block";
    }
}