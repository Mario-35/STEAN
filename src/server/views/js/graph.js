function showGraph(element, infos, value) {
    new Dygraph(
        document.getElementById(element),
        value,
        {
          title: infos[1],
          ylabel: infos[2],
          xlabel: infos[0],
          legend: 'always',
          rollPeriod: 14,
          showRangeSelector: true,
          resizable: "both",
          connectSeparatedPoints: false
        }
    );
}
