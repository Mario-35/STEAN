function showGraph(e,l,t){new Dygraph(document.getElementById(e),t,{title:l[1],ylabel:l[2],xlabel:l[0],legend:"always",rollPeriod:30,showRangeSelector:!0,resizable:"both",connectSeparatedPoints:!1})}